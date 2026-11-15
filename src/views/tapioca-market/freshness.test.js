import { test } from 'vitest';
import assert from 'node:assert/strict';
import { FRESH_DAYS, formatDate, signalFreshness } from './freshness.js';

const sources = { old: { publishedAt: '2026-10-01' }, recent: { publishedAt: '2026-10-31' } };
const current = ids => ({ type: 'current', sources: ids });

test('a current signal is current up to 30 days after its newest source, then a past reference', () => {
  assert.equal(FRESH_DAYS, 30);
  assert.equal(signalFreshness(current(['old']), sources, '2026-10-31'), 'current');
  assert.equal(signalFreshness(current(['old']), sources, '2026-11-01'), 'historical');
  // The newest source decides.
  assert.equal(signalFreshness(current(['old', 'recent']), sources, '2026-11-15'), 'current');
});

test('structural and seasonal signals are structural references, whatever their sources\' age', () => {
  for (const type of ['structural', 'seasonal']) assert.equal(signalFreshness({ type, sources: ['old'] }, sources, '2030-01-01'), 'structural');
});

test('dates as the Korean sources write them', () => {
  assert.equal(formatDate('2026-11-15'), '2026.11.15');
});
