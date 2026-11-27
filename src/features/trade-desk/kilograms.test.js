import { test } from 'vitest';
import assert from 'node:assert/strict';
import { emptyBrief, summarize } from './brief.js';
import { VOLUME_UNITS, defaultUnit, unitAllowed, unitsFor } from './rules.js';
import { validateInquiry } from './validation.js';
import { deskCopy } from './copy.js';
import { createInquiryService } from '../../next/inquiry/service.js';
import { cmsPayload, memoryAdapter } from '../../next/inquiry/adapters.js';

// Kilograms for golden passion fruit's hospitality and retail buyers. A unit is `{ amount: string, unit: id }` in the
// contract, unchanged; the unit ids are new. Every other product keeps its units, its default and its validation.

const inquiry = overrides => ({
  idempotencyKey: '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69',
  locale: 'en',
  product: 'passion-fruit',
  destination: 'Da Nang, Vietnam',
  volume: { amount: '50', unit: 'kg_week' },
  contact: { company: 'Resort Co', email: 'buyer@example.com' },
  consent: { contact: true },
  context: { page: '/products/passion-fruit/foodservice', landingPage: '/', referrer: '', utm: {} },
  ...overrides,
});

test('the units offered: kilograms first for hospitality and retail, the trade units for export, nothing new anywhere else', () => {
  assert.deepEqual(unitsFor('passion-fruit', 'foodservice'), ['kg', 'kg_week', 'kg_month', 'mt', 'mt_month']);
  assert.deepEqual(unitsFor('passion-fruit', 'retail'), unitsFor('passion-fruit', 'foodservice'));
  assert.deepEqual(unitsFor('passion-fruit', 'export'), ['containers', 'containers_month', 'mt', 'mt_month', 'kg']);
  // The home page's Quick RFQ, the desk without a page, and every other product: the four units of before.
  const before = ['containers', 'containers_month', 'mt', 'mt_month'];
  for (const [product, segment] of [['passion-fruit', undefined], ['passion-fruit', 'unknown'], ['dried-cassava-chips', 'foodservice'], ['bananas', 'retail'], [null, 'retail']]) {
    assert.deepEqual(unitsFor(product, segment), before, `${product} ${segment}`);
  }
  assert.equal(defaultUnit('passion-fruit', 'foodservice'), 'kg');
  assert.equal(defaultUnit('passion-fruit', 'retail'), 'kg');
  assert.equal(defaultUnit('passion-fruit', 'export'), 'containers');
  assert.equal(defaultUnit('passion-fruit'), 'containers');
  assert.equal(defaultUnit('dried-cassava-chips', 'retail'), 'mt_month');
  assert.equal(defaultUnit('bananas'), 'containers');
});

test('the brief starts in the segment\'s unit; a carried unit the product allows is kept, one it does not is replaced', () => {
  assert.equal(emptyBrief({ product: 'passion-fruit', segment: 'retail' }).volume.unit, 'kg');
  assert.equal(emptyBrief({ product: 'passion-fruit' }).volume.unit, 'containers');
  assert.equal(emptyBrief({ product: 'passion-fruit', segment: 'retail', volume: { amount: '2', unit: 'kg_month' } }).volume.unit, 'kg_month');
  // The selector always shows the unit in use: a unit the page does not offer is replaced by the page's own.
  assert.equal(emptyBrief({ product: 'passion-fruit', volume: { amount: '2', unit: 'kg_month' } }).volume.unit, 'containers');
  assert.equal(emptyBrief({ product: 'passion-fruit', segment: 'export', volume: { amount: '2', unit: 'kg_week' } }).volume.unit, 'containers');
  assert.equal(emptyBrief({ product: 'passion-fruit', segment: 'export', volume: { amount: '2', unit: 'kg' } }).volume.unit, 'kg');
  // Kilograms of cassava are not a thing: the product's own default stands.
  assert.equal(emptyBrief({ product: 'dried-cassava-chips', volume: { amount: '2', unit: 'kg' } }).volume.unit, 'mt_month');
  assert.equal(emptyBrief({ product: 'dried-cassava-chips' }).volume.unit, 'mt_month');
});

test('the summary and the unit labels read in each language, the quantity as typed', () => {
  const brief = { ...emptyBrief({ product: 'passion-fruit', segment: 'foodservice' }), destination: 'Hà Nội' };
  assert.equal(summarize({ ...brief, volume: { amount: '50', unit: 'kg_week' } }, 'en').volume, '50 kg / week');
  assert.equal(summarize({ ...brief, volume: { amount: '50', unit: 'kg_week' } }, 'vi').volume, '50 kg / tuần');
  assert.equal(summarize({ ...brief, volume: { amount: '200', unit: 'kg_month' } }, 'vi').volume, '200 kg / tháng');
  assert.equal(summarize({ ...brief, volume: { amount: '0.5', unit: 'kg' } }, 'en').volume, '0.5 kg');
  assert.equal(VOLUME_UNITS.mt_month.en, 'MT / month');
});

test('the illustrative quantities are accepted exactly as the buyer meant them; none is converted', () => {
  for (const [amount, unit] of [['50', 'kg_week'], ['100', 'kg_week'], ['200', 'kg_month'], ['500', 'kg_month'], ['10', 'mt_month'], ['2', 'containers_month'], ['0.5', 'kg'], ['2,5', 'kg']]) {
    const result = validateInquiry(inquiry({ volume: { amount, unit } }));
    assert.equal(result.ok, true, `${amount} ${unit}`);
    assert.deepEqual(result.value.volume, { amount, unit });
  }
});

test('an invalid quantity is refused, whatever the unit', () => {
  for (const amount of ['abc', '-5', '0', '0.0', '.5', '5 kg', '1e3', '1'.repeat(21)]) {
    const result = validateInquiry(inquiry({ volume: { amount, unit: 'kg' } }));
    assert.equal(result.ok, false, amount);
    assert.deepEqual(result.errors, ['volume.amount'], amount);
  }
});

test('kilograms of another product are refused, never read as containers; an unknown unit is as before', () => {
  for (const product of ['dried-cassava-chips', 'bananas']) {
    const result = validateInquiry(inquiry({ product, volume: { amount: '5', unit: 'kg' } }));
    assert.deepEqual([result.ok, result.errors], [false, ['volume.unit']], product);
  }
  // An unknown unit is never read as containers ("5 tons" is not "5 containers"); a missing one is the default.
  for (const unit of ['tons', 'KG', 'kilogram', 7, {}]) {
    const result = validateInquiry(inquiry({ volume: { amount: '5', unit } }));
    assert.deepEqual([result.ok, result.errors], [false, ['volume.unit']], String(unit));
  }
  for (const volume of [{ amount: '5' }, { amount: '5', unit: '' }, { amount: '5', unit: null }]) {
    assert.deepEqual(validateInquiry(inquiry({ volume })).value.volume, { amount: '5', unit: 'containers' }, JSON.stringify(volume));
  }
  // The existing units of every product are unchanged.
  assert.deepEqual(validateInquiry(inquiry({ product: 'dried-cassava-chips', volume: { amount: '5000', unit: 'mt_month' } })).value.volume, { amount: '5000', unit: 'mt_month' });
  assert.equal(unitAllowed('passion-fruit', 'kg'), true);
  assert.equal(unitAllowed('bananas', 'kg_week'), false);
  assert.equal(unitAllowed('bananas', 'mt'), true);
});

test('the record delivered to the webhook (n8n, the sheet) carries the volume as one English text: no new field', async () => {
  const adapter = memoryAdapter();
  const submit = createInquiryService({ adapter });
  assert.equal((await submit(inquiry())).status, 'accepted');
  const [record] = adapter.records;
  assert.equal(record.volume, '50 kg / week');
  assert.deepEqual(Object.keys(record).sort(), ['application', 'consent', 'contact', 'createdAt', 'destination', 'locale', 'notes', 'origin', 'product', 'reference', 'requirements', 'source', 'transport', 'volume']);
  // The segment is the page the inquiry came from.
  assert.equal(record.source.page, '/products/passion-fruit/foodservice');
});

test('the CMS payload would carry the new unit ids, which the CMS refuses until its contract has them (docs/architecture/PASSION_FRUIT.md)', () => {
  const { value } = validateInquiry(inquiry());
  assert.deepEqual(cmsPayload(value, '2026-01-01T00:00:00.000Z').volume, { amount: '50', unit: 'kg_week' });
});

test('each segment has its own volume question, in both languages, and the general one is unchanged', () => {
  for (const lang of ['en', 'vi']) {
    const asked = ['export', 'foodservice', 'retail'].map(segment => deskCopy[lang].askVolumeFor[segment]);
    assert.equal(new Set(asked).size, 3, lang);
  }
  assert.equal(deskCopy.en.askVolumeFor.foodservice, 'What quantity of golden passion fruit does your hospitality or beverage business require?');
  assert.equal(deskCopy.en.askVolume, 'What volume are you planning to purchase?');
});
