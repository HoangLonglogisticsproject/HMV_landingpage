import { test } from 'vitest';
import assert from 'node:assert/strict';
import { koreaTapiocaMarket as market } from './koreaTapiocaMarket.js';
import { signalFreshness } from '../views/tapioca-market/freshness.js';

const TYPES = ['structural', 'seasonal', 'current'];
const SOURCE_TYPES = ['government', 'international_organization', 'research_institute', 'regulatory_filing', 'trade_publication', 'supplier_market_update'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

test('every signal has its type, status, evidence, buyer implication, confidence and at least one known source', () => {
  assert.deepEqual(market.signals.map(s => s.id), ['korea-ethanol-demand', 'tapioca-procurement-season', 'cambodia-weather-risk', 'corn-relative-economics']);
  for (const s of market.signals) {
    assert.ok(TYPES.includes(s.type), s.id);
    assert.ok(market.monitor.statuses[s.status], `${s.id} status`);
    assert.ok(s.label && s.evidence && s.buyerImplication, s.id);
    assert.notEqual(s.evidence, s.buyerImplication, `${s.id}: evidence and interpretation are kept apart`);
    assert.ok(['high', 'medium', 'low'].includes(s.confidence), s.id);
    assert.ok(s.sources.length > 0, s.id);
    for (const id of s.sources) assert.ok(market.sources[id], `${s.id} cites a missing source ${id}`);
  }
  // Signal types as declared, and visibly distinct statuses in words.
  assert.deepEqual(market.signals.map(s => [s.type, market.monitor.statuses[s.status]]), [
    ['structural', '지속 수요'], ['seasonal', '진입 전'], ['current', '높은 위험'], ['current', '최근 하락'],
  ]);
  // HMV's own editorial labels, never presented as market categories.
  assert.deepEqual(market.monitor.types, { structural: '구조적 참고', seasonal: '계절적 참고', current: '최근 동향' });
  assert.ok(market.methodology.points.some(p => p.includes('업계 표준 분류가 아닙니다')));
  for (const d of market.drivers.items) for (const id of d.sources) assert.ok(market.sources[id], `${d.title}: ${id}`);
});

test('every source has publisher, title, ISO date, https URL, a known type and a tier; every one is cited', () => {
  for (const [id, s] of Object.entries(market.sources)) {
    assert.equal(s.id, id);
    assert.ok(s.label && s.publisher && s.title, id);
    assert.match(s.publishedAt, ISO_DATE, id);
    assert.ok(Date.parse(s.publishedAt) <= Date.parse(market.updatedAt), `${id} is not dated after the page`);
    assert.match(s.url, /^https:\/\/[^\s]+$/, id);
    assert.doesNotMatch(s.url, /[?&]utm_/, `${id}: no tracking parameters`);
    assert.ok(SOURCE_TYPES.includes(s.sourceType), id);
    assert.ok(['A', 'B', 'C'].includes(s.tier), id);
  }
  const cited = new Set([...market.signals, ...market.drivers.items].flatMap(x => x.sources));
  assert.deepEqual([...cited].sort(), Object.keys(market.sources).sort());
  // A company's KRX filing is labelled as such, never as a government source: Changhae Ethanol's 2026 Q1 report.
  assert.deepEqual(market.sources['krx-changhae-2026q1'], {
    id: 'krx-changhae-2026q1', label: 'KRX 공시', publisher: '창해에탄올', title: '창해에탄올 분기보고서 (2026.03)', publishedAt: '2026-05-15',
    url: 'https://kind.krx.co.kr/external/2026/05/15/002835/20260515006469/11013.htm', sourceType: 'regulatory_filing', tier: 'A',
  });
});

// The page's date is content, not the clock; freshness is measured against it.
test('freshness as of the page date: structural and seasonal are references; FAO is past 30 days', () => {
  assert.match(market.updatedAt, ISO_DATE);
  assert.deepEqual(market.signals.map(s => signalFreshness(s, market.sources, market.updatedAt)), ['structural', 'structural', 'historical', 'current']);
  assert.deepEqual(market.monitor.freshness, { historical: '과거 참고' });
});

// Claims: a reference page, never a quotation, a forecast or a commitment.
test('no price, forecast, guarantee or blanket claim anywhere in the market content', () => {
  const copy = JSON.stringify({ ...market, sources: undefined });
  for (const forbidden of [
    /보장/, /확정 공급/, /가격(이|은|도)? ?(오를|상승할|하락할|내릴) (것|전망)/, /(상승|하락) 전망/, /예측합니다/,
    /USD|달러\/톤|\$\s*\d/, /모든 (주정|에탄올|사료|전분|제조사|공장)/, /항상 (옥수수|대체)/, /생산(량)?이 (감소했|줄었)/,
    // The filing describes one business's dry-season purchasing, not a Korean buying season.
    /조달 시즌/, /구조 신호|계절 신호|현재 신호/,
  ]) assert.doesNotMatch(copy, forbidden, String(forbidden));
  // The disclaimer says what the page is not.
  assert.match(market.hero.disclaimer, /확정 견적, 공급 확약 또는 가격 예측이 아닙니다/);
});

test('the weather signal does not turn FAO\'s drought risk into a cassava production loss', () => {
  const weather = market.signals.find(s => s.id === 'cambodia-weather-risk');
  assert.match(weather.evidence, /^FAO는/);
  assert.match(weather.buyerImplication, /^이는 타피오카 생산량 감소를 직접 의미하지는 않지만/);
  // A risk level, not a direction: FAO does not compare it with an earlier assessment.
  assert.equal(market.monitor.statuses[weather.status], '높은 위험');
});

test('the corn signal states only what MAFRA reports, without figures, and concludes nothing about tapioca demand', () => {
  const corn = market.signals.find(s => s.id === 'corn-relative-economics');
  assert.deepEqual(corn.sources, ['mafra-food-price-2026-10']);
  assert.equal(corn.evidence, '농림축산식품부가 정리한 FAO 자료에 따르면 국제 옥수수 가격은 2026년 9월 3년 만의 최고치를 기록한 뒤 10월 하락했습니다.');
  assert.doesNotMatch(corn.evidence, /%/);
  assert.match(corn.buyerImplication, /단기 움직임만으로 타피오카 수요 방향이나 실제 원료 대체를 단정할 수 없습니다/);
  assert.doesNotMatch(corn.buyerImplication, /(증가|감소)할 것/);
});

test('the dry season is the filing\'s purchasing and stockpiling period, December to May', () => {
  const season = market.signals.find(s => s.id === 'tapioca-procurement-season');
  assert.equal(season.label, '건기 수매·비축 시기');
  assert.equal(season.evidence, 'KRX 공시의 사업 설명에서는 타피오카 칩을 수확기인 건기(12월~5월)에 수매하여 창고 보관 후 공급하는 사업 구조를 설명합니다.');
  assert.deepEqual(season.sources, ['krx-changhae-2026q1']);
});

// PR1 links only to the pages that exist: the supply page and its sections.
test('internal links: the Korean supply page and its sections only', () => {
  const hrefs = JSON.stringify(market).match(/"href":"[^"]+"/g).map(h => h.slice(8, -1));
  assert.deepEqual([...new Set(hrefs)].sort(), ['/ko/tapioca-chips', '/ko/tapioca-chips#capability', '/ko/tapioca-chips#quality', '/ko/tapioca-chips#supply-evidence']);
});
