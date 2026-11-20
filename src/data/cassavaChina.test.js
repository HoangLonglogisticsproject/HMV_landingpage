import { test } from 'vitest';
import assert from 'node:assert/strict';
import { cassavaChina as zh } from './cassavaChina.js';
import { productPages } from './productPages.js';

const en = productPages['dried-cassava-chips'].en;
const amount = value => value.split(' ')[0];

test('the Chinese page shows the EN/VI evidence: the same network figures and Intertek results, no others', () => {
  assert.deepEqual(zh.figures.items.map(f => amount(f.value)), en.figures.items.map(f => amount(f.value)));
  assert.deepEqual(zh.figures.items.map(f => f.value.slice(amount(f.value).length)), [' 吨/月', ' 吨/月', ' 集装箱/月', ' 集装箱/月']);
  assert.equal(zh.quality.rows.length, en.quality.rows.length);
  zh.quality.rows.forEach(([, value], i) => assert.equal(value, en.quality.rows[i][1] === 'Not detected' ? '未检出' : en.quality.rows[i][1]));
  assert.deepEqual(zh.intertek.results, zh.quality.rows.slice(0, 2));
  assert.equal(zh.intertek.report, en.intertek.report);
  assert.match(zh.quality.source, /AGRIVIETNAM2026-1700，报告日期 2026年10月5日/);
  // The quality cards: starch, moisture, raw fiber and sand and silica, the table's own values and English names.
  const pick = [0, 1, 2, 4];
  assert.deepEqual(zh.quality.highlights.map(m => m.value), pick.map(i => zh.quality.rows[i][1]));
  assert.deepEqual(zh.quality.highlights.map(m => [m.label, m.en]), [['淀粉', 'Starch'], ['水分', 'Moisture'], ['粗纤维', 'Raw fiber'], ['砂和二氧化硅', 'Sand & silica']]);
});

test('no specification, guarantee or figure beyond the evidence', () => {
  const copy = JSON.stringify(zh);
  // Specification limits and ranges (e.g. "moisture ≤13%", "starch 60–70%") are not asserted anywhere.
  assert.doesNotMatch(copy, /[≤≥]|\d\s*[–~-]\s*\d+\s*%/);
  // Every percentage on the page is an Intertek sample result.
  const results = new Set(en.quality.rows.map(([, v]) => v));
  for (const [p] of copy.matchAll(/<?\d[\d.,]*%/g)) assert.ok(results.has(p), p);
  // The capability figures are qualified as a reference, not a commitment.
  assert.match(zh.figures.note, /仅作能力参考，并非对每一位买方的供货承诺/);
  assert.match(zh.figures.short, /并非对单一买方的供货承诺/);
  assert.equal(zh.quality.note, '送检样品结果，仅作采购评估参考；实际供货规格以双方确认的供应方案及合同为准。');
  // No minimum order, price, stock, loading date or lead time is offered anywhere.
  assert.doesNotMatch(copy, /起订|最低订购|MOQ|现货|库存|报价|单价|美元|USD|交期|天内|周内/);
});

test('the section links: every section once, in page order; the header links a subset of them', () => {
  const ids = zh.sections.items.map(([id]) => id);
  assert.deepEqual(ids, ['overview', 'applications', 'supply-evidence', 'quality', 'capability', 'workflow', 'faq']);
  for (const [id] of zh.nav.items) assert.ok(ids.includes(id), id);
  // The FAQ's links point at sections of this page.
  for (const { link } of zh.faq.items.filter(item => item.link)) assert.ok(ids.includes(link[0].slice(1)), link[0]);
});

test('factories first; Cambodia only in the supply-network statement below the buyer section, not in the hero copy', () => {
  const { lead } = zh.hero;
  assert.ok(lead.indexOf('饲料厂') < lead.indexOf('淀粉加工厂') && lead.indexOf('淀粉加工厂') < lead.indexOf('生物乙醇'));
  assert.ok(lead.indexOf('生物乙醇') < lead.indexOf('进口商') && lead.indexOf('进口商') < lead.indexOf('大宗批发'));
  assert.doesNotMatch(JSON.stringify(zh.hero), /柬埔寨|越南/);
  assert.match(zh.network.text, /覆盖越南及柬埔寨/);
  assert.deepEqual(zh.applications.items.map(i => i.title), ['生物乙醇生产', '饲料原料', '淀粉加工']);
  // Feed: the buyer's formulation decides the use, never a claim that cassava replaces another raw material.
  assert.match(zh.applications.items[1].text, /取决于买方的配方设计与原料策略/);
  assert.doesNotMatch(JSON.stringify(zh), /替代|取代/);
});
