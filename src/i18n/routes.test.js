import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  LOCALES, PAGES, PAGE_LOCALES, PRODUCT_PATHS, PRODUCT_SEGMENTS, PRODUCT_SLUG_VI, SCOPED_CONTENT_PAGES, canonicalUrl, delocalizePath, legacyRedirect, localizePath, pageLocales,
  isProductSegment, segmentOfPage, switchHref,
} from './routes.js';

test('every page and product round-trips between locales', () => {
  const keys = [...PAGES, ...PRODUCT_PATHS, '/blog/exporting-passion-fruit-eu'];
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
  // Chinese and Korean are not site locales: the navigation, the language switcher and the other pages never offer them.
  assert.deepEqual(LOCALES, ['en', 'vi']);
  const key = '/products/dried-cassava-chips';
  assert.deepEqual(pageLocales(key), ['zh-CN', 'ko']);
  for (const [locale, url] of [['zh-CN', '/zh-cn/cassava-chips'], ['ko', '/ko/tapioca-chips']]) {
    assert.equal(localizePath(key, locale), url);
    assert.deepEqual(delocalizePath(url), { path: key, locale });
    // Pages without that version stay English, never a /zh-cn or /ko URL that does not exist.
    for (const other of [...PAGES, '/products/passion-fruit', '/products/tapioca-starch']) {
      assert.deepEqual(pageLocales(other), [], other);
      assert.equal(localizePath(other, locale), localizePath(other, 'en'), other);
    }
    assert.equal(legacyRedirect(url), null);
    assert.equal(legacyRedirect(url, '?lang=vi'), '/vi/san-pham/san-lat-kho');
    assert.equal(legacyRedirect(url, '?lang=en'), key);
    assert.equal(switchHref(url, '', 'vi'), '/vi/san-pham/san-lat-kho');
  }
  assert.equal(switchHref('/zh-cn/cassava-chips', '', 'ko'), '/ko/tapioca-chips');
  // Site locales are unchanged: the VI cassava URL still maps to its English key.
  assert.deepEqual(delocalizePath('/vi/san-pham/san-lat-kho'), { path: key, locale: 'vi' });
});

// Korean-only original content: its own URL in its one language, not a translation of any page.
test('a standalone content page keeps its URL: no translation, `lang` dropped and nothing else', () => {
  assert.deepEqual(SCOPED_CONTENT_PAGES, [
    { locale: 'ko', path: '/ko/tapioca-market' },
    ...['procurement-guide', 'quality-guide', 'ethanol-guide'].map(slug => ({ locale: 'zh-CN', path: `/zh-cn/cassava-chips/${slug}` })),
    ...['procurement-guide', 'quality-guide', 'ethanol-guide'].map(slug => ({ locale: 'ko', path: `/ko/tapioca-chips/${slug}` })),
  ]);
  assert.deepEqual(LOCALES, ['en', 'vi']);
  for (const { path } of SCOPED_CONTENT_PAGES) {
    assert.ok(!Object.values(PAGE_LOCALES).some(urls => Object.values(urls).includes(path)), path);
    assert.equal(legacyRedirect(path), null, path);
    for (const lang of ['vi', 'en', 'ko', 'zh-CN']) assert.equal(canonicalUrl(path, `?lang=${lang}`), path, lang);
  }
  assert.equal(legacyRedirect('/ko/tapioca-market', '?lang=vi&utm_source=naver'), '/ko/tapioca-market?utm_source=naver');
  // The Chinese guides sit under the Chinese supply page's URL, which keeps its translation group.
  assert.equal(legacyRedirect('/zh-cn/cassava-chips', '?lang=en'), '/products/dried-cassava-chips');
  // The Korean supply page keeps its translation group; its guides are Korean-only pages beneath it.
  assert.equal(legacyRedirect('/ko/tapioca-chips', '?lang=vi'), '/vi/san-pham/san-lat-kho');
  assert.equal(legacyRedirect('/ko/tapioca-chips/quality-guide', '?lang=vi&utm_source=naver'), '/ko/tapioca-chips/quality-guide?utm_source=naver');
});

test('golden passion fruit has one URL per buyer segment, in both languages', () => {
  const urls = [
    ['/products/passion-fruit', '/vi/san-pham/chanh-day'],
    ['/products/passion-fruit/foodservice', '/vi/san-pham/chanh-day/khach-san-nha-hang'],
    ['/products/passion-fruit/retail', '/vi/san-pham/chanh-day/doi-tac-ban-le'],
  ];
  for (const [en, vi] of urls) {
    assert.equal(localizePath(en, 'vi'), vi);
    assert.deepEqual(delocalizePath(vi), { path: en, locale: 'vi' });
    // Switching language keeps the segment, and the query.
    assert.equal(switchHref(vi, '?utm_source=li', 'en'), `${en}?utm_source=li`);
    assert.equal(switchHref(en, '', 'vi'), vi);
    assert.equal(legacyRedirect(en), null);
    assert.equal(legacyRedirect(vi), null);
  }
  // The legacy forms and `lang` resolve to the segment's final URL in one step.
  assert.equal(legacyRedirect('/vi/products/passion-fruit/retail'), '/vi/san-pham/chanh-day/doi-tac-ban-le');
  assert.equal(legacyRedirect('/products/passion-fruit/foodservice', '?lang=vi'), '/vi/san-pham/chanh-day/khach-san-nha-hang');
  // A segment named in the wrong form is no page and is not redirected to one: not an English key under /vi/san-pham, not a
  // Vietnamese slug under the English path, not a segment of a product that has none.
  for (const url of ['/vi/san-pham/chanh-day/foodservice', '/vi/san-pham/chanh-day/retail', '/vi/san-pham/chuoi-cavendish/doi-tac-ban-le']) {
    // `lang` is dropped as on every URL, but the path stays what it was: it ends in the 404.
    assert.equal(legacyRedirect(url, '?lang=vi'), url, url);
    assert.equal(legacyRedirect(url), null, url);
  }
  assert.deepEqual(Object.keys(PRODUCT_SEGMENTS), ['passion-fruit']);
  assert.deepEqual(PRODUCT_PATHS.filter(p => p.includes('passion-fruit')), urls.map(([en]) => en));
});

// Names every object inherits are not products, segments or pages: a lookup finds only what the contract declares, so such
// a URL stays what it is (the 404) and never becomes "function Object() …" in a link, a redirect or a canonical.
const INHERITED = ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__', 'prototype', 'isPrototypeOf', 'propertyIsEnumerable'];

test('inherited names are not products or segments in any direction: no redirect, no rewritten URL, no exception', () => {
  for (const name of INHERITED) {
    for (const url of [
      `/products/${name}`, `/products/${name}/foodservice`, `/products/passion-fruit/${name}`, `/vi/san-pham/${name}`, `/vi/san-pham/${name}/doi-tac-ban-le`,
      `/vi/san-pham/chanh-day/${name}`, `/vi/products/${name}`, `/vi/products/passion-fruit/${name}`, `/${name}`, `/vi/${name}`, `/blog/${name}`, `/vi/tin-tuc/${name}`,
    ]) {
      assert.doesNotThrow(() => canonicalUrl(url), url);
      // The legacy /vi/products form redirects to its final form for any slug, as before; no URL is ever built from what the name inherits.
      if (!url.startsWith('/vi/products/')) assert.equal(legacyRedirect(url), null, url);
      for (const made of [legacyRedirect(url) ?? '', canonicalUrl(url, '?lang=vi'), switchHref(url, '', 'vi')]) assert.ok(!made.includes('function') && !made.includes('[object'), url);
    }
    assert.equal(localizePath(`/products/${name}`, 'vi'), `/vi/san-pham/${name}`);
    assert.equal(localizePath(`/products/passion-fruit/${name}`, 'vi'), `/vi/san-pham/chanh-day/${name}`);
    assert.equal(localizePath(`/products/${name}/retail`, 'vi'), `/vi/san-pham/${name}/retail`);
    assert.equal(delocalizePath(`/vi/san-pham/${name}`).path, `/products/${name}`);
    assert.equal(delocalizePath(`/vi/san-pham/chanh-day/${name}`).path, `/san-pham/chanh-day/${name}`);
    assert.equal(isProductSegment('passion-fruit', name), false, name);
    assert.equal(isProductSegment(name, 'retail'), false, name);
    assert.deepEqual(pageLocales(name), []);
  }
  assert.equal(isProductSegment('passion-fruit', 'retail'), true);
  assert.equal(isProductSegment('passion-fruit', 'export'), false);
  assert.equal(isProductSegment('bananas', 'retail'), false);
  assert.equal(isProductSegment('passion-fruit', ['retail']), false);
  assert.equal(isProductSegment('passion-fruit', undefined), false);
});

test('unknown products and segments, wrong-form segments and ?lang= keep their URL; the known pages and page-scoped locales are unchanged', () => {
  for (const url of ['/products/no-such-product', '/products/no-such-product/retail', '/vi/san-pham/khong-co', '/vi/san-pham/chanh-day/khong-co', '/products/passion-fruit/export', '/products/passion-fruit/khach-san-nha-hang', '/vi/san-pham/chanh-day/retail']) {
    assert.equal(legacyRedirect(url), null, url);
  }
  // `lang` is dropped and chooses the language, but a segment named in the wrong form stays no page.
  assert.equal(legacyRedirect('/vi/san-pham/chanh-day/retail', '?lang=vi'), '/vi/san-pham/chanh-day/retail');
  assert.equal(legacyRedirect('/products/passion-fruit/khach-san-nha-hang', '?lang=en'), '/products/passion-fruit/khach-san-nha-hang');
  assert.equal(canonicalUrl('/products/passion-fruit/retail', '?lang=vi'), '/vi/san-pham/chanh-day/doi-tac-ban-le');
  assert.equal(canonicalUrl('/vi/san-pham/chanh-day/doi-tac-ban-le', '?lang=en'), '/products/passion-fruit/retail');
  assert.deepEqual(pageLocales('/products/dried-cassava-chips'), ['zh-CN', 'ko']);
  assert.equal(localizePath('/products/dried-cassava-chips', 'zh-CN'), '/zh-cn/cassava-chips');
  assert.equal(delocalizePath('/ko/tapioca-chips').path, '/products/dried-cassava-chips');
  assert.equal(legacyRedirect('/products'), '/trade-solutions');
});

test('the segment of a page: the product’s own URL is export, a segment page its segment, in both languages; nothing else has one', () => {
  for (const [url, segment] of [
    ['/products/passion-fruit', 'export'], ['/products/passion-fruit/', 'export'], ['/vi/san-pham/chanh-day', 'export'], ['/vi/san-pham/chanh-day/', 'export'],
    ['/products/passion-fruit/foodservice', 'foodservice'], ['/vi/san-pham/chanh-day/khach-san-nha-hang', 'foodservice'],
    ['/products/passion-fruit/retail', 'retail'], ['/vi/san-pham/chanh-day/doi-tac-ban-le', 'retail'], ['/vi/products/passion-fruit/retail', 'retail'],
  ]) assert.equal(segmentOfPage(url), segment, url);
  for (const url of [
    '/', '/about', '/products', '/products/bananas', '/products/dried-cassava-chips', '/vi/san-pham/chuoi-cavendish', '/products/passion-fruit/export', '/products/passion-fruit/wholesale',
    '/vi/san-pham/chanh-day/retail', '/products/passion-fruit/retail/extra', '/blog/exporting-passion-fruit-eu', '/products/constructor', '/products/passion-fruit/constructor', '/products/passion-fruit/__proto__',
  ]) assert.equal(segmentOfPage(url), undefined, url);
  assert.equal(segmentOfPage('/products/bananas', 'bananas'), undefined);
  assert.equal(segmentOfPage('/products/passion-fruit', 'constructor'), undefined);
});
