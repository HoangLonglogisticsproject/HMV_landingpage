// EcoNews from the CMS public article API (CMS_HMV docs/api/public-content-contract.md): DTO validation, the view
// shape and slug resolution. No React, no framework: any consumer with a transport can use it.
// Plain .js with relative imports so `node --test` can load it.
import { cmsError, isCmsSlug, malformed } from '../../lib/cms.js';
import { isSafeSrc } from '../../lib/safeUrl.js';
import { LOCALES } from '../../i18n/routes.js';

const isArticle = a => typeof a?.slug === 'string' && typeof a?.title === 'string';

const MONTH = { month: 'long', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
// Matches the static article labels: "October 2026" / "Tháng 10, 2026".
function dateLabel(iso, lang) {
  const d = new Date(iso ?? NaN);
  if (Number.isNaN(d.getTime())) return '';
  if (lang !== 'vi') return new Intl.DateTimeFormat('en-US', MONTH).format(d);
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { ...MONTH, month: 'numeric' }).formatToParts(d).map(x => [x.type, x.value]));
  return `Tháng ${p.month}, ${p.year}`;
}

// CMS DTO → the single-locale shape the EcoNews pages render (static articles map to the same shape).
// `alternates`: slug per locale, this one included; list items carry only their own.
function toView(a, lang) {
  const cover = a.cover && isSafeSrc(a.cover.url) ? a.cover : null;
  const alternates = (a.alternates ?? []).filter(x => LOCALES.includes(x?.locale) && typeof x.slug === 'string');
  return {
    key: a.id ?? a.slug,
    slug: a.slug,
    alternates: { ...Object.fromEntries(alternates.map(x => [x.locale, x.slug])), [lang]: a.slug },
    title: a.title,
    metaTitle: a.seo?.title ?? a.title,
    description: a.seo?.description ?? a.excerpt ?? '',
    category: a.category?.name ?? '',
    author: a.authorName || null,
    date: { iso: a.publishedAt ?? undefined, label: dateLabel(a.publishedAt, lang) },
    image: cover && { src: cover.url, width: cover.width, height: cover.height, alt: cover.alt ?? '' },
    content: a.content ?? null,
    cta: null,
  };
}

/**
 * @typedef {ReturnType<typeof toView>} Article
 * @typedef {{ status: 'ready', article: Article } | { status: 'redirect', to: string }
 *   | { status: 'unavailable', locale: string } | { status: 'not-found' }} ArticleResolution
 */

// `get` in every function below: a CMS transport (lib/cms.js).
const listItems = body => {
  if (!Array.isArray(body?.items) || !body.items.every(isArticle)) throw malformed();
  return body.items;
};

/** @returns {Promise<Article[]>} */
export async function fetchArticles(get, { locale, pageSize }) {
  return listItems(await get('/articles', { locale, pageSize })).map(a => toView(a, locale));
}

// The CMS serves at most 100 articles per page (CMS_HMV PageQuery), so the index pages through each locale and the
// sitemap and generateStaticParams miss none. MAX_INDEX_PAGES bounds a wrong `total`: past it the index fails (the
// last good sitemap stays) instead of being cut silently.
const MAX_INDEX_PAGES = 50;

/** Every published article as `{ en?: slug, vi?: slug }`, paired by the CMS id that translations share. */
export async function fetchArticleIndex(get, { pageSize }) {
  const byKey = new Map();
  for (const locale of LOCALES) {
    for (let page = 1, pages = 1; page <= pages; page++) {
      // Page 1 without `page`: the same request, and the same data cache entry, as the EcoNews list.
      const body = await get('/articles', page === 1 ? { locale, pageSize } : { locale, page, pageSize });
      const items = listItems(body);
      if (!Number.isInteger(body.total) || body.total < 0) throw malformed();
      pages = Math.ceil(body.total / pageSize);
      if (pages > MAX_INDEX_PAGES) throw cmsError(0, `Article index over ${MAX_INDEX_PAGES} pages`);
      for (const a of items.map(x => toView(x, locale))) byKey.set(a.key, { ...byKey.get(a.key), [locale]: a.slug });
      if (!items.length) break;
    }
  }
  return [...byKey.values()];
}

async function fetchArticle(get, slug, locale) {
  const a = await get(`/articles/${encodeURIComponent(slug)}`, { locale });
  if (!isArticle(a)) throw malformed();
  return a;
}

// CMS slugs differ per locale, so a slug may belong to the other language (a shared link, a switch, or the
// locale-free Vite URL). Resolve it through `alternates`; never show the other language's content on its own.
// `redirect.to` is an English key path (/blog/<slug>); each adapter localizes it.
/** @returns {Promise<ArticleResolution>} */
export async function resolveArticle(get, { slug, lang }) {
  if (!isCmsSlug(slug)) return { status: 'not-found' };
  try {
    return { status: 'ready', article: toView(await fetchArticle(get, slug, lang), lang) };
  } catch (e) {
    if (e.status !== 404) throw e;
  }
  const other = lang === 'vi' ? 'en' : 'vi';
  let found;
  try {
    found = await fetchArticle(get, slug, other);
  } catch (e) {
    if (e.status === 404) return { status: 'not-found' };
    throw e;
  }
  const alt = found.alternates?.find(x => x.locale === lang)?.slug;
  // alt === slug only happens with a stale cached 404; redirecting would loop.
  return alt && alt !== slug ? { status: 'redirect', to: `/blog/${alt}` } : { status: 'unavailable', locale: other };
}
