// Client for the CMS public article API (CMS_HMV docs/api/public-content-contract.md).
// Same-origin path: the dev/preview server proxies it (vite.config.js); production needs a host rewrite.
// Plain .js with relative imports so `node --test` can load it.
import { isSafeSrc } from './RichText.js';

const BASE = '/api/v1/public';

async function getJson(path, params, signal) {
  const res = await fetch(`${BASE}${path}?${new URLSearchParams(params)}`, {
    // Public content needs no identity: never send the admin session cookie (localhost cookies ignore the port).
    credentials: 'omit',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw Object.assign(new Error(`CMS ${res.status} for ${path}`), { status: res.status });
  return res.json();
}

const isArticle = a => typeof a?.slug === 'string' && typeof a?.title === 'string';
const malformed = () => Object.assign(new Error('Malformed CMS response'), { status: 0 });

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
