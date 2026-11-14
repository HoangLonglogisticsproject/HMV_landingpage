import { test } from 'vitest';
import assert from 'node:assert/strict';
import { cassavaKorea as ko } from './cassavaKorea.js';
import { productPages } from './productPages.js';

const en = productPages['dried-cassava-chips'].en;
const amount = value => value.split(' ')[0];

test('the Korean page shows the EN/VI evidence: the same network figures and Intertek results, no others', () => {
  assert.deepEqual(ko.figures.items.map(f => amount(f.value)), en.figures.items.map(f => amount(f.value)));
  assert.deepEqual(ko.figures.items.map(f => f.value.slice(amount(f.value).length)), [' 톤/월', ' 톤/월', ' 컨테이너/월', ' 컨테이너/월']);
  assert.equal(ko.quality.rows.length, en.quality.rows.length);
  ko.quality.rows.forEach(([, value], i) => assert.equal(value, en.quality.rows[i][1] === 'Not detected' ? '불검출' : en.quality.rows[i][1]));
  assert.deepEqual(ko.intertek.results, ko.quality.rows.slice(0, 2));
  assert.equal(ko.intertek.report, en.hero.intertek.report);
  assert.match(ko.quality.source, /AGRIVIETNAM2026-1700, 보고일 2026년 10월 5일/);
});

test('no specification, guarantee or figure beyond the evidence', () => {
  const copy = JSON.stringify(ko);
  assert.doesNotMatch(copy, /[≤≥]|\d\s*[–~-]\s*\d+\s*%/);
  const results = new Set(en.quality.rows.map(([, v]) => v));
  for (const [p] of copy.matchAll(/<?\d[\d.,]*%/g)) assert.ok(results.has(p), p);
  // The capability figures are a reference, not a commitment; the sample is not a shipment specification.
  assert.match(ko.figures.note, /역량 참고 자료이며, 모든 구매사에 대한 공급 확약이 아닙니다/);
  assert.match(ko.quality.note, /^아래 수치는 특정 제출 샘플의 시험 결과이며 모든 공급 물량의 고정 규격을 의미하지 않습니다/);
});

// A business requirement: the page speaks to manufacturers, not to traders.
test('manufacturers first: ethanol, feed and starch lead; importers and wholesalers follow; no trader positioning', () => {
  const hero = `${ko.hero.lead} ${ko.hero.support}`;
  const at = term => hero.indexOf(term);
  assert.ok([at('주정·에탄올'), at('사료'), at('전분'), at('수입업체'), at('대량 도매')].every((i, n, all) => i >= 0 && (n === 0 || i > all[n - 1])), hero);
  assert.doesNotMatch(ko.hero.lead, /수입업체|도매/);
  for (const s of [ko.seo.title, ko.seo.description, ko.hero.h1]) assert.match(s, /제조(사|업체)/, s);
  assert.deepEqual(ko.useCases.items.map(i => i.title), ['주정·에탄올 생산', '사료 생산', '전분 가공']);
  assert.doesNotMatch(JSON.stringify(ko), /무역상|트레이더|중개상/);
  // Cambodia is in the supply-network statement and the figures below the buyer value, never in the hero.
  assert.doesNotMatch(JSON.stringify({ hero: ko.hero, panel: ko.panel, intertek: ko.intertek }), /캄보디아/);
  assert.match(ko.network.text, /베트남과 캄보디아/);
});

// 타피오카 칩 is the Korean industry term: it leads the title, heading and use cases; 카사바 is not the lead term.
test('타피오카 칩, not 카사바 칩, as the product term', () => {
  for (const s of [ko.seo.title, ko.seo.description, ko.hero.h1, ko.useCases.title]) assert.match(s, /타피오카 칩/, s);
  // One brand suffix (D-06): the title template adds ' | HMV Global', so the title has no pipe of its own.
  assert.doesNotMatch(ko.seo.title, /\|/);
  assert.doesNotMatch(JSON.stringify(ko), /카사바 칩/);
});

// The use cases are possible raw materials, never what every plant uses.
test('the use cases are qualified', () => {
  const [ethanol, feed, starch] = ko.useCases.items.map(i => i.text);
  assert.match(ethanol, /원료 중 하나입니다/);
  assert.match(feed, /사용될 수 있습니다. 실제 사용 여부와 배합 기준은 각 제조사의/);
  assert.match(starch, /활용될 수 있습니다/);
  assert.doesNotMatch(JSON.stringify(ko.useCases), /모든 (공장|제조사)/);
});
