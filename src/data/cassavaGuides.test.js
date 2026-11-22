import { test } from 'vitest';
import assert from 'node:assert/strict';
import { KO_CASSAVA_GUIDES, ZH_CASSAVA_GUIDES } from '../i18n/routes.js';
import { articles } from './articles.js';
import { cassavaChina } from './cassavaChina.js';
import { cassavaChinaGuides } from './cassavaChinaGuides.js';
import { cassavaKorea } from './cassavaKorea.js';
import { cassavaKoreaGuides } from './cassavaKoreaGuides.js';
import { cassavaDossier } from './productPages.js';

// The dried cassava chips guides: the EN/VI EcoNews articles (data/articles.js), the Chinese guides
// (data/cassavaChinaGuides.js) and the Korean guides (data/cassavaKoreaGuides.js). Their claims are the cassava page's,
// and each one leads back to it.
const cassavaArticles = articles.filter(a => a.product === 'dried-cassava-chips');
const zhGuides = Object.entries(cassavaChinaGuides.items);
const koGuides = Object.entries(cassavaKoreaGuides.items);
const text = blocks => JSON.stringify(blocks);
const linksIn = blocks => [...text(blocks).matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]);
// What the guides may not claim, in any of their languages: certification, accreditation or guarantees, every shipment
// tested, a minimum order, stock, prices or lead times.
const CLAIMS = new RegExp([
  'certif|guarant|accredit|every (shipment|lot) (is )?test|MOQ|minimum order|in stock|USD|US\\$|lead time',
  '认证|认可|担保|保证|起订|最低订购|现货|库存|报价|单价|美元|交期|天内|周内',
  'chứng nhận|bảo đảm|đảm bảo|tồn kho|đơn hàng tối thiểu',
  '인증|보증|보장|공인|최소 주문|재고|견적|단가|가격|납기|리드타임|달러',
].join('|'), 'i');

test('the Chinese guides are the routes the site serves, each with its own Trade Desk source', () => {
  assert.deepEqual(Object.keys(cassavaChinaGuides.items), ZH_CASSAVA_GUIDES);
  assert.deepEqual(zhGuides.map(([, g]) => g.source), ['zh_procurement_guide', 'zh_quality_guide', 'zh_ethanol_guide']);
  for (const [slug, g] of zhGuides) {
    assert.match(g.published, /^\d{4}-\d{2}-\d{2}$/, slug);
    // Never the supplier keyword of the procurement page they link to.
    assert.doesNotMatch(g.seo.title + g.h1, /供应商/, slug);
    if (g.kind === 'market') {
      assert.ok(g.data.length && g.buyers.length, slug);
      for (const s of g.sources) assert.ok(s.publisher && s.title && s.url.startsWith('https://') && /^\d{4}-\d{2}-\d{2}$/.test(s.date), slug);
    }
  }
});

test('the Korean guides are the routes the site serves, each with its own Trade Desk source; none is a market update', () => {
  assert.deepEqual(Object.keys(cassavaKoreaGuides.items), KO_CASSAVA_GUIDES);
  assert.deepEqual(koGuides.map(([, g]) => g.source), ['ko_procurement_guide', 'ko_quality_guide', 'ko_ethanol_guide']);
  for (const [slug, g] of koGuides) {
    assert.equal(g.kind, 'guide', slug);
    assert.match(g.published, /^\d{4}-\d{2}-\d{2}$/, slug);
  }
  assert.deepEqual(koGuides.map(([, g]) => g.h1), ['산업용 타피오카 칩 구매 가이드', '타피오카 칩 품질 확인 가이드', '에탄올 생산용 타피오카 칩 구매 시 확인할 사항']);
});

test('the EN/VI cassava articles open the Trade Desk with their own source per language', () => {
  assert.deepEqual(cassavaArticles.map(a => a.tradeDesk), [
    { en: 'en_import_guide', vi: 'vi_import_guide' },
    { en: 'en_ethanol_guide', vi: 'vi_ethanol_guide' },
    { en: 'en_quality_guide', vi: 'vi_quality_guide' },
  ]);
  const sources = [...cassavaArticles.flatMap(a => Object.values(a.tradeDesk)), ...zhGuides.map(([, g]) => g.source), ...koGuides.map(([, g]) => g.source)];
  assert.equal(new Set(sources).size, sources.length);
  // Never the supplier keyword of the product page.
  for (const a of cassavaArticles) {
    assert.doesNotMatch(a.title.en + a.description.en + a.slug.en, /supplier/i, a.id);
    assert.doesNotMatch(a.title.vi + a.description.vi, /nhà cung cấp/i, a.id);
  }
});

test('the import guide: its slugs, titles and the cassava page it supports', () => {
  const guide = cassavaArticles.find(a => a.id === 'cassava-import-guide');
  assert.deepEqual(guide.slug, { en: 'importing-dried-cassava-chips-from-vietnam', vi: 'huong-dan-nhap-khau-san-lat-kho-tu-viet-nam' });
  assert.equal(guide.title.en, 'Importing Dried Cassava Chips from Vietnam: A Buyer’s Procurement Guide');
  assert.equal(guide.title.vi, 'Hướng dẫn buyer nhập sắn lát khô từ Việt Nam');
  // The nine points of the brief, in order, in both languages.
  for (const lang of ['en', 'vi']) {
    assert.equal(guide.body[lang].filter(([tag]) => tag === 'h2').length, 9, lang);
    assert.equal(guide.body[lang].at(-1)[0], 'p', lang);
  }
});

test('every guide links back to the cassava page in its language, and to nothing outside the site', () => {
  for (const a of cassavaArticles) {
    assert.ok(linksIn(a.body.en).includes('/products/dried-cassava-chips'), a.id);
    assert.ok(linksIn(a.body.vi).includes('/vi/san-pham/san-lat-kho'), a.id);
    for (const href of [...linksIn(a.body.en), ...linksIn(a.body.vi)]) assert.match(href, /^\/(?!\/)/, href);
  }
  for (const [slug, g] of zhGuides) {
    assert.ok(linksIn(g.body).includes('/zh-cn/cassava-chips') || linksIn(g.body).some(h => h.startsWith('/zh-cn/cassava-chips#')), slug);
    for (const href of linksIn(g.body)) assert.match(href, /^\/zh-cn\/cassava-chips(\/[a-z-]+|#[a-z-]+)?$/, href);
  }
  for (const [slug, g] of koGuides) {
    // The page itself, not only its sections; the guides and the market page are the only other Korean links.
    assert.ok(linksIn(g.body).includes('/ko/tapioca-chips'), slug);
    for (const href of linksIn(g.body)) assert.match(href, /^\/ko\/tapioca-(chips(\/[a-z-]+|#[a-z-]+)?|market)$/, href);
    assert.ok(!linksIn(g.body).includes(`/ko/tapioca-chips/${slug}`), `${slug} does not link to itself`);
  }
});

test('the Korean quality guide leads with the quality section of the page; the market page is linked, never replaced', () => {
  assert.equal(linksIn(cassavaKoreaGuides.items['quality-guide'].body)[0], '/ko/tapioca-chips#quality');
  assert.ok(linksIn(cassavaKoreaGuides.items['procurement-guide'].body).includes('/ko/tapioca-market'));
  assert.deepEqual(cassavaKoreaGuides.copy.links.map(([href]) => href), ['/ko/tapioca-market']);
  assert.deepEqual(cassavaKorea.guides.items.map(g => g.href), KO_CASSAVA_GUIDES.map(slug => `/ko/tapioca-chips/${slug}`));
});

test('no claim beyond the evidence; every percentage is an Intertek sample result', () => {
  const copies = [
    ['en', cassavaArticles.map(a => [a.title.en, a.description.en, a.body.en])],
    ['vi', cassavaArticles.map(a => [a.title.vi, a.description.vi, a.body.vi])],
    ['zh', zhGuides.map(([, g]) => [g.seo, g.h1, g.lead, g.body])],
    ['ko', koGuides.map(([, g]) => [g.seo, g.h1, g.lead, g.body])],
  ];
  for (const [lang, copy] of copies) {
    const all = text(copy);
    assert.doesNotMatch(all, CLAIMS, lang);
    assert.doesNotMatch(all, /[≤≥]|\d\s*[–~-]\s*\d+\s*%/, lang);
    const results = new Set(cassavaDossier(lang).results.map(([, v]) => v));
    for (const [p] of all.matchAll(/\d[\d.,]*%/g)) assert.ok(results.has(p), `${lang} ${p}`);
  }
  // The Korean guides keep the page's term and its audience: 타피오카 칩, manufacturers; no trader positioning.
  const ko = text(koGuides.map(([, g]) => g));
  assert.doesNotMatch(ko, /카사바 칩|무역상|트레이더|중개상/);
});

test('the Chinese commercial support: what it covers, without times or promises; the page links every guide', () => {
  const { support, guides } = cassavaChina;
  assert.equal(support.title, '中文商务支持');
  assert.deepEqual(support.items, ['产品规格', '月度采购量', '目的地', '商务条款', '订单跟进']);
  assert.doesNotMatch(JSON.stringify(support), /小时|分钟|工作日|24|全天|团队|谈判|保证|承诺/);
  assert.deepEqual(guides.items.map(g => g.href), ZH_CASSAVA_GUIDES.map(slug => `/zh-cn/cassava-chips/${slug}`));
});
