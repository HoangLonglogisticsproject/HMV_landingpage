import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { articleJsonLd, homeMeta, logisticsMeta, productMeta, siteJsonLd, supplyChainMeta, tradeSolutionsMeta } from './meta.js';
import { bundledArticle, bundledArticleIndex } from '../features/articles/bundled.js';
import { copy, products } from '../data/hmv.js';

test('descriptions: Trade Solutions differs from Supply Chain; product descriptions are filled and unique', () => {
  for (const lang of ['en', 'vi']) {
    assert.notDeepEqual(tradeSolutionsMeta(lang), supplyChainMeta(lang), lang);
    assert.notEqual(tradeSolutionsMeta(lang).description, supplyChainMeta(lang).description, lang);
    const descriptions = products.map(p => productMeta(lang, p).description);
    assert.equal(descriptions.length, 6, lang);
    assert.ok(descriptions.every(d => d.trim()), lang);
    assert.equal(new Set(descriptions).size, descriptions.length, lang);
  }
});

test('titles: main commercial pages and the six products are unique per language', () => {
  for (const lang of ['en', 'vi']) {
    const pages = [homeMeta, supplyChainMeta, tradeSolutionsMeta, logisticsMeta].map(m => m(lang).title);
    assert.equal(new Set(pages).size, pages.length, lang);
    const titles = products.map(p => productMeta(lang, p).title);
    assert.equal(new Set(titles).size, 6, lang);
  }
  assert.equal(productMeta('en', products[1]).title, 'Vietnam Cavendish Bananas Sourcing for Wholesale Buyers');
  assert.equal(productMeta('vi', products[1]).title, 'Chuối Cavendish Việt Nam cho nhu cầu thu mua B2B');
});

test('product metadata: an unknown product (Vite soft 404) falls back to the not-found heading', () => {
  for (const lang of ['en', 'vi']) {
    assert.deepEqual(productMeta(lang, undefined), { title: copy[lang].notfound, description: copy[lang].chainText }, lang);
  }
});

// Logistics is an operational capability of HMV Global, never a second brand or a standalone service offer.
const STANDALONE_LOGISTICS = ['HMV Logistics', 'Dịch Vụ Logistics Chuyên Biệt', 'Specialized Logistics Solutions',
  'Contact Logistics Desk', 'Explore logistics services'];

test('HMV Global is the only entity on the logistics pages', () => {
  for (const file of ['./logistics/LogisticsView.jsx', '../data/logisticsServices.js', './supply-chain/SupplyChainPillars.jsx']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    for (const phrase of STANDALONE_LOGISTICS) assert.ok(!source.includes(phrase), `${file}: ${phrase}`);
  }
});

// Facts under D-12 review (audit §9) that are on the site today and must not reach structured data before HMV confirms
// them: people and titles (C-02), contact channels (C-05), the email domain (C-04).
const UNVERIFIED = ['Ho Quang Minh', 'Hieu Truong', 'Van Nguyen', 'Chairman', 'Managing Director', 'General Manager',
  '@hmvglobal.com', '909 123 456', '902 468 910', 'HMV Logistics', 'certif', 'Floor 5'];

test('site structured data: Organization and WebSite with confirmed facts only', () => {
  const json = siteJsonLd();
  const [org, site] = JSON.parse(json)['@graph'];
  assert.deepEqual(Object.keys(org).sort(), ['@id', '@type', 'alternateName', 'logo', 'name', 'url']);
  assert.deepEqual(site.publisher, { '@id': org['@id'] });
  for (const claim of UNVERIFIED) assert.ok(!json.includes(claim), claim);
});

test('article structured data: absolute image; no </script>', () => {
  const article = { title: 'T</script>', date: { iso: '2026-10-01' }, image: { src: '/media/x.jpg' }, author: null };
  const json = articleJsonLd('vi', article);
  assert.ok(!json.includes('</script>'));
  assert.equal(JSON.parse(json).image, 'https://www.hmv-global.com/media/x.jpg');
});

test('article author: the CMS name exactly, as a Person with no role, title or affiliation', () => {
  // authorRole is not part of the view (features/articles/api.js); it must not appear even if it were passed.
  const article = { title: 'T', date: { iso: '2026-10-01' }, image: null, author: 'An Nguyen', authorRole: 'Trade analyst' };
  const json = articleJsonLd('en', article);
  assert.deepEqual(JSON.parse(json).author, { '@type': 'Person', name: 'An Nguyen' });
  assert.ok(!json.includes('Trade analyst'));
});

test('article author: without a CMS author, the organization, never a person from the site', () => {
  for (const slugs of bundledArticleIndex()) {
    for (const [lang, slug] of Object.entries(slugs)) {
      const json = articleJsonLd(lang, bundledArticle(slug, lang));
      const { author } = JSON.parse(json);
      assert.deepEqual(Object.keys(author).sort(), ['@id', '@type', 'alternateName', 'logo', 'name', 'url'], slug);
      assert.equal(author['@type'], 'Organization', slug);
      for (const claim of UNVERIFIED) assert.ok(!json.includes(claim), `${slug}: ${claim}`);
    }
  }
});
