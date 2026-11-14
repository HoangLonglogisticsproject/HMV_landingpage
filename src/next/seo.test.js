import { test } from 'vitest';
import assert from 'node:assert/strict';
import { products } from '../data/hmv.js';
import { productMeta } from '../views/meta.js';
import { absoluteUrl, pageMetadata } from './seo';

const SITE = 'https://www.hmv-global.com';

test('absolute URLs: the www origin over https, the root without a trailing slash', () => {
  assert.equal(absoluteUrl('/', 'en'), SITE);
  assert.equal(absoluteUrl('/', 'vi'), `${SITE}/vi`);
  assert.equal(absoluteUrl('/products/dried-cassava-chips', 'vi'), `${SITE}/vi/san-pham/san-lat-kho`);
});

// The money pages and the search intent their title leads with.
const MONEY = [
  ['dried-cassava-chips', 'en', '/products/dried-cassava-chips', /^Dried Cassava Chips Supplier in Vietnam\b/],
  ['dried-cassava-chips', 'vi', '/vi/san-pham/san-lat-kho', /^Nhà cung cấp sắn lát khô B2B\b/],
  ['passion-fruit', 'en', '/products/passion-fruit', /^Vietnam Passion Fruit Supplier\b/],
  ['passion-fruit', 'vi', '/vi/san-pham/chanh-day', /^Nguồn chanh dây Việt Nam\b/],
];

test('money pages: intent-led title and description within SERP length, unique; self canonical; hreflang set; OG and Twitter', () => {
  const metas = MONEY.map(([id, lang, url, intent]) => {
    const { title, description } = productMeta(lang, products.find(p => p.id === id));
    assert.match(title, intent);
    // ponytail: characters, not pixels; Google cuts at roughly 600 px, about 60-70 characters.
    assert.ok(`${title} | HMV Global`.length <= 70, `${url} title: ${title}`);
    assert.ok(description.length <= 160, `${url} description: ${description.length}`);
    const m = pageMetadata({ lang, path: `/products/${id}`, title, description });
    const pair = MONEY.filter(row => row[0] === id).map(([, l, u]) => [l, SITE + u]);
    assert.equal(m.alternates.canonical, SITE + url);
    // Dried cassava chips also has its page-scoped Chinese and Korean versions (tested below).
    const scoped = id === 'dried-cassava-chips' ? { 'zh-CN': `${SITE}/zh-cn/cassava-chips`, ko: `${SITE}/ko/tapioca-chips` } : {};
    assert.deepEqual(m.alternates.languages, { ...Object.fromEntries(pair), ...scoped, 'x-default': pair.find(([l]) => l === 'en')[1] });
    assert.equal(m.openGraph.url, SITE + url);
    assert.deepEqual([m.openGraph.title, m.openGraph.description], [`${title} | HMV Global`, description]);
    assert.deepEqual([m.twitter.card, m.twitter.title, m.twitter.description], ['summary_large_image', `${title} | HMV Global`, description]);
    return m;
  });
  assert.equal(new Set(metas.map(m => m.title)).size, MONEY.length);
  assert.equal(new Set(metas.map(m => m.description)).size, MONEY.length);
});

// The page-scoped Chinese and Korean cassava pages: one reciprocal hreflang set of four, on these pages only.
test('Chinese and Korean cassava pages: self canonical, EN/VI/zh-CN/ko/x-default on the four cassava pages only', async () => {
  const { cassavaChina } = await import('../data/cassavaChina.js');
  const { cassavaKorea } = await import('../data/cassavaKorea.js');
  const set = {
    en: `${SITE}/products/dried-cassava-chips`,
    vi: `${SITE}/vi/san-pham/san-lat-kho`,
    'zh-CN': `${SITE}/zh-cn/cassava-chips`,
    ko: `${SITE}/ko/tapioca-chips`,
    'x-default': `${SITE}/products/dried-cassava-chips`,
  };
  const zh = pageMetadata({ lang: 'zh-CN', path: '/products/dried-cassava-chips', ...cassavaChina.seo });
  assert.equal(zh.title, '越南木薯干片供应商与工厂批量采购方案');
  assert.equal(zh.alternates.canonical, set['zh-CN']);
  assert.deepEqual(zh.alternates.languages, set);
  assert.deepEqual([zh.openGraph.url, zh.openGraph.locale, zh.openGraph.alternateLocale], [set['zh-CN'], 'zh_CN', ['en_US', 'vi_VN', 'ko_KR']]);
  const ko = pageMetadata({ lang: 'ko', path: '/products/dried-cassava-chips', ...cassavaKorea.seo });
  assert.equal(ko.title, '베트남 타피오카 칩 공급 - 주정·에탄올·사료 제조사용 원료');
  assert.equal(ko.alternates.canonical, set.ko);
  assert.deepEqual(ko.alternates.languages, set);
  assert.deepEqual([ko.openGraph.url, ko.openGraph.locale, ko.openGraph.alternateLocale], [set.ko, 'ko_KR', ['en_US', 'vi_VN', 'zh_CN']]);
  for (const lang of ['en', 'vi']) {
    const m = pageMetadata({ lang, path: '/products/dried-cassava-chips', title: 't', description: 'd' });
    assert.equal(m.alternates.canonical, set[lang]);
    assert.deepEqual(m.alternates.languages, set);
  }
  for (const path of ['/', '/about', '/products/passion-fruit', '/products/tapioca-starch']) {
    const m = pageMetadata({ lang: 'en', path, title: 't', description: 'd' });
    assert.deepEqual(Object.keys(m.alternates.languages), ['en', 'vi', 'x-default'], path);
    assert.deepEqual(m.openGraph.alternateLocale, ['vi_VN'], path);
  }
});
