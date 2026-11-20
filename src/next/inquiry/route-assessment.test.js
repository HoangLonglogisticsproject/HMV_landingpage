import { afterEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { assessment } from '../../features/route-assessment/fixtures/assessment.js';
import { validateRouteAssessment } from '../../features/route-assessment/validation.js';
import { validateInquiry } from '../../features/trade-desk/validation.js';
import { memoryAdapter, webhookAdapter } from './adapters.js';
import { createRouteAssessmentService, routeAssessmentRecord } from './route-assessment.js';
import { toRecord } from './service.js';

const meta = { reference: 'HMV-2026-7KQ4XM', createdAt: '2026-11-21T08:00:00.000Z' };
const fixed = { now: () => new Date('2026-11-21T08:00:00Z'), newReference: () => meta.reference };

afterEach(() => vi.restoreAllMocks());

test('the record has every key of a Trade Desk record, so the webhook flow and its sheet columns take it', () => {
  const tradeDesk = toRecord(validateInquiry({
    idempotencyKey: 'k-12345678', product: 'dried-cassava-chips', contact: { company: 'Feed Co', email: 'b@example.com' }, consent: { contact: true },
  }).value, meta);
  const record = routeAssessmentRecord(validateRouteAssessment({ ...assessment, frequency: 'weekly' }).value, meta);
  for (const key of Object.keys(tradeDesk)) assert.ok(key in record, key);
  assert.deepEqual(record.product, { id: 'vietnam-cambodia-consolidation', name: 'Vietnam–Cambodia Consolidation' });
  assert.deepEqual(record.service, record.product);
  assert.deepEqual([record.origin, record.destination, record.volume], ['Bình Dương, Việt Nam', 'Phnom Penh, Campuchia', '2.5 CBM, 900 kg']);
  assert.deepEqual(record.requirements, [
    { key: 'cargo', label: 'Cargo description', value: 'Linh kiện điện tử, 4 pallet' },
    { key: 'frequency', label: 'Expected frequency', value: 'weekly' },
  ]);
  assert.deepEqual(record.source, { page: '/vi/logistics/vietnam-cambodia-consolidation', landingPage: '/vi', referrer: 'https://www.google.com', utm: { source: 'google', medium: '', campaign: '' }, cta: 'vi_route_assessment' });
  assert.deepEqual(record.consent, { contactAcceptedAt: meta.createdAt });
  // An optional field left empty is not a requirement.
  assert.deepEqual(routeAssessmentRecord(validateRouteAssessment(assessment).value, meta).requirements.map(r => r.key), ['cargo']);
});

test('accepted through the delivery adapter: one delivery for a double submit, its reference returned', async () => {
  const adapter = memoryAdapter();
  const submit = createRouteAssessmentService(adapter, fixed);
  const [first, again] = await Promise.all([submit(assessment), submit(assessment)]);
  assert.deepEqual(first, { status: 'accepted', reference: meta.reference });
  assert.deepEqual(again, first);
  assert.equal(adapter.records.length, 1);
  assert.equal(adapter.records[0].service.name, 'Vietnam–Cambodia Consolidation');
  // The same key with other content is a conflict, never the first result.
  assert.deepEqual(await submit({ ...assessment, notes: 'changed' }), { status: 'conflict' });
});

test('invalid requests, spam and a missing adapter: nothing delivered', async () => {
  const adapter = memoryAdapter();
  const submit = createRouteAssessmentService(adapter, fixed);
  assert.deepEqual(await submit({ ...assessment, origin: '' }), { status: 'invalid', errors: ['origin'] });
  assert.equal((await submit({ ...assessment, idempotencyKey: 'spam-1234567', website: 'x' })).status, 'accepted');
  assert.equal(adapter.records.length, 0);
  assert.deepEqual(await createRouteAssessmentService(null)(assessment), { status: 'unavailable' });
});

test('the CMS adapter takes commodity inquiries only: a route assessment is not accepted (503), never sent to it', async () => {
  const deliver = vi.fn();
  assert.deepEqual(await createRouteAssessmentService({ name: 'cms', deliver })(assessment), { status: 'unavailable' });
  assert.equal(deliver.mock.calls.length, 0);
});

test('through the webhook: the record as signed JSON with the request idempotency key', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, status: 200 };
  };
  const submit = createRouteAssessmentService(webhookAdapter({ url: 'https://hooks.example/lead', secret: 's3cret', fetchImpl }), fixed);
  assert.equal((await submit(assessment)).status, 'accepted');
  const { url, init } = calls[0];
  assert.equal(url, 'https://hooks.example/lead');
  assert.equal(init.headers['idempotency-key'], assessment.idempotencyKey);
  assert.match(init.headers['x-hmv-signature'], /^sha256=[0-9a-f]{64}$/);
  const body = JSON.parse(init.body);
  assert.deepEqual([body.reference, body.product.name, body.source.cta, body.source.page], [meta.reference, 'Vietnam–Cambodia Consolidation', 'vi_route_assessment', '/vi/logistics/vietnam-cambodia-consolidation']);
  assert.equal(body.contact.email, 'buyer@example.com');
});
