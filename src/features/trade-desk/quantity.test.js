import { test } from 'vitest';
import assert from 'node:assert/strict';
import { isQuantityText } from './quantity.js';
import { emptyBrief } from './brief.js';
import { isAmount, validateInquiry } from './validation.js';

// A quantity is text the buyer writes and HMV keeps as written: only what is no number is refused. An amount and its unit
// are one answer: a unit that is not offered never carries an amount into another context.

test('a quantity is accepted in the forms buyers write it, English and Vietnamese', () => {
  for (const q of ['2', '50', '5000', '0.5', '0,5', '2,5', '2,000', '2.000', '1 234', '2 000', '1,234.5', '1.234,5', '1,234,567', '1.234.567', '12 345,6', '007', ' 50 ', '1 000 000']) {
    assert.equal(isQuantityText(q), true, q);
    assert.equal(isAmount(q), true, q);
  }
});

test('a malformed quantity is refused', () => {
  for (const q of ['1..5', '2,,5', '1 2', '50.', '50,', '.5', ',5', '1 2 3', '1,5,5', '1.5.5', '1,23,456', '1 000,5,5', '0', '0.0', '00,00', '-5', '5 kg', '1e3', 'abc', '', ' ', '1,', '1 ,5', '١٢']) {
    assert.equal(isQuantityText(q), false, JSON.stringify(q));
  }
  assert.equal(isQuantityText(undefined), false);
  assert.equal(isQuantityText(50), false);
  // The same rule on the server, whatever the unit.
  const inquiry = volume => ({
    idempotencyKey: '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69', locale: 'en', product: 'passion-fruit', destination: 'Da Nang',
    volume, contact: { company: 'Resort Co', email: 'buyer@example.com' }, consent: { contact: true },
  });
  for (const amount of ['1..5', '2,,5', '1 2', '50.', '50,']) {
    const result = validateInquiry(inquiry({ amount, unit: 'kg' }));
    assert.deepEqual([result.ok, result.errors], [false, ['volume.amount']], amount);
  }
  for (const amount of ['50', '0,5', '2.000', '1,234.5']) assert.equal(validateInquiry(inquiry({ amount, unit: 'kg' })).ok, true, amount);
  // A valid, historic cassava inquiry is unchanged.
  const cassava = validateInquiry({ ...inquiry({ amount: '5,000', unit: 'mt_month' }), product: 'dried-cassava-chips' });
  assert.deepEqual(cassava.value.volume, { amount: '5,000', unit: 'mt_month' });
});

test('a carried quantity keeps its amount with its unit, or is asked again: never "50 kg / week" as 50 containers', () => {
  const carried = (product, segment, volume) => emptyBrief({ product, segment, volume }).volume;
  // The unit is offered here: the amount and the unit stay together.
  assert.deepEqual(carried('passion-fruit', 'foodservice', { amount: '50', unit: 'kg_week' }), { amount: '50', unit: 'kg_week' });
  assert.deepEqual(carried('passion-fruit', 'retail', { amount: '200', unit: 'kg_month' }), { amount: '200', unit: 'kg_month' });
  assert.deepEqual(carried('passion-fruit', 'export', { amount: '500', unit: 'kg' }), { amount: '500', unit: 'kg' });
  assert.deepEqual(carried('passion-fruit', 'export', { amount: '2', unit: 'containers_month' }), { amount: '2', unit: 'containers_month' });
  assert.deepEqual(carried('dried-cassava-chips', undefined, { amount: '5,000', unit: 'mt_month' }), { amount: '5,000', unit: 'mt_month' });
  assert.deepEqual(carried('bananas', undefined, { amount: '4', unit: 'containers' }), { amount: '4', unit: 'containers' });
  assert.deepEqual(carried('passion-fruit', 'foodservice', { amount: '20', unit: 'mt' }), { amount: '20', unit: 'mt' });
  // The unit is not offered here: the amount is dropped (never kept with another unit) and the page's own unit is selected.
  assert.deepEqual(carried('passion-fruit', undefined, { amount: '50', unit: 'kg_week' }), { amount: '', unit: 'containers' });
  assert.deepEqual(carried('passion-fruit', 'export', { amount: '50', unit: 'kg_week' }), { amount: '', unit: 'containers' });
  assert.deepEqual(carried('passion-fruit', 'export', { amount: '200', unit: 'kg_month' }), { amount: '', unit: 'containers' });
  assert.deepEqual(carried('dried-cassava-chips', 'retail', { amount: '50', unit: 'kg' }), { amount: '', unit: 'mt_month' });
  assert.deepEqual(carried('bananas', 'foodservice', { amount: '50', unit: 'kg' }), { amount: '', unit: 'containers' });
  assert.deepEqual(carried('passion-fruit', 'foodservice', { amount: '2', unit: 'containers' }), { amount: '', unit: 'kg' });
  assert.deepEqual(carried('passion-fruit', 'retail', { amount: '2', unit: 'containers_month' }), { amount: '', unit: 'kg' });
  // No unit at all, an unknown one, or an amount that is no quantity: nothing is carried.
  assert.deepEqual(carried('passion-fruit', 'foodservice', { amount: '50' }), { amount: '', unit: 'kg' });
  assert.deepEqual(carried('passion-fruit', 'foodservice', { amount: '50', unit: 'litres' }), { amount: '', unit: 'kg' });
  assert.deepEqual(carried('passion-fruit', 'foodservice', { amount: '1..5', unit: 'kg' }), { amount: '', unit: 'kg' });
  assert.deepEqual(carried('passion-fruit', 'foodservice', undefined), { amount: '', unit: 'kg' });
});
