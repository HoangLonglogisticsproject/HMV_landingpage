import { test } from 'vitest';
import assert from 'node:assert/strict';
import { LOCALES, PAGES, PRODUCT_SLUG_VI, canonicalUrl, delocalizePath, legacyRedirect, localizePath, pageLocales, switchHref } from './routes.js';

test('every page and product round-trips between locales', () => {
  const keys = [...PAGES, ...Object.keys(PRODUCT_SLUG_VI).map(id => `/products/${id}`), '/blog/exporting-passion-fruit-eu'];
  for (const key of keys) {
    assert.equal(localizePath(key, 'en'), key);
    const back = delocalizePath(localizePath(key, 'vi'));
    assert.equal(back.locale, 'vi');
    assert.equal(localizePath(back.path, 'en'), key);
  }
  assert.equal(localizePath('/', 'vi'), '/vi');
  assert.equal(localizePath('/products/passion-fruit', 'vi'), '/vi/san-pham/chanh-day');
  // Dried cassava chips and tapioca starch are separate products with separate URLs.
  assert.equal(localizePath('/products/dried-cassava-chips', 'vi'), '/vi/san-pham/san-lat-kho');
  assert.equal(localizePath('/products/tapioca-starch', 'vi'), '/vi/san-pham/tinh-bot-san');
  assert.equal(localizePath('/blog/exporting-passion-fruit-eu', 'vi'), '/vi/tin-tuc/xuat-khau-chanh-day-eu');
  // Unknown (CMS) slugs keep their slug; the article route resolves them.
  assert.equal(localizePath('/blog/cms-only-slug', 'vi'), '/vi/tin-tuc/cms-only-slug');
});

// Matrix rows that the proxy and next.config resolve without CMS data (URL_MIGRATION_MATRIX.md).
const LEGACY = [
  ['/about?lang=vi', '/vi/about'],
  ['/?lang=vi', '/vi'],
  ['/vi?lang=en', '/'],
  ['/vi/about?lang=en', '/about'],
  ['/about?lang=xx', '/about'],
  ['/vi/about?lang=vi', '/vi/about'],
  ['/en', '/'],
  ['/en/about', '/about'],
  ['/en/about?lang=vi', '/vi/about'],
  ['/index.html', '/'],
  ['/vi/products/passion-fruit', '/vi/san-pham/chanh-day'],
  ['/vi/products/nuts?utm_source=x', '/vi/san-pham/hat-dieu?utm_source=x'],
  ['/products/nuts?lang=vi', '/vi/san-pham/hat-dieu'],
  ['/en/products/nuts?lang=vi', '/vi/san-pham/hat-dieu'],
  ['/products?lang=vi', '/vi/trade-solutions'],
  ['/products', '/trade-solutions'],
  ['/vi/san-pham', '/vi/trade-solutions'],
  ['/vi/products', '/vi/trade-solutions'],
  ['/blog', '/insights'],
  ['/vi/tin-tuc', '/vi/insights'],
  ['/vi/blog/xuat-khau-chanh-day-eu', '/vi/tin-tuc/xuat-khau-chanh-day-eu'],
  ['/vi/blog/exporting-passion-fruit-eu', '/vi/tin-tuc/xuat-khau-chanh-day-eu'],
  ['/en/blog/xuat-khau-chanh-day-eu', '/blog/exporting-passion-fruit-eu'],
  ['/blog/xuat-khau-chanh-day-eu', '/blog/exporting-passion-fruit-eu'],
  ['/blog/exporting-passion-fruit-eu?lang=vi', '/vi/tin-tuc/xuat-khau-chanh-day-eu'],
  ['/vi/blog/cms-slug', '/vi/tin-tuc/cms-slug'],
  ['/contact?product=Passion%20fruit&utm_source=li&lang=vi', '/vi/contact?product=Passion+fruit&utm_source=li'],
];

test('legacy URLs resolve to their final URL in one step, without `lang`', () => {
  for (const [from, to] of LEGACY) {
    const [path, query = ''] = from.split('?');
    assert.equal(legacyRedirect(path, query && `?${query}`), to, from);
  }
});

test('canonical URLs do not redirect again (no chains, no loops)', () => {
  const canonical = [...LEGACY.map(([, to]) => to), '/vi/contact?product=Passion%20fruit', '/contact?utm_source=x'];
  for (const url of canonical) {
    const [path, query = ''] = url.split('?');
    assert.equal(legacyRedirect(path, query && `?${query}`), null, url);
    assert.equal(canonicalUrl(path, query), canonicalUrl(...(canonicalUrl(path, query).split('?'))), url);
  }
});

test('the language switch drops `lang` and keeps meaningful parameters', () => {
  // Regression: /about?lang=vi, then "English", must end on English, not bounce back to Vietnamese.
  assert.equal(switchHref('/vi/about', '?lang=vi', 'en'), '/about');
  assert.equal(switchHref('/about', '?lang=vi', 'en'), '/about');
  assert.equal(switchHref('/about', '', 'vi'), '/vi/about');
  assert.equal(switchHref('/vi/san-pham/chanh-day', '?lang=vi', 'en'), '/products/passion-fruit');
  assert.equal(switchHref('/products/passion-fruit', '?utm_source=li', 'vi'), '/vi/san-pham/chanh-day?utm_source=li');
  assert.equal(switchHref('/products/dried-cassava-chips', '', 'vi'), '/vi/san-pham/san-lat-kho');
  assert.equal(switchHref('/vi/san-pham/san-lat-kho', '?lang=vi', 'en'), '/products/dried-cassava-chips');
  // Known alternate slug: link straight to it.
  assert.equal(switchHref('/vi/tin-tuc/xuat-khau-chanh-day-eu', '?lang=vi', 'en'), '/blog/exporting-passion-fruit-eu');
  assert.equal(switchHref('/blog/exporting-passion-fruit-eu', '', 'vi'), '/vi/tin-tuc/xuat-khau-chanh-day-eu');
  assert.equal(
    switchHref('/vi/contact', '?product=Passion%20fruit&lang=vi&utm_campaign=q4', 'en'),
    '/contact?product=Passion+fruit&utm_campaign=q4',
  );
  assert.equal(switchHref('/vi', '', 'en'), '/');
});

test('every product has exactly one Vietnamese slug, and the slugs are unique', async () => {
  const { products } = await import('../data/hmv.js');
  assert.deepEqual(Object.keys(PRODUCT_SLUG_VI).sort(), products.map(p => p.id).sort());
  assert.equal(new Set(Object.values(PRODUCT_SLUG_VI)).size, products.length);
});

// Page-scoped locales: the Chinese cassava page joins its EN/VI pair; every other page and locale is unaffected.
test('a page-scoped locale has its own URL for its page only, and maps back to it', () => {
  // Chinese is not a site locale: the navigation, the language switcher and the other pages never offer it.
  assert.deepEqual(LOCALES, ['en', 'vi']);
  const key = '/products/dried-cassava-chips';
  assert.deepEqual(pageLocales(key), ['zh-CN']);
  assert.equal(localizePath(key, 'zh-CN'), '/zh-cn/cassava-chips');
  assert.deepEqual(delocalizePath('/zh-cn/cassava-chips'), { path: key, locale: 'zh-CN' });
  // Pages without a Chinese version stay English, never a /zh-cn URL that does not exist.
  for (const other of [...PAGES, '/products/passion-fruit', '/products/tapioca-starch']) {
    assert.deepEqual(pageLocales(other), [], other);
    assert.equal(localizePath(other, 'zh-CN'), localizePath(other, 'en'), other);
  }
  assert.equal(legacyRedirect('/zh-cn/cassava-chips'), null);
  assert.equal(legacyRedirect('/zh-cn/cassava-chips', '?lang=vi'), '/vi/san-pham/san-lat-kho');
  assert.equal(legacyRedirect('/zh-cn/cassava-chips', '?lang=en'), key);
  assert.equal(switchHref('/zh-cn/cassava-chips', '', 'vi'), '/vi/san-pham/san-lat-kho');
  // Site locales are unchanged: the VI cassava URL still maps to its English key.
  assert.deepEqual(delocalizePath('/vi/san-pham/san-lat-kho'), { path: key, locale: 'vi' });
});
