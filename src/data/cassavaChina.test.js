import { test } from 'vitest';
import assert from 'node:assert/strict';
import { cassavaChina as zh } from './cassavaChina.js';
import { productPages } from './productPages.js';

const en = productPages['dried-cassava-chips'].en;
const amount = value => value.split(' ')[0];

test('the Chinese page shows the EN/VI evidence: the same network figures and Intertek results, no others', () => {
  assert.deepEqual(zh.figures.items.map(f => amount(f.value)), en.figures.items.map(f => amount(f.value)));
  assert.deepEqual(zh.figures.items.map(f => f.value.slice(amount(f.value).length)), [' 吨/月', ' 吨/月', ' 柜/月', ' 柜/月']);
  assert.equal(zh.quality.rows.length, en.quality.rows.length);
  zh.quality.rows.forEach(([, value], i) => assert.equal(value, en.quality.rows[i][1] === 'Not detected' ? '未检出' : en.quality.rows[i][1]));
  assert.deepEqual(zh.intertek.results, zh.quality.rows.slice(0, 2));
  assert.equal(zh.intertek.report, en.hero.intertek.report);
  assert.match(zh.quality.source, /AGRIVIETNAM2026-1700，报告日期 2026年10月5日/);
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
  assert.match(zh.quality.note, /^以下结果来自特定送检样品，仅作为质量参考/);
});

test('factories first; Cambodia only in the supply-network statement below the buyer section, not in the hero copy', () => {
  const { lead } = zh.hero;
  assert.ok(lead.indexOf('饲料厂') < lead.indexOf('淀粉加工厂') && lead.indexOf('淀粉加工厂') < lead.indexOf('生物乙醇'));
  assert.ok(lead.indexOf('生物乙醇') < lead.indexOf('进口商') && lead.indexOf('进口商') < lead.indexOf('大宗批发'));
  assert.doesNotMatch(JSON.stringify(zh.hero), /柬埔寨|越南/);
  assert.match(zh.network.text, /覆盖越南及柬埔寨/);
  assert.deepEqual(zh.applications.items.map(i => i.title), ['饲料生产', '淀粉加工', '生物乙醇']);
});
