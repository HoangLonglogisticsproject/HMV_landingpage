import { test } from 'vitest';
import assert from 'node:assert/strict';
import { emptyBrief, progress, summarize, toInquiry, withProduct } from './brief.js';
import { missingInformation, requirementsFor } from './rules.js';
import { validateInquiry } from './validation.js';

const keys = brief => missingInformation(brief).map(m => m.key);
const pending = 'to be confirmed';

test('rules: each product asks for its own controlled requirements', () => {
  const passion = requirementsFor({ goal: 'sourcing', product: 'passion-fruit' }).map(r => r.key);
  assert.deepEqual(passion, ['variety', 'sizeWeight', 'brix', 'packaging', 'deliveryWindow', 'destinationPort', 'destinationRequirements']);
  const cassava = requirementsFor({ goal: 'sourcing', product: 'dried-cassava-chips' }).map(r => r.key);
  assert.deepEqual(cassava, ['starch', 'moisture', 'loading', 'incoterm', 'destinationPort', 'deliveryWindow']);
  // Other products: their specification points from data/hmv.js, then route and terms.
  const bananas = requirementsFor({ goal: 'sourcing', product: 'bananas' }).map(r => r.key);
  assert.deepEqual(bananas, ['spec-fruit-size', 'spec-maturity', 'spec-carton-weight', 'spec-cold-chain', 'destinationPort', 'deliveryWindow', 'certification', 'incoterm']);
  assert.deepEqual(requirementsFor({ goal: 'sourcing', product: null }), []);
  assert.ok(requirementsFor({ goal: 'customs' }).some(r => r.key === 'hsCode'));
});

test('what HMV still needs shrinks as the brief is completed', () => {
  let brief = emptyBrief();
  assert.deepEqual(keys(brief), ['product', 'destination', 'volume']);
  brief = withProduct(brief, 'dried-cassava-chips');
  assert.deepEqual(keys(brief).slice(0, 3), ['destination', 'volume', 'application']);
  brief = { ...brief, destination: 'Qinzhou', volume: { amount: '5000', unit: 'mt_month' }, application: 'feed' };
  assert.equal(keys(brief)[0], 'starch');
  brief = { ...brief, requirements: { starch: '70', moisture: '14', loading: 'bulk', incoterm: 'CIF', destinationPort: 'Qinzhou', deliveryWindow: 'Q1' } };
  assert.deepEqual(keys(brief), []);
  assert.equal(progress(brief), 100);
  assert.equal(progress(emptyBrief()), 0);
});

test('choosing a product resets what belonged to the previous one', () => {
  const brief = { ...emptyBrief({ product: 'dried-cassava-chips' }), application: 'feed', requirements: { starch: '70' }, destination: 'Qinzhou' };
  const next = withProduct(brief, 'passion-fruit');
  assert.equal(next.product, 'passion-fruit');
  assert.equal(next.origin, 'vietnam');
  assert.equal(next.volume.unit, 'containers');
  assert.equal(next.application, '');
  assert.deepEqual(next.requirements, {});
  assert.equal(next.destination, 'Qinzhou');
});

test('the summary states what the buyer entered and what is missing, in both languages', () => {
  const brief = { ...emptyBrief({ product: 'passion-fruit' }), destination: 'Rotterdam', volume: { amount: '2', unit: 'containers' }, requirements: { brix: '14+', packaging: '' } };
  const en = summarize(brief, 'en', { pending });
  assert.deepEqual(en.rows.map(r => [r.key, r.value]), [['product', 'Passion fruit'], ['route', 'Vietnam → Rotterdam'], ['volume', '2 containers']]);
  assert.deepEqual(en.requirements, [{ key: 'brix', label: 'Brix requirement', value: '14+' }]);
  assert.ok(en.missing.some(m => m.label === 'Packaging'));
  const vi = summarize(brief, 'vi', { pending: 'cần xác nhận' });
  assert.deepEqual(vi.rows.map(r => r.value), ['Chanh dây', 'Việt Nam → Rotterdam', '2 container']);
  // An unknown destination is shown as pending, never guessed.
  assert.equal(summarize({ ...brief, destination: '' }, 'en', { pending }).rows[1].value, 'Vietnam → to be confirmed');
});

test('no fake commercial claims: the summary only restates the buyer input and the controlled labels', () => {
  const brief = { ...emptyBrief({ product: 'dried-cassava-chips' }), destination: 'Qinzhou', volume: { amount: '5000', unit: 'mt_month' }, application: 'feed', transport: 'sea_fcl' };
  for (const lang of ['en', 'vi']) {
    const text = JSON.stringify(summarize(brief, lang, { pending }));
    assert.doesNotMatch(text, /\b(USD|EUR|VND)\b|\$\s?\d|price|giá|in stock|available|guarantee|certified|transit|\d+\s*(days|ngày)/i, lang);
  }
});

test('the inquiry carries the brief, contact, consent and context; blank requirements are left out', () => {
  const brief = { ...emptyBrief({ product: 'passion-fruit' }), requirements: { brix: '14+', variety: ' ' } };
  const inquiry = toInquiry(brief, {
    contact: { company: 'Acme', email: 'a@acme.com', name: '', phone: '' },
    consent: true,
    locale: 'en',
    context: { page: '/products/passion-fruit', landingPage: '/', referrer: '', utm: {} },
    idempotencyKey: 'abcdef12-3456',
  });
  assert.deepEqual(inquiry.requirements, { brix: '14+' });
  assert.deepEqual(inquiry.consent, { contact: true });
  assert.equal(inquiry.website, '');
  assert.equal(validateInquiry(inquiry).ok, true);
});
