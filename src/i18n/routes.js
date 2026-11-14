// Locale URL contract (docs/architecture/SEO_I18N_GEO_SPEC.md §2), shared by the Vite app, the Next.js app
// (pages, proxy, next.config) and the tests. Pure: no React, no framework, relative imports only, so every
// runtime can load it as-is.
import { findArticle } from '../data/articles.js';

export const LOCALES = ['en', 'vi'];

// Every page's English key path. Products and articles add one key path per item (/products/<id>, /blog/<slug>).
export const PAGES = ['/', '/about', '/supply-chain', '/trade-solutions', '/activities', '/contact', '/insights',
  '/regulations', '/logistics', '/packaging-logistics', '/privacy'];

// English product id (unchanged URLs) → Vietnamese slug, transliterated from the names in data/hmv.js.
/** @type {Record<string, string>} */
export const PRODUCT_SLUG_VI = {
  'passion-fruit': 'chanh-day',
  'dried-cassava-chips': 'san-lat-kho',
  bananas: 'chuoi-cavendish',
  'dragon-fruit': 'thanh-long',
  spices: 'gia-vi',
  nuts: 'hat-dieu',
  'tapioca-starch': 'tinh-bot-san',
};
const PRODUCT_ID = Object.fromEntries(Object.entries(PRODUCT_SLUG_VI).map(([id, slug]) => [slug, id]));

// Page-scoped locales: single pages that also exist in a language outside LOCALES, by English key path → that page's
// URL. Only these pages carry the language in hreflang and the sitemap; the navigation, the language switcher and every
// other page keep to LOCALES, so no link points to a translation that does not exist.
/** @type {Record<string, Record<string, string>>} */
export const PAGE_LOCALES = {
  '/products/dried-cassava-chips': { 'zh-CN': '/zh-cn/cassava-chips', ko: '/ko/tapioca-chips' },
};
const PAGE_LOCALE_URLS = Object.fromEntries(Object.entries(PAGE_LOCALES).flatMap(([path, urls]) =>
  Object.entries(urls).map(([locale, url]) => [url, { path, locale }])));

/** The page-scoped locales of the page at English key path `path`. */
export const pageLocales = path => Object.keys(PAGE_LOCALES[path] ?? {});

// Collection URLs without a page of their own, keyed by English path.
export const INDEX_ALIASES = { '/products': '/trade-solutions', '/blog': '/insights' };

export const localeOf = pathname => (pathname === '/vi' || pathname.startsWith('/vi/') ? 'vi' : 'en');

// Bundled articles have a known slug pair, so links and redirects go straight to the alternate.
// CMS slugs are not known here: they keep their slug and the article route resolves them.
const articleSlug = (slug, locale) => findArticle(slug)?.slug[locale] ?? slug;

/**
 * URL of an English key path ('/about', '/products/<id>', '/blog/<slug>') in `locale`. A page-scoped locale has its
 * own URL for its pages only; any other page stays English.
 */
export function localizePath(path, locale) {
  const scoped = PAGE_LOCALES[path]?.[locale];
  if (scoped) return scoped;
  const product = path.match(/^\/products\/([^/]+)$/)?.[1];
  const slug = path.match(/^\/blog\/([^/]+)$/)?.[1];
  if (locale !== 'vi') return slug ? `/blog/${articleSlug(slug, 'en')}` : path;
  if (path === '/') return '/vi';
  if (product) return `/vi/san-pham/${PRODUCT_SLUG_VI[product] ?? product}`;
  if (path === '/products') return '/vi/san-pham';
  if (slug) return `/vi/tin-tuc/${articleSlug(slug, 'vi')}`;
  if (path === '/blog') return '/vi/tin-tuc';
  return `/vi${path}`;
}

/** English key path and locale of a URL path, including legacy forms (/index.html, /en/…, /vi/products/…, /vi/blog/…). */
export function delocalizePath(pathname) {
  let p = pathname === '/index.html' ? '/' : pathname;
  if (p === '/en' || p.startsWith('/en/')) p = p.slice(3) || '/';
  if (PAGE_LOCALE_URLS[p]) return PAGE_LOCALE_URLS[p];
  if (localeOf(p) !== 'vi') return { path: p, locale: 'en' };
  const rest = p.slice(3) || '/';
  const [, collection, slug] = rest.match(/^\/(san-pham|products|tin-tuc|blog)(?:\/([^/]+))?$/) ?? [];
  if (!collection) return { path: rest, locale: 'vi' };
  if (collection === 'san-pham' || collection === 'products') {
    return { path: slug ? `/products/${PRODUCT_ID[slug] ?? slug}` : '/products', locale: 'vi' };
  }
  return { path: slug ? `/blog/${slug}` : '/blog', locale: 'vi' };
}

const withQuery = (path, params) => {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

/** Canonical URL of a request: legacy prefixes, `?lang=` and collection aliases resolved in one step, `lang` dropped. */
export function canonicalUrl(pathname, search = '') {
  const params = new URLSearchParams(search);
  const requested = params.get('lang');
  params.delete('lang');
  const { path, locale } = delocalizePath(pathname);
  return withQuery(localizePath(INDEX_ALIASES[path] ?? path, LOCALES.includes(requested) ? requested : locale), params);
}

/** Redirect target for a legacy URL, or null when the URL is already canonical. */
export function legacyRedirect(pathname, search = '') {
  const target = canonicalUrl(pathname, search);
  return target === withQuery(pathname, new URLSearchParams(search)) ? null : target;
}

/** The current page in `locale`: `lang` dropped, other query parameters kept. The caller appends the #hash. */
export function switchHref(pathname, search, locale) {
  const params = new URLSearchParams(search);
  params.delete('lang');
  return withQuery(localizePath(delocalizePath(pathname).path, locale), params);
}
