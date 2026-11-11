import { afterEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createInquiryService } from './service.js';
import { deliveryAdapterFromEnv, memoryAdapter, webhookAdapter } from './adapters.js';
import { createReference } from './reference.js';

const inquiry = overrides => ({
  idempotencyKey: '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69',
  locale: 'en',
  goal: 'sourcing',
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
      goal: 'sourcing',
      product: { id: 'passion-fruit', name: 'Passion fruit' },
      goods: '',
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

test('webhook adapter: signed JSON with the reference as idempotency key; non-2xx is a failure', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push([url, init]); return { ok: calls.length === 1, status: calls.length === 1 ? 202 : 500 }; };
  const adapter = webhookAdapter({ url: 'https://hooks.example/hmv', secret: 's3cret', fetchImpl });
  const record = { reference: 'HMV-2026-ABCDEF', product: null };
  await adapter.deliver(record);
  const [url, init] = calls[0];
  assert.equal(url, 'https://hooks.example/hmv');
  assert.equal(init.headers['idempotency-key'], 'HMV-2026-ABCDEF');
  assert.equal(init.headers['x-hmv-signature'], `sha256=${createHmac('sha256', 's3cret').update(init.body).digest('hex')}`);
  assert.deepEqual(JSON.parse(init.body), record);
  await assert.rejects(adapter.deliver(record), /500/);
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
