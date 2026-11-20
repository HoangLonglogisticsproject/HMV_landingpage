import { test } from 'vitest';
import assert from 'node:assert/strict';
import { ZH_CASSAVA_GUIDES } from '../i18n/routes.js';
import { articles } from './articles.js';
import { cassavaChina } from './cassavaChina.js';
import { cassavaChinaGuides } from './cassavaChinaGuides.js';
import { cassavaDossier } from './productPages.js';

// The dried cassava chips guides: the EN/VI EcoNews articles (data/articles.js) and the Chinese guides
// (data/cassavaChinaGuides.js). Their claims are the cassava page's, and each one leads back to it.
const cassavaArticles = articles.filter(a => a.product === 'dried-cassava-chips');
const zhGuides = Object.entries(cassavaChinaGuides.items);
const text = blocks => JSON.stringify(blocks);
const linksIn = blocks => [...text(blocks).matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]);
// What the guides may not claim, in any of their languages: certification, accreditation or guarantees, every shipment
// tested, a minimum order, stock, prices or lead times.
const CLAIMS = /certif|guarant|accredit|every (shipment|lot) (is )?test|MOQ|minimum order|in stock|USD|US\$|lead time|认证|认可|担保|保证|起订|最低订购|现货|库存|报价|单价|美元|交期|天内|周内|chứng nhận|bảo đảm|đảm bảo|tồn kho|đơn hàng tối thiểu/i;

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

test('the EN/VI cassava articles open the Trade Desk with their own source per language', () => {
  assert.deepEqual(cassavaArticles.map(a => a.tradeDesk), [
    { en: 'en_ethanol_guide', vi: 'vi_ethanol_guide' },
    { en: 'en_quality_guide', vi: 'vi_quality_guide' },
  ]);
  const sources = [...cassavaArticles.flatMap(a => Object.values(a.tradeDesk)), ...zhGuides.map(([, g]) => g.source)];
  assert.equal(new Set(sources).size, sources.length);
  // Never the supplier keyword of the product page.
  for (const a of cassavaArticles) assert.doesNotMatch(a.title.en, /supplier/i);
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
});

test('no claim beyond the evidence; every percentage is an Intertek sample result', () => {
  const copies = [
    ['en', cassavaArticles.map(a => [a.title.en, a.description.en, a.body.en])],
    ['vi', cassavaArticles.map(a => [a.title.vi, a.description.vi, a.body.vi])],
    ['zh', zhGuides.map(([, g]) => [g.seo, g.h1, g.lead, g.body])],
  ];
  for (const [lang, copy] of copies) {
    const all = text(copy);
    assert.doesNotMatch(all, CLAIMS, lang);
    assert.doesNotMatch(all, /[≤≥]|\d\s*[–~-]\s*\d+\s*%/, lang);
    const results = new Set(cassavaDossier(lang).results.map(([, v]) => v));
    for (const [p] of all.matchAll(/\d[\d.,]*%/g)) assert.ok(results.has(p), `${lang} ${p}`);
  }
});

test('the Chinese commercial support: what it covers, without times or promises; the page links every guide', () => {
  const { support, guides } = cassavaChina;
  assert.equal(support.title, '中文商务支持');
  assert.deepEqual(support.items, ['产品规格', '月度采购量', '目的地', '商务条款', '订单跟进']);
  assert.doesNotMatch(JSON.stringify(support), /小时|分钟|工作日|24|全天|团队|谈判|保证|承诺/);
  assert.deepEqual(guides.items.map(g => g.href), ZH_CASSAVA_GUIDES.map(slug => `/zh-cn/cassava-chips/${slug}`));
});
