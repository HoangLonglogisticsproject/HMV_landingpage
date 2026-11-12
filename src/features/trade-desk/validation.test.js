import { test } from 'vitest';
import assert from 'node:assert/strict';
import { validateInquiry } from './validation.js';

const valid = overrides => ({
  idempotencyKey: '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69',
  locale: 'vi',
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

test('invalid contact, consent and product values are refused, by field', () => {
  const result = validateInquiry(valid({
    product: 'gold',
    contact: { company: 'A', email: 'nope', phone: '<script>' },
    consent: { contact: false },
    idempotencyKey: 'x',
  }));
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.sort(), ['consent.contact', 'contact.company', 'contact.email', 'contact.phone', 'idempotencyKey', 'product'].sort());
});

test('an unknown option of a choice requirement is refused for a valid product', () => {
  const result = validateInquiry(valid({ product: 'dried-cassava-chips', requirements: { incoterm: 'XYZ', starch: '70' } }));
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, ['requirements.incoterm']);
});

test('unknown fields and requirement keys are dropped; enums fall back', () => {
  const result = validateInquiry(valid({
    product: 'passion-fruit',
    origin: 'cambodia',
    application: 'feed',
    transport: 'teleport',
    volume: { amount: '2', unit: 'barrels' },
    requirements: { brix: '14+', starch: '70', admin: true },
    extra: 'ignored',
  }));
  assert.equal(result.ok, true);
  const v = result.value;
  assert.equal(v.origin, 'vietnam');
  assert.equal(v.application, '');
  assert.equal(v.transport, '');
  assert.equal(v.volume.unit, 'containers');
  assert.deepEqual(Object.keys(v.requirements), ['brix']);
  assert.equal('extra' in v, false);
});

test('text over its limit is an error for that field, never silently shortened', () => {
  const at = n => 'x'.repeat(n);
  // At the limit: accepted unchanged (the same limits are the fields' maxLength and the CMS contract).
  const ok = validateInquiry(valid({ destination: at(120), notes: at(2000), requirements: { starch: at(200) } }));
  assert.equal(ok.ok, true);
  assert.equal(ok.value.destination.length, 120);
  assert.equal(ok.value.notes.length, 2000);
  // Over it: refused, by field.
  const over = validateInquiry(valid({
    destination: at(121),
    notes: at(2001),
    requirements: { starch: at(201) },
    volume: { amount: '1'.repeat(21), unit: 'mt' },
    contact: { company: at(151), email: `${at(250)}@x.example`, name: at(101), phone: '1'.repeat(41) },
  }));
  assert.deepEqual(over.errors.sort(), [
    'contact.company', 'contact.email', 'contact.name', 'contact.phone', 'destination', 'notes', 'requirements.starch', 'volume.amount',
  ].sort());
  // The origin is one the product offers: anything else is its first origin, never free text.
  assert.equal(validateInquiry(valid({ product: 'passion-fruit', origin: 'cambodia', application: '', requirements: {} })).value.origin, 'vietnam');
  assert.equal(validateInquiry(valid({ origin: at(121) })).value.origin, 'vietnam');
});

test('every inquiry names a product; goal and goods are not part of it; the honeypot marks spam; garbage bodies fail', () => {
  assert.deepEqual(validateInquiry(valid({ product: null })).errors, ['product']);
  assert.deepEqual(validateInquiry(valid({ product: 'logistics', goods: 'Samples' })).errors, ['product']);
  const legacy = validateInquiry(valid({ goal: 'customs', goods: 'Chemical samples' }));
  assert.equal(legacy.ok, true);
  assert.equal('goal' in legacy.value || 'goods' in legacy.value, false);
  assert.equal(validateInquiry(valid({ website: 'http://spam' })).spam, true);
  assert.equal(validateInquiry(null).ok, false);
  assert.equal(validateInquiry(valid({ volume: { amount: 'lots', unit: 'mt' } })).errors[0], 'volume.amount');
  assert.equal(validateInquiry(valid({ context: { page: '//evil.example', referrer: 'javascript:alert(1)' } })).value.context.page, '');
});

test('email shape: one @, a local part, no whitespace, a dotted domain; length is checked separately', () => {
  const email = value => validateInquiry(valid({ contact: { company: 'Feed Co', email: value } }));
  for (const ok of ['buyer@example.com', 'Buyer@Example.com', 'first.last@example.com', 'procurement.eu+cassava@feed-co.example.com', 'a@acme.com', ' buyer@example.com ']) {
    assert.equal(email(ok).ok, true, ok);
  }
  assert.equal(email('Buyer@Example.com').value.contact.email, 'buyer@example.com');
  for (const bad of [
    '', 'buyer.example.com', 'buyer@', '@example.com', // no @, or nothing on one side
    'buyer@@example.com', 'buyer@team@example.com', // more than one @
    'buyer @example.com', 'buyer@exa mple.com', 'buyer@example.com\tx', // whitespace
    'buyer..name@example.com', '.buyer@example.com', 'buyer.@example.com', // dots in the local part (as the CMS)
    'buyer@example', 'buyer@example.', 'buyer@.example.com', 'buyer@example..com', 'buyer@example.c', // no usable domain
  ]) {
    assert.deepEqual(email(bad).errors, ['contact.email'], bad);
  }
  // Long input is refused quickly and only for its length (no backtracking pattern involved).
  assert.deepEqual(email(`${'a'.repeat(250)}@x.example`).errors, ['contact.email']);
  assert.deepEqual(email(`${'a@'.repeat(5000)}x`).errors, ['contact.email']);
});

test('digits: phone and volume accept the same characters as before', () => {
  for (const phone of ['', '+84 909 000 000', '(028) 3822-1234', '0909.000.000']) assert.equal(validateInquiry(valid({ contact: { company: 'Feed Co', email: 'a@b.co', phone } })).ok, true, phone);
  for (const phone of ['+84 909 abc', '٠١٢', '0909/000']) assert.deepEqual(validateInquiry(valid({ contact: { company: 'Feed Co', email: 'a@b.co', phone } })).errors, ['contact.phone'], phone);
  for (const amount of ['5000', '5,000', '5.000,5', '2 500']) assert.equal(validateInquiry(valid({ volume: { amount, unit: 'mt' } })).ok, true, amount);
  for (const amount of ['lots', ',5', '٥']) assert.deepEqual(validateInquiry(valid({ volume: { amount, unit: 'mt' } })).errors, ['volume.amount'], amount);
});

test('errors come in checking order: plan, requirements, contact, consent, then the key', () => {
  const result = validateInquiry({
    product: 'logistics',
    destination: 'x'.repeat(121),
    notes: 'x'.repeat(2001),
    volume: { amount: 'lots' },
    contact: { company: 'E', email: 'nope', phone: 'call me' },
    idempotencyKey: 'bad key',
  });
  assert.deepEqual(result.errors, ['product', 'destination', 'notes', 'volume.amount', 'contact.company', 'contact.email', 'contact.phone', 'consent.contact', 'idempotencyKey']);
  const requirement = validateInquiry(valid({ requirements: { starch: 'x'.repeat(201), incoterm: 'XYZ' }, contact: { company: 'E', email: 'a@b.co' } }));
  assert.deepEqual(requirement.errors, ['requirements.starch', 'requirements.incoterm', 'contact.company']);
});

test('contactErrors: the contact fields and consent that the send would refuse, by the same rules', async () => {
  const { contactErrors } = await import('./validation.js');
  const ok = { company: 'Feed Co', email: 'buyer@example.com', name: '', phone: '' };
  assert.deepEqual(contactErrors(ok, true), []);
  assert.deepEqual(contactErrors({ ...ok, company: 'E', email: 'buyer..name@example.com', phone: 'call me' }, false), ['contact.company', 'contact.email', 'contact.phone', 'consent.contact']);
});
