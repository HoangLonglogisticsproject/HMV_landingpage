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

test('money pages: intent-led title and description within SERP length, unique; self canonical; EN/VI/x-default; OG and Twitter', () => {
  const metas = MONEY.map(([id, lang, url, intent]) => {
    const { title, description } = productMeta(lang, products.find(p => p.id === id));
    assert.match(title, intent);
    // ponytail: characters, not pixels; Google cuts at roughly 600 px, about 60-70 characters.
    assert.ok(`${title} | HMV Global`.length <= 70, `${url} title: ${title}`);
    assert.ok(description.length <= 160, `${url} description: ${description.length}`);
    const m = pageMetadata({ lang, path: `/products/${id}`, title, description });
    const pair = MONEY.filter(row => row[0] === id).map(([, l, u]) => [l, SITE + u]);
    assert.equal(m.alternates.canonical, SITE + url);
    assert.deepEqual(m.alternates.languages, { ...Object.fromEntries(pair), 'x-default': pair.find(([l]) => l === 'en')[1] });
    assert.equal(m.openGraph.url, SITE + url);
    assert.deepEqual([m.openGraph.title, m.openGraph.description], [`${title} | HMV Global`, description]);
    assert.deepEqual([m.twitter.card, m.twitter.title, m.twitter.description], ['summary_large_image', `${title} | HMV Global`, description]);
    return m;
  });
  assert.equal(new Set(metas.map(m => m.title)).size, MONEY.length);
  assert.equal(new Set(metas.map(m => m.description)).size, MONEY.length);
});
