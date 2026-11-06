// EcoNews from the CMS public article API (CMS_HMV docs/api/public-content-contract.md).
// Plain .js with relative imports so `node --test` can load it.
import { getJson, malformed } from '../../lib/cms.js';
import { isSafeSrc } from './RichText.js';

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
function toView(a, lang) {
  const cover = a.cover && isSafeSrc(a.cover.url) ? a.cover : null;
  return {
    key: a.id ?? a.slug,
    slug: a.slug,
    title: a.title,
    metaTitle: a.seo?.title ?? a.title,
    description: a.seo?.description ?? a.excerpt ?? '',
    category: a.category?.name ?? '',
    date: { iso: a.publishedAt ?? undefined, label: dateLabel(a.publishedAt, lang) },
    image: cover && { src: cover.url, width: cover.width, height: cover.height, alt: cover.alt ?? '' },
    content: a.content ?? null,
    cta: null,
  };
}

export async function fetchArticles({ locale, pageSize, signal }) {
  const body = await getJson('/articles', { locale, pageSize }, signal);
  if (!Array.isArray(body?.items) || !body.items.every(isArticle)) throw malformed();
  return body.items.map(a => toView(a, locale));
}

async function fetchArticle(slug, locale, signal) {
  const a = await getJson(`/articles/${encodeURIComponent(slug)}`, { locale }, signal);
  if (!isArticle(a)) throw malformed();
  return a;
}

// URLs are locale-free (/blog/:slug) but CMS slugs differ per locale, so a slug may belong to the other
// language (a shared link, or the visitor just switched). Resolve it through `alternates`; never show
// the other language's content on its own.
export async function resolveArticle({ slug, lang, signal }) {
  try {
    return { status: 'ready', article: toView(await fetchArticle(slug, lang, signal), lang) };
  } catch (e) {
    if (e.status !== 404) throw e;
  }
  const other = lang === 'vi' ? 'en' : 'vi';
  let found;
  try {
    found = await fetchArticle(slug, other, signal);
  } catch (e) {
    if (e.status === 404) return { status: 'not-found' };
    throw e;
  }
  const alt = found.alternates?.find(x => x.locale === lang)?.slug;
  // alt === slug only happens with a stale cached 404; redirecting would loop.
  return alt && alt !== slug ? { status: 'redirect', to: `/blog/${alt}` } : { status: 'unavailable', locale: other };
}
