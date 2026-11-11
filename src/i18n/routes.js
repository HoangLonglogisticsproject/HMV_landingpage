// Locale URL contract (docs/architecture/SEO_I18N_GEO_SPEC.md §2), shared by the Vite app, the Next.js app
// (pages, proxy, next.config) and the tests. Pure: no React, no framework, relative imports only, so every
// runtime can load it as-is.
import { findArticle } from '../data/articles.js';

export const LOCALES = ['en', 'vi'];

// Every page's English key path. Products and articles add one key path per item (/products/<id>, /blog/<slug>).
export const PAGES = ['/', '/about', '/supply-chain', '/trade-solutions', '/activities', '/contact', '/insights',
  '/regulations', '/logistics', '/packaging-logistics'];

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

// Collection URLs without a page of their own, keyed by English path.
export const INDEX_ALIASES = { '/products': '/trade-solutions', '/blog': '/insights' };

export const localeOf = pathname => (pathname === '/vi' || pathname.startsWith('/vi/') ? 'vi' : 'en');

// Bundled articles have a known slug pair, so links and redirects go straight to the alternate.
// CMS slugs are not known here: they keep their slug and the article route resolves them.
const articleSlug = (slug, locale) => findArticle(slug)?.slug[locale] ?? slug;

/** URL of an English key path ('/about', '/products/<id>', '/blog/<slug>') in `locale`. */
export function localizePath(path, locale) {
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
