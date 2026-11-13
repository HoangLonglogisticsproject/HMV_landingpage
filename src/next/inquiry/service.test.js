import { afterEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { createInquiryService } from './service.js';
import { bodyHash, cmsAdapter, cmsPayload, deliveryAdapterFromEnv, memoryAdapter, signCmsRequest, webhookAdapter } from './adapters.js';
import { createReference } from './reference.js';
import { validateInquiry } from '../../features/trade-desk/validation.js';

const inquiry = overrides => ({
  idempotencyKey: '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69',
  locale: 'en',
  product: 'passion-fruit',
  origin: 'vietnam',
  destination: 'Rotterdam',
  volume: { amount: '2', unit: 'containers' },
  transport: 'sea_reefer',
  requirements: { brix: '14+', variety: 'Purple' },
  notes: '',
  contact: { company: 'Example Foods', email: 'buyer@example.com', name: 'Jan', phone: '' },
  consent: { contact: true },
  context: { page: '/products/passion-fruit', landingPage: '/', referrer: 'https://www.google.com', utm: { source: 'li', medium: '', campaign: '' } },
  ...overrides,
});
const now = () => new Date('2026-11-12T08:00:00Z');

afterEach(() => vi.restoreAllMocks());

test('an accepted inquiry is delivered once as a labelled record with a public reference', async () => {
  const adapter = memoryAdapter();
  const submit = createInquiryService({ adapter, now });
  const result = await submit(inquiry());
  assert.equal(result.status, 'accepted');
  assert.match(result.reference, /^HMV-2026-[2-9A-HJ-NP-Z]{6}$/);
  assert.equal(adapter.records.length, 1);
  const record = adapter.records[0];
  assert.deepEqual(
    { ...record, reference: undefined },
    {
      reference: undefined,
      createdAt: '2026-11-12T08:00:00.000Z',
      locale: 'en',
      product: { id: 'passion-fruit', name: 'Passion fruit' },
      origin: 'Vietnam',
      destination: 'Rotterdam',
      volume: '2 containers',
      application: '',
      transport: 'Refrigerated container',
      requirements: [
        { key: 'variety', label: 'Variety', value: 'Purple' },
        { key: 'brix', label: 'Brix requirement', value: '14+' },
      ],
      notes: '',
      contact: { company: 'Example Foods', email: 'buyer@example.com', name: 'Jan', phone: '' },
      source: { page: '/products/passion-fruit', landingPage: '/', referrer: 'https://www.google.com', utm: { source: 'li', medium: '', campaign: '' } },
      consent: { contactAcceptedAt: '2026-11-12T08:00:00.000Z' },
    },
  );
});

test('duplicate submits share one delivery and one reference, also while the first is in flight', async () => {
  const adapter = memoryAdapter();
  const submit = createInquiryService({ adapter, now });
  const [a, b] = await Promise.all([submit(inquiry()), submit(inquiry())]);
  const c = await submit(inquiry());
  assert.equal(adapter.records.length, 1);
  assert.equal(a.reference, b.reference);
  assert.equal(a.reference, c.reference);
  await submit(inquiry({ idempotencyKey: 'another-key-0001' }));
  assert.equal(adapter.records.length, 2);
});

test('a failed delivery is reported, logs no contact details, and can be retried with the same key', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  let fail = true;
  const adapter = { async deliver() { if (fail) throw new Error('webhook responded 500'); } };
  const submit = createInquiryService({ adapter, now });
  assert.deepEqual(await submit(inquiry()), { status: 'failed' });
  assert.doesNotMatch(error.mock.calls.flat().join(' '), /buyer@example\.com|Example Foods|Jan/);
  fail = false;
  assert.equal((await submit(inquiry())).status, 'accepted');
});

test('invalid input, no delivery adapter and spam: answered without delivering', async () => {
  const adapter = memoryAdapter();
  assert.equal((await createInquiryService({ adapter })(inquiry({ contact: { company: 'X', email: 'bad' } }))).status, 'invalid');
  assert.deepEqual(await createInquiryService({ adapter: null })(inquiry()), { status: 'unavailable' });
  const spam = await createInquiryService({ adapter, now })(inquiry({ website: 'http://spam.example' }));
  assert.equal(spam.status, 'accepted');
  assert.equal(adapter.records.length, 0);
});

test('webhook adapter: signed JSON with the inquiry key as idempotency key; non-2xx is a failure', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push([url, init]); return { ok: calls.length === 1, status: calls.length === 1 ? 202 : 500 }; };
  const adapter = webhookAdapter({ url: 'https://hooks.example/hmv', secret: 's3cret', fetchImpl });
  const record = { reference: 'HMV-2026-ABCDEF', product: null };
  await adapter.deliver(record, { idempotencyKey: '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69' });
  const [url, init] = calls[0];
  assert.equal(url, 'https://hooks.example/hmv');
  assert.equal(init.headers['idempotency-key'], '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69');
  assert.equal(init.headers['x-hmv-signature'], `sha256=${createHmac('sha256', 's3cret').update(init.body).digest('hex')}`);
  assert.deepEqual(JSON.parse(init.body), record);
  await assert.rejects(adapter.deliver(record, { idempotencyKey: 'k' }), /500/);
});

test('webhook: a retry after a lost response carries the same idempotency key, whatever reference it draws', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const calls = [];
  // The first delivery reaches the webhook but its answer never arrives; the retry is answered.
  const fetchImpl = async (url, init) => {
    calls.push(init);
    if (calls.length === 1) throw new Error('timeout');
    return { ok: true, status: 202 };
  };
  const submit = createInquiryService({ adapter: webhookAdapter({ url: 'https://hooks.example/hmv', fetchImpl }), now });
  assert.deepEqual(await submit(inquiry()), { status: 'failed' });
  assert.equal((await submit(inquiry())).status, 'accepted');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].headers['idempotency-key'], inquiry().idempotencyKey);
  assert.equal(calls[1].headers['idempotency-key'], calls[0].headers['idempotency-key']);
  assert.notEqual(JSON.parse(calls[0].body).reference, undefined);
});

test('the same key with other content is a conflict: never the first result, never replacing it', async () => {
  const adapter = memoryAdapter();
  const submit = createInquiryService({ adapter, now });
  const first = await submit(inquiry());
  assert.equal(first.status, 'accepted');
  // Same key, a changed contact: refused, nothing delivered.
  assert.deepEqual(await submit(inquiry({ contact: { company: 'Other Foods', email: 'other@example.com', name: '', phone: '' } })), { status: 'conflict' });
  assert.equal(adapter.records.length, 1);
  // The original entry stands: the exact retry still gets the first result.
  assert.deepEqual(await submit(inquiry()), first);
  // Key order in the request does not matter: same content, same fingerprint.
  const reordered = Object.fromEntries(Object.entries(inquiry()).reverse());
  assert.deepEqual(await submit(reordered), first);
  assert.equal(adapter.records.length, 1);
});

test('delivery is configured by environment only; nothing configured means no adapter', () => {
  assert.equal(deliveryAdapterFromEnv({}), null);
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'webhook' }), null);
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'webhook', INQUIRY_WEBHOOK_URL: 'http://insecure.example' }), null);
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'webhook', INQUIRY_WEBHOOK_URL: 'https://hooks.example' }).name, 'webhook');
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'log', NODE_ENV: 'development' }).name, 'log');
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'log', NODE_ENV: 'production' }), null);
});

test('references: HMV-<year>-<6 unambiguous characters>', () => {
  assert.equal(createReference(new Date('2027-01-01T00:00:00Z'), () => 0), 'HMV-2027-222222');
  assert.match(createReference(), /^HMV-\d{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
});

// Shared with the CMS (CMS_HMV backend/src/modules/trade-inquiries/trade-inquiries.spec.ts and docs/sales/TRADE_INQUIRIES.md):
// both repositories must produce this signature over these exact body bytes, or the integration has drifted.
const SIGNING_TEST_VECTOR = {
  secret: 'hmv-shared-test-vector-secret-0123456789abcdef',
  timestamp: '1767225600',
  idempotencyKey: '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69',
  body: '{"locale":"en","productId":"dried-cassava-chips","origin":"vietnam","destination":"Singapore","volume":{"amount":"5000","unit":"mt_month"},"application":"bioethanol","transport":"sea_fcl","requirements":{},"contact":{"company":"Example Co","email":"buyer@example.com"},"consentAt":"2026-01-01T00:00:00.000Z"}',
  bodySha256: '20fe22d201ffaf572bf56b405b8e5695a6e8f270f1312238c40cc078e7431d9c',
  signature: '37a0452e58562fb1d41ff58ad73f4cc362cd6586e529d2b958476a905d5f4d91',
};

/**
 * A CMS stand-in that verifies like the CMS (written independently of the adapter): HMAC over timestamp, key and the
 * SHA-256 of the body string it received; a mismatch is 401. Otherwise it answers `respond(accepted count)`.
 */
function fakeCms(respond) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const { 'x-hmv-timestamp': ts, 'idempotency-key': key, 'x-hmv-signature': signature } = init.headers;
    const hash = createHash('sha256').update(init.body).digest('hex');
    const expected = createHmac('sha256', SIGNING_TEST_VECTOR.secret).update(`${ts}.${key}.${hash}`).digest('hex');
    if (signature !== expected) return { status: 401, ok: false, json: async () => ({ code: 'SIGNATURE_INVALID' }) };
    calls.push({ url, headers: init.headers, raw: init.body, body: JSON.parse(init.body) });
    const { status, body } = respond(calls.length);
    return { status, ok: status < 300, json: async () => body };
  };
  return { calls, fetchImpl };
}
const cms = (fetchImpl, over = {}) =>
  cmsAdapter({ url: 'https://cms.example/api/v1/integrations/trade-inquiries', secret: SIGNING_TEST_VECTOR.secret, fetchImpl, now: () => 1767225600_000, ...over });

test('CMS signature: the shared test vector (timestamp, key and exact body)', () => {
  const v = SIGNING_TEST_VECTOR;
  assert.equal(bodyHash(v.body), v.bodySha256);
  assert.equal(signCmsRequest(v.secret, v.timestamp, v.idempotencyKey, v.body), v.signature);
  // The same JSON written differently is another body, another signature.
  assert.notEqual(signCmsRequest(v.secret, v.timestamp, v.idempotencyKey, JSON.stringify(JSON.parse(v.body), null, 1)), v.signature);
});

test('the vector body is a product-led inquiry exactly as the adapter serializes it', () => {
  const { ok, value } = validateInquiry({
    idempotencyKey: SIGNING_TEST_VECTOR.idempotencyKey,
    locale: 'en',
    product: 'dried-cassava-chips',
    origin: 'vietnam',
    destination: 'Singapore',
    volume: { amount: '5000', unit: 'mt_month' },
    application: 'bioethanol',
    transport: 'sea_fcl',
    contact: { company: 'Example Co', email: 'buyer@example.com' },
    consent: { contact: true },
  });
  assert.equal(ok, true);
  // No page context here: `source` is empty, and the vector leaves it out.
  const { source, ...payload } = cmsPayload(value, '2026-01-01T00:00:00.000Z');
  assert.equal(JSON.stringify(source), '{}');
  assert.equal(JSON.stringify(payload), SIGNING_TEST_VECTOR.body);
});

test('CMS adapter: signed request with ids, no honeypot; the buyer gets the CMS reference', async () => {
  const fake = fakeCms(() => ({ status: 201, body: { reference: 'HMV-2026-7KQ4XM', duplicate: false } }));
  const submit = createInquiryService({ adapter: cms(fake.fetchImpl), now });
  assert.deepEqual(await submit(inquiry()), { status: 'accepted', reference: 'HMV-2026-7KQ4XM' });

  const [{ url, headers, raw, body }] = fake.calls;
  assert.equal(url, 'https://cms.example/api/v1/integrations/trade-inquiries');
  // Accepted by the verifying stand-in: the signature covers the exact string sent.
  assert.deepEqual(headers, {
    'content-type': 'application/json',
    'idempotency-key': SIGNING_TEST_VECTOR.idempotencyKey,
    'x-hmv-timestamp': SIGNING_TEST_VECTOR.timestamp,
    'x-hmv-signature': signCmsRequest(SIGNING_TEST_VECTOR.secret, SIGNING_TEST_VECTOR.timestamp, SIGNING_TEST_VECTOR.idempotencyKey, raw),
  });
  assert.doesNotMatch(JSON.stringify(headers), /buyer@example\.com|Example Foods/);
  assert.deepEqual(body, {
    locale: 'en',
    productId: 'passion-fruit',
    origin: 'vietnam',
    destination: 'Rotterdam',
    volume: { amount: '2', unit: 'containers' },
    transport: 'sea_reefer',
    requirements: { brix: '14+', variety: 'Purple' },
    contact: { company: 'Example Foods', email: 'buyer@example.com', name: 'Jan' },
    source: { landingPage: '/', referrer: 'https://www.google.com', utm: { source: 'li' } },
    consentAt: '2026-11-12T08:00:00.000Z',
  });
});

test('CMS adapter: a body changed after signing is refused by the CMS (401), and the buyer sees the failure', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const fake = fakeCms(() => ({ status: 201, body: { reference: 'HMV-2026-7KQ4XM', duplicate: false } }));
  // Headers signed for the real body, a different body on the wire.
  const tamper = (url, init) => fake.fetchImpl(url, { ...init, body: init.body.replace('Example Foods', 'Attacker Ltd') });
  const submit = createInquiryService({ adapter: cms(tamper), now });
  assert.deepEqual(await submit(inquiry()), { status: 'failed' });
  assert.equal(fake.calls.length, 0);
});

test('CMS adapter: a repeat of the same submission (200 duplicate) shows the same reference', async () => {
  const fake = fakeCms(n => ({ status: n === 1 ? 201 : 200, body: { reference: 'HMV-2026-7KQ4XM', duplicate: n > 1 } }));
  // Two server instances: no shared in-memory cache, so only the CMS deduplicates.
  const first = await createInquiryService({ adapter: cms(fake.fetchImpl), now })(inquiry());
  const again = await createInquiryService({ adapter: cms(fake.fetchImpl), now })(inquiry());
  assert.equal(first.reference, 'HMV-2026-7KQ4XM');
  assert.equal(again.reference, first.reference);
  assert.equal(fake.calls[0].headers['idempotency-key'], fake.calls[1].headers['idempotency-key']);
  // An identical retry: the same body, the same signature.
  assert.equal(fake.calls[0].raw, fake.calls[1].raw);
});

test('CMS adapter: refused signature, CMS errors and malformed replies are failures that log no contact details', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const replies = [
    { status: 401, body: { code: 'SIGNATURE_INVALID' } },
    { status: 503, body: { code: 'INTEGRATION_DISABLED' } },
    { status: 400, body: { code: 'VALIDATION_FAILED' } },
    { status: 201, body: { reference: 'not-a-reference' } },
  ];
  const fake = fakeCms(n => replies[n - 1]);
  const submit = createInquiryService({ adapter: cms(fake.fetchImpl), now });
  for (let i = 0; i < replies.length; i++) assert.deepEqual(await submit(inquiry()), { status: 'failed' });
  const logged = error.mock.calls.flat().join('\n');
  assert.match(logged, /CMS responded 401 SIGNATURE_INVALID/);
  assert.match(logged, /CMS responded 503 INTEGRATION_DISABLED/);
  assert.match(logged, /no reference/);
  assert.doesNotMatch(logged, /buyer@example\.com|Example Foods|Jan|hmv-shared-test-vector-secret/);
});

test('CMS adapter: a CMS that does not answer in time is a failure', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const hang = (url, init) => new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
  const submit = createInquiryService({ adapter: cms(hang, { timeoutMs: 20 }), now });
  assert.deepEqual(await submit(inquiry()), { status: 'failed' });
});

test('CMS delivery is configured by server environment: https (or this machine) and a 32+ character secret', () => {
  const secret = 'x'.repeat(32);
  const url = 'https://cms.example/api/v1/integrations/trade-inquiries';
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'cms', CMS_INQUIRY_URL: url, CMS_INQUIRY_SECRET: secret }).name, 'cms');
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'cms', CMS_INQUIRY_URL: url, CMS_INQUIRY_SECRET: 'short' }), null);
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'cms', CMS_INQUIRY_URL: url }), null);
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'cms', CMS_INQUIRY_URL: 'http://cms.example/x', CMS_INQUIRY_SECRET: secret }), null);
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'cms', CMS_INQUIRY_URL: 'http://localhost:4000/x', CMS_INQUIRY_SECRET: secret }).name, 'cms');
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'cms', CMS_INQUIRY_URL: 'http://127.0.0.1:4000/x', CMS_INQUIRY_SECRET: secret }).name, 'cms');
  // Plain http only to this machine, read from the parsed host: look-alikes are refused.
  for (const deceptive of [
    'http://localhost.evil.example/x',
    'http://127.0.0.1.evil.example/x',
    'http://localhost@evil.example/x',
    'http://evil.example/localhost/x',
    'http://evil.example/?u=http://localhost/',
    'ftp://localhost/x',
    'not a url',
  ]) {
    assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'cms', CMS_INQUIRY_URL: deceptive, CMS_INQUIRY_SECRET: secret }), null, deceptive);
  }
  // The webhook stays https only, also for this machine.
  assert.equal(deliveryAdapterFromEnv({ INQUIRY_DELIVERY: 'webhook', INQUIRY_WEBHOOK_URL: 'http://localhost/hook' }), null);
});

test('the inquiry fingerprint is independent of key order and changes with any value', async () => {
  const { inquiryFingerprint } = await import('@/features/trade-desk/fingerprint');
  const a = inquiryFingerprint({ idempotencyKey: 'k1', b: 1, a: { y: [1, 2], x: 'é' } });
  assert.equal(a, '{"a":{"x":"é","y":[1,2]},"b":1}');
  assert.equal(inquiryFingerprint({ a: { x: 'é', y: [1, 2] }, b: 1, idempotencyKey: 'k2', website: 'x' }), a);
  assert.notEqual(inquiryFingerprint({ a: { x: 'é', y: [2, 1] }, b: 1 }), a);
  // Pinned byte for byte: null and undefined, nested arrays and objects, escaping, falsy values.
  assert.equal(
    inquiryFingerprint({ b: undefined, a: null, c: [null, { z: 1, y: 'x' }, [], {}], d: '"q"\\ é', e: 0, f: false, idempotencyKey: 'k', website: 'w' }),
    '{"a":null,"b":null,"c":[null,{"y":"x","z":1},[],{}],"d":"\\"q\\"\\\\ é","e":0,"f":false}',
  );
  const draft = {
    idempotencyKey: 'k',
    website: '',
    locale: 'en',
    product: 'dried-cassava-chips',
    origin: 'vietnam',
    destination: 'Qinzhou, China',
    volume: { amount: '5000', unit: 'mt_month' },
    application: 'feed',
    transport: 'sea_fcl',
    requirements: { starch: '70', incoterm: 'CIF' },
    notes: 'Monthly',
    contact: { company: 'Feed Co', email: 'buyer@example.com', name: '', phone: '' },
    consent: { contact: true },
    context: { page: '/products/dried-cassava-chips', landingPage: '/', referrer: '', utm: { source: 'linkedin', medium: null, campaign: null } },
  };
  assert.equal(
    inquiryFingerprint(draft),
    '{"application":"feed","consent":{"contact":true},"contact":{"company":"Feed Co","email":"buyer@example.com","name":"","phone":""},"context":{"landingPage":"/","page":"/products/dried-cassava-chips","referrer":"","utm":{"campaign":null,"medium":null,"source":"linkedin"}},"destination":"Qinzhou, China","locale":"en","notes":"Monthly","origin":"vietnam","product":"dried-cassava-chips","requirements":{"incoterm":"CIF","starch":"70"},"transport":"sea_fcl","volume":{"amount":"5000","unit":"mt_month"}}',
  );
});
