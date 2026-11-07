import { test } from 'vitest';
import assert from 'node:assert/strict';
import { PRODUCT_SLUG_VI, canonicalUrl, delocalizePath, legacyRedirect, localizePath, switchHref } from './routes.js';

const PAGES = ['/', '/about', '/supply-chain', '/trade-solutions', '/activities', '/contact', '/insights',
  '/regulations', '/logistics', '/packaging-logistics'];

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
  // Known alternate slug: link straight to it.
  assert.equal(switchHref('/vi/tin-tuc/xuat-khau-chanh-day-eu', '?lang=vi', 'en'), '/blog/exporting-passion-fruit-eu');
  assert.equal(switchHref('/blog/exporting-passion-fruit-eu', '', 'vi'), '/vi/tin-tuc/xuat-khau-chanh-day-eu');
  assert.equal(
    switchHref('/vi/contact', '?product=Passion%20fruit&lang=vi&utm_campaign=q4', 'en'),
    '/contact?product=Passion+fruit&utm_campaign=q4',
  );
  assert.equal(switchHref('/vi', '', 'en'), '/');
});
