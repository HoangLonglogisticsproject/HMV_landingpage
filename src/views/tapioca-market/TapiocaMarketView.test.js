// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { koreaTapiocaMarket as c } from '@/data/koreaTapiocaMarket.js';
import { TapiocaMarketView } from './TapiocaMarketView.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root, container;
beforeEach(async () => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  await act(() => root.render(h(TapiocaMarketView)));
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
const texts = selector => [...container.querySelectorAll(selector)].map(e => e.textContent);

test('one heading, the stored update date, the disclaimer; sections in the procurement order', () => {
  assert.deepEqual(texts('h1'), [c.hero.h1]);
  const time = container.querySelector('.market-updated time');
  assert.deepEqual([time.getAttribute('datetime'), time.textContent], ['2026-11-15', '2026.11.15']);
  assert.equal(container.querySelector('.market-disclaimer').textContent, c.hero.disclaimer);
  const ids = [...container.querySelectorAll('main > section[id]')].map(s => s.id);
  assert.deepEqual(ids, ['market-monitor', 'procurement-brief', 'market-drivers', 'manufacturer-checklist', 'supply-evidence-links', 'source-methodology']);
  assert.deepEqual(texts('.market-brief p'), c.brief.points);
  assert.deepEqual(texts('.market-checklist li'), c.checklist.items);
  assert.deepEqual(texts('.market-drivers h3'), c.drivers.items.map(d => d.title));
});

test('each signal: type, freshness and status in words; evidence and buyer view apart; dated sources', () => {
  const cards = [...container.querySelectorAll('.market-signal')];
  assert.equal(cards.length, 4);
  const read = card => ({
    tags: [...card.querySelectorAll('.market-tag')].map(t => t.textContent),
    status: card.querySelector('.market-status').textContent,
    labels: [...card.querySelectorAll('.market-label')].map(l => l.textContent),
    sources: [...card.querySelectorAll('.market-sources a')].map(a => a.textContent),
  });
  assert.deepEqual(cards.map(read), [
    { tags: ['구조 신호', '구조적 참고'], status: '상태: 지속 수요', labels: ['확인된 근거', '구매사 관점'], sources: ['KRX 공시 · 2025.05.14'] },
    { tags: ['계절 신호', '구조적 참고'], status: '상태: 진입 전', labels: ['확인된 근거', '구매사 관점'], sources: ['KRX 공시 · 2025.05.14'] },
    { tags: ['현재 신호', '과거 참고'], status: '상태: 상승', labels: ['확인된 근거', '구매사 관점'], sources: ['FAO · 2026.10.05'] },
    { tags: ['현재 신호'], status: '상태: 혼조', labels: ['확인된 근거', '구매사 관점'], sources: ['한국농촌경제연구원 · 2026.10.02', '농림축산식품부 · 2026.11.07'] },
  ]);
  // The tone of a status is a class beside its text, never the only signal.
  assert.deepEqual(cards.map(card => card.querySelector('.market-status').className), [
    'market-status market-status--ongoing', 'market-status market-status--upcoming', 'market-status market-status--rising', 'market-status market-status--mixed',
  ]);
  assert.equal(cards[2].querySelector('.market-implication p:last-child').textContent, c.signals[2].buyerImplication);
});

test('sources open in a new tab without the opener; internal links reach only the supply page; no Trade Desk', () => {
  const external = [...container.querySelectorAll('a[href^="http"]')];
  assert.ok(external.length >= 4);
  for (const a of external) assert.deepEqual([a.target, a.rel], ['_blank', 'noopener noreferrer'], a.href);
  const internal = [...new Set([...container.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href')))].sort();
  assert.deepEqual(internal, ['/', '/ko/tapioca-chips', '/ko/tapioca-chips#capability', '/ko/tapioca-chips#quality', '/ko/tapioca-chips#supply-evidence']);
  for (const a of container.querySelectorAll('a[href^="#"]')) assert.ok(container.querySelector(a.getAttribute('href')), a.getAttribute('href'));
  // Plain links only: no button opens the HMV Trade Desk from this page.
  assert.equal(container.querySelectorAll('button').length, 0);
});
