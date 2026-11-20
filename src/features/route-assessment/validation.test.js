import { test } from 'vitest';
import assert from 'node:assert/strict';
import { assessment } from './fixtures/assessment.js';
import { LIMITS, SERVICE, validateRouteAssessment } from './validation.js';

test('a complete request: trimmed, the email lower-cased, the visit context reduced to paths and an origin', () => {
  const result = validateRouteAssessment({ ...assessment, unknown: 'dropped' });
  assert.equal(result.ok, true);
  assert.equal(result.spam, false);
  assert.deepEqual(result.value, {
    idempotencyKey: assessment.idempotencyKey,
    locale: 'vi',
    service: SERVICE.id,
    source: 'vi_route_assessment',
    origin: 'Bình Dương, Việt Nam',
    destination: 'Phnom Penh, Campuchia',
    cargo: 'Linh kiện điện tử, 4 pallet',
    volume: '2.5 CBM, 900 kg',
    frequency: '',
    notes: '',
    contact: { company: 'Factory Co', email: 'buyer@example.com', name: '', phone: '+84 28 1234 5678' },
    context: { page: '/vi/logistics/vietnam-cambodia-consolidation', landingPage: '/vi', referrer: 'https://www.google.com', utm: { source: 'google', medium: '', campaign: '' } },
  });
});

test('the required shipment fields, the contact, consent and key: each missing one named, in form order', () => {
  const result = validateRouteAssessment({ service: SERVICE.id, contact: { email: 'nope' } });
  assert.deepEqual(result, { ok: false, errors: ['origin', 'destination', 'cargo', 'volume', 'contact.company', 'contact.email', 'consent.contact', 'idempotencyKey'] });
  assert.deepEqual(validateRouteAssessment(null).errors.slice(0, 2), ['service', 'origin']);
});

test('another service is refused; a text over its limit is an error, never shortened; a bad phone is refused', () => {
  assert.deepEqual(validateRouteAssessment({ ...assessment, service: 'dried-cassava-chips' }).errors, ['service']);
  const long = validateRouteAssessment({ ...assessment, notes: 'x'.repeat(LIMITS.notes + 1), frequency: 'y'.repeat(LIMITS.frequency + 1) });
  assert.deepEqual(long.errors, ['frequency', 'notes']);
  assert.deepEqual(validateRouteAssessment({ ...assessment, contact: { ...assessment.contact, phone: 'call me' } }).errors, ['contact.phone']);
});

test('the source keeps a plain slug only; the locale is en unless vi; a filled honeypot is spam', () => {
  assert.equal(validateRouteAssessment({ ...assessment, source: 'Free text <script>' }).value.source, '');
  assert.equal(validateRouteAssessment({ ...assessment, locale: 'fr' }).value.locale, 'en');
  assert.equal(validateRouteAssessment({ ...assessment, website: 'http://spam.example' }).spam, true);
});
