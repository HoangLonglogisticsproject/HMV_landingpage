import { afterEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';

// POST /api/inquiry as Next.js calls it: a Request in, a Response out. The delivery adapter is chosen from the
// environment when the route module loads, so each test loads it fresh.
async function route(env = {}) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import('../../../app/api/inquiry/route.ts');
}
const post = (body, type = 'application/json') =>
  new Request('http://localhost/api/inquiry', { method: 'POST', headers: { 'content-type': type }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const inquiry = {
  idempotencyKey: '7c1e2a90-4b5d-4c3e-8f21-0a9b8c7d6e5f',
  locale: 'vi',
  goal: 'sourcing',
  product: 'dried-cassava-chips',
  contact: { company: 'Feed Co', email: 'buyer@example.com' },
  consent: { contact: true },
};

afterEach(() => vi.unstubAllEnvs());

test('without a configured delivery the API refuses to accept (503); invalid input is still a 400', async () => {
  vi.stubEnv('INQUIRY_DELIVERY', '');
  const { POST } = await route();
  assert.equal((await POST(post(inquiry))).status, 503);
  const invalid = await POST(post({ ...inquiry, contact: { company: 'Feed Co', email: 'nope' } }));
  assert.equal(invalid.status, 400);
  assert.deepEqual(await invalid.json(), { error: 'invalid', fields: ['contact.email'] });
});

test('with a delivery adapter: 201 and the inquiry reference', async () => {
  const info = vi.spyOn(console, 'info').mockImplementation(() => {});
  const { POST } = await route({ INQUIRY_DELIVERY: 'log', NODE_ENV: 'test' });
  const res = await POST(post(inquiry));
  assert.equal(res.status, 201);
  const { reference } = await res.json();
  assert.match(reference, /^HMV-\d{4}-[A-Z0-9]{6}$/);
  assert.match(info.mock.calls[0][0], new RegExp(reference));
});

test('bad requests: not JSON (415), unparsable (400) and oversized (413)', async () => {
  const { POST } = await route();
  assert.equal((await POST(post('company=x', 'application/x-www-form-urlencoded'))).status, 415);
  assert.equal((await POST(post('{not json'))).status, 400);
  assert.equal((await POST(post({ ...inquiry, notes: 'x'.repeat(25_000) }))).status, 413);
});

test('INQUIRY_DELIVERY=cms: 201 with the reference the CMS issued; a CMS failure is a 502', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let status = 201;
  vi.stubGlobal('fetch', vi.fn(async () => ({ status, json: async () => ({ reference: 'HMV-2026-7KQ4XM', duplicate: false }) })));
  const { POST } = await route({
    INQUIRY_DELIVERY: 'cms',
    CMS_INQUIRY_URL: 'https://cms.example/api/v1/integrations/trade-inquiries',
    CMS_INQUIRY_SECRET: 'route-test-secret-0123456789abcdef',
  });
  const res = await POST(post(inquiry));
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { reference: 'HMV-2026-7KQ4XM' });
  status = 503;
  const failed = await POST(post({ ...inquiry, idempotencyKey: 'another-key-0002' }));
  assert.equal(failed.status, 502);
  vi.unstubAllGlobals();
});
