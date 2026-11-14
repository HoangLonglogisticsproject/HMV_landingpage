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
    ['structural', '지속 수요'], ['seasonal', '진입 전'], ['current', '상승'], ['current', '혼조'],
  ]);
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
  // A company's KRX filing is labelled as such, never as a government source.
  assert.deepEqual([market.sources['krx-changhae-2025q1'].label, market.sources['krx-changhae-2025q1'].sourceType], ['KRX 공시', 'regulatory_filing']);
});

// The page's date is content, not the clock; freshness is measured against it.
test('freshness as of the page date: structural and seasonal are structural references; FAO is past 30 days', () => {
  assert.match(market.updatedAt, ISO_DATE);
  assert.deepEqual(market.signals.map(s => signalFreshness(s, market.sources, market.updatedAt)), ['structural', 'structural', 'historical', 'current']);
  assert.deepEqual(market.monitor.freshness, { structural: '구조적 참고', historical: '과거 참고' });
});

// Claims: a reference page, never a quotation, a forecast or a commitment.
test('no price, forecast, guarantee or blanket claim anywhere in the market content', () => {
  const copy = JSON.stringify({ ...market, sources: undefined });
  for (const forbidden of [
    /보장/, /확정 공급/, /가격(이|은|도)? ?(오를|상승할|하락할|내릴) (것|전망)/, /(상승|하락) 전망/, /예측합니다/,
    /USD|달러\/톤|\$\s*\d/, /모든 (주정|에탄올|사료|전분|제조사|공장)/, /항상 (옥수수|대체)/, /생산(량)?이 (감소했|줄었)/,
  ]) assert.doesNotMatch(copy, forbidden, String(forbidden));
  // The disclaimer says what the page is not.
  assert.match(market.hero.disclaimer, /확정 견적, 공급 확약 또는 가격 예측이 아닙니다/);
});

test('the weather signal does not turn FAO\'s drought risk into a cassava production loss', () => {
  const weather = market.signals.find(s => s.id === 'cambodia-weather-risk');
  assert.match(weather.evidence, /^FAO는/);
  assert.match(weather.buyerImplication, /^이는 타피오카 생산량 감소를 직접 의미하지는 않지만/);
});

test('the corn signal reports both directions and concludes nothing about tapioca demand', () => {
  const corn = market.signals.find(s => s.id === 'corn-relative-economics');
  assert.match(corn.evidence, /사료용 옥수수 수입단가는 전월 대비 3\.9% 상승/);
  assert.match(corn.evidence, /가공용 옥수수는 4\.0% 하락/);
  assert.match(corn.evidence, /9월에 3년 만의 최고치를 기록한 이후 하락/);
  assert.match(corn.buyerImplication, /한 달의 가격 움직임만으로 타피오카 수요 방향을 단정해서는 안 됩니다/);
  assert.doesNotMatch(corn.buyerImplication, /(증가|감소)할 것/);
});

// PR1 links only to the pages that exist: the supply page and its sections.
test('internal links: the Korean supply page and its sections only', () => {
  const hrefs = JSON.stringify(market).match(/"href":"[^"]+"/g).map(h => h.slice(8, -1));
  assert.deepEqual([...new Set(hrefs)].sort(), ['/ko/tapioca-chips', '/ko/tapioca-chips#capability', '/ko/tapioca-chips#quality', '/ko/tapioca-chips#supply-evidence']);
});
