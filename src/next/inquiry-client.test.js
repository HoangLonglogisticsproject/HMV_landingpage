import { test } from 'vitest';
import assert from 'node:assert/strict';
import { sendInquiry } from './inquiry-client.js';

// A fetch that never answers on its own and rejects when its signal aborts, as the browser's does.
const pending = (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))));

test('a request to /api/inquiry that stays pending is aborted after the timeout', async () => {
  const started = Date.now();
  await assert.rejects(sendInquiry({ idempotencyKey: 'k' }, { timeoutMs: 30, fetchImpl: pending }), { name: 'AbortError' });
  assert.ok(Date.now() - started < 1000);
});

test('an answer in time is returned; its body is parsed, an unreadable one is {}', async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push({ url, init });
    return { status: 201, json: async () => ({ reference: 'HMV-2026-7KQ4XM' }) };
  };
  assert.deepEqual(await sendInquiry({ idempotencyKey: 'k' }, { timeoutMs: 1000, fetchImpl }), { status: 201, body: { reference: 'HMV-2026-7KQ4XM' } });
  assert.equal(seen[0].url, '/api/inquiry');
  assert.equal(seen[0].init.signal.aborted, false);
  const broken = async () => ({ status: 502, json: async () => { throw new SyntaxError('bad json'); } });
  assert.deepEqual(await sendInquiry({}, { fetchImpl: broken }), { status: 502, body: {} });
});
