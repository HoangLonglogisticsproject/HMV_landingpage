import { test } from 'vitest';
import assert from 'node:assert/strict';
import { validateInquiry } from './validation.js';

const valid = overrides => ({
  idempotencyKey: '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69',
  locale: 'vi',
  goal: 'sourcing',
  product: 'dried-cassava-chips',
  origin: 'cambodia',
  destination: 'Qinzhou, China',
  volume: { amount: '5000', unit: 'mt_month' },
  application: 'feed',
  transport: 'sea_fcl',
  requirements: { starch: '70', incoterm: 'CIF' },
  notes: 'Monthly contract',
  contact: { company: 'Feed Co', email: 'Buyer@Example.com', name: 'An', phone: '+84 909 000 000' },
  consent: { contact: true },
  context: { page: '/vi/san-pham/san-lat-kho?utm_source=x', landingPage: '/', referrer: 'https://www.google.com/search?q=cassava', utm: { source: 'linkedin', medium: 'social', campaign: 'q4' } },
  website: '',
  ...overrides,
});

test('a valid inquiry is normalised: allowed values only, email lowercased, no query strings or referrer paths', () => {
  const result = validateInquiry(valid());
  assert.equal(result.ok, true);
  assert.equal(result.spam, false);
  const v = result.value;
  assert.equal(v.contact.email, 'buyer@example.com');
  assert.equal(v.origin, 'cambodia');
  assert.deepEqual(v.requirements, { starch: '70', incoterm: 'CIF' });
  assert.deepEqual(v.context, { page: '/vi/san-pham/san-lat-kho', landingPage: '/', referrer: 'https://www.google.com', utm: { source: 'linkedin', medium: 'social', campaign: 'q4' } });
});

test('invalid contact, consent, product and requirement values are refused, by field', () => {
  const result = validateInquiry(valid({
    product: 'gold',
    requirements: { incoterm: 'XYZ' },
    contact: { company: 'A', email: 'nope', phone: '<script>' },
    consent: { contact: false },
    idempotencyKey: 'x',
  }));
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.sort(), ['consent.contact', 'contact.company', 'contact.email', 'contact.phone', 'idempotencyKey', 'product'].sort());
});

test('unknown fields and requirement keys are dropped; strings are capped; enums fall back', () => {
  const result = validateInquiry(valid({
    product: 'passion-fruit',
    origin: 'cambodia',
    application: 'feed',
    transport: 'teleport',
    volume: { amount: '2', unit: 'barrels' },
    requirements: { brix: 'x'.repeat(500), starch: '70', admin: true },
    notes: 'n'.repeat(5000),
    extra: 'ignored',
  }));
  assert.equal(result.ok, true);
  const v = result.value;
  assert.equal(v.origin, 'vietnam');
  assert.equal(v.application, '');
  assert.equal(v.transport, '');
  assert.equal(v.volume.unit, 'containers');
  assert.deepEqual(Object.keys(v.requirements), ['brix']);
  assert.equal(v.requirements.brix.length, 200);
  assert.equal(v.notes.length, 2000);
  assert.equal('extra' in v, false);
});

test('logistics and customs need a goods description; the honeypot marks spam; garbage bodies fail', () => {
  assert.deepEqual(validateInquiry(valid({ goal: 'logistics', goods: '' })).errors, ['goods']);
  const customs = validateInquiry(valid({ goal: 'customs', goods: 'Chemical samples', requirements: { service: 'import', hsCode: '2905' } }));
  assert.equal(customs.ok, true);
  assert.equal(customs.value.product, null);
  assert.deepEqual(customs.value.requirements, { service: 'import', hsCode: '2905' });
  assert.equal(validateInquiry(valid({ website: 'http://spam' })).spam, true);
  assert.equal(validateInquiry(null).ok, false);
  assert.equal(validateInquiry(valid({ volume: { amount: 'lots', unit: 'mt' } })).errors[0], 'volume.amount');
  assert.equal(validateInquiry(valid({ context: { page: '//evil.example', referrer: 'javascript:alert(1)' } })).value.context.page, '');
});
