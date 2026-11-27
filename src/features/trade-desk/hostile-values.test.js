import { test } from 'vitest';
import assert from 'node:assert/strict';
import { validateInquiry } from './validation.js';
import { segmentOf, unitAllowed, unitsFor, defaultUnit } from './rules.js';
import { validateRouteAssessment } from '../route-assessment/validation.js';
import { hasOwn, own } from '../../lib/own.js';

// Values an API client or another script can send that a browser form never does: the contract's types are enforced
// (never coerced into a name), an unsupported value is a controlled error (never an exception), and a name that every
// object inherits (constructor, toString, __proto__) is not a name in any table.

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
const volume = (unit, amount = '50') => inquiry({ volume: { amount, unit } });
const INHERITED = ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__', 'prototype', 'isPrototypeOf', '__defineGetter__'];
/** Never throws: a controlled result for every value. */
const run = body => assert.doesNotThrow(() => validateInquiry(body)) ?? validateInquiry(body);

test('the units a client may send: strings that are ids of the contract and of the product, nothing else', () => {
  for (const unit of ['containers', 'containers_month', 'mt', 'mt_month', 'kg', 'kg_week', 'kg_month']) {
    assert.equal(run(volume(unit)).ok, true, unit);
  }
  assert.equal(run(inquiry({ volume: { amount: '50' } })).value.volume.unit, 'containers');
  for (const unit of [undefined, null, '']) assert.equal(run(volume(unit)).value.volume.unit, 'containers', String(unit));
});

test('a unit that is not a string, or not a unit, is a volume.unit error and never becomes containers', () => {
  const hostile = [
    ['kg'], [], ['kg', 'mt'], {}, { toString: 1 }, { toString: () => 'kg' }, { unit: 'kg' }, 5, 0, NaN, true, false, ' kg', 'KG', 'kg ', 'kgs', 'lb', 'tons',
    'containers_week', 'mt_week', 'tonnes', '__proto__', ...INHERITED,
  ];
  for (const unit of hostile) {
    const result = run(volume(unit));
    assert.deepEqual([result.ok, result.errors], [false, ['volume.unit']], JSON.stringify(unit) ?? String(unit));
  }
});

test('a request whose own toString is not callable is refused, not an exception', () => {
  const body = JSON.parse('{"product":"passion-fruit","volume":{"amount":"5","unit":{"toString":1}},"application":{"toString":1},"transport":{"toString":1},"origin":{"toString":1},"requirements":{"toString":1},"contact":{"company":{"toString":1}},"consent":{"contact":true},"idempotencyKey":{"toString":1}}');
  const result = run(body);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('volume.unit'));
});

test('a kilogram unit for another product is refused, and the existing units and containers still work', () => {
  for (const product of ['dried-cassava-chips', 'bananas', 'dragon-fruit', 'spices', 'nuts', 'tapioca-starch']) {
    for (const unit of ['kg', 'kg_week', 'kg_month']) assert.deepEqual(run(inquiry({ product, volume: { amount: '5', unit } })).errors, ['volume.unit'], `${product} ${unit}`);
    for (const unit of ['containers', 'containers_month', 'mt', 'mt_month']) assert.equal(run(inquiry({ product, volume: { amount: '5', unit } })).ok, true, `${product} ${unit}`);
  }
  assert.equal(run(inquiry({ product: 'dried-cassava-chips', volume: { amount: '5000', unit: 'mt_month' }, origin: 'cambodia' })).value.volume.unit, 'mt_month');
});

test('an amount that is not text is an error (a number is not read, a list is not coerced), and the grammar is unchanged', () => {
  for (const amount of [50, 0, NaN, true, false, ['50'], [], {}, { toString: 1 }]) {
    assert.deepEqual(run(volume('kg', amount)).errors, ['volume.amount'], JSON.stringify(amount) ?? String(amount));
  }
  for (const amount of ['2', '0,5', '2,000', '1 234', '1,234.5']) assert.equal(run(volume('kg', amount)).ok, true, amount);
  for (const amount of ['1..5', '2,,5', '50.', '50,', '1 2', '0', 'abc']) assert.deepEqual(run(volume('kg', amount)).errors, ['volume.amount'], amount);
  for (const given of [undefined, null, '']) assert.equal(run(volume('kg', given)).ok, true, String(given));
});

test('application, transport and origin: only the contract’s own ids survive, whatever is sent', () => {
  const cassava = overrides => inquiry({ product: 'dried-cassava-chips', volume: { amount: '5', unit: 'mt' }, ...overrides });
  assert.equal(run(cassava({ application: 'feed', transport: 'sea_fcl', origin: 'vietnam' })).value.application, 'feed');
  assert.equal(run(cassava({ application: 'feed', transport: 'sea_fcl', origin: 'vietnam' })).value.transport, 'sea_fcl');
  for (const hostile of [...INHERITED, ['feed'], ['sea_fcl'], {}, { toString: 1 }, 5, true, null]) {
    const result = run(cassava({ application: hostile, transport: hostile }));
    assert.equal(result.ok, true, JSON.stringify(hostile) ?? String(hostile));
    assert.deepEqual([result.value.application, result.value.transport], ['', ''], JSON.stringify(hostile) ?? String(hostile));
  }
  for (const hostile of [...INHERITED, ['vietnam'], {}, 5, true]) assert.deepEqual(run(cassava({ origin: hostile })).errors, ['origin'], JSON.stringify(hostile) ?? String(hostile));
  assert.ok(run(inquiry({ product: 'constructor', volume: { amount: '5', unit: 'mt' } })).errors.includes('product'));
  assert.ok(run(inquiry({ product: ['passion-fruit'], volume: { amount: '5', unit: 'mt' } })).errors.includes('product'));
});

test('a body that is not an object, and inherited names as keys of the body, are controlled errors', () => {
  for (const body of [null, undefined, [], 'text', 5, true, JSON.parse('{"__proto__":{"product":"passion-fruit"}}'), JSON.parse('{"constructor":{"prototype":{}}}')]) {
    const result = run(body);
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes('product'));
  }
  assert.equal(run(JSON.parse('{"__proto__":{"polluted":true},"product":"passion-fruit","volume":{"amount":"5","unit":"kg"},"destination":"x","contact":{"company":"Co","email":"a@b.co"},"consent":{"contact":true},"idempotencyKey":"0f3b6d2e-1c4a-4e8b-9a77"}')).ok, true);
  assert.equal({}.polluted, undefined);
});

test('requirements: inherited names and non-text answers are not answers', () => {
  const body = inquiry({ product: 'dried-cassava-chips', volume: { amount: '5', unit: 'mt' }, requirements: JSON.parse('{"__proto__":{"starch":"70"},"constructor":"x","starch":{"toString":1},"incoterm":["CIF"]}') });
  const result = run(body);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.requirements, {});
});

test('units for a segment: only the declared segments choose units, and anything else is the usual four', () => {
  const usual = ['containers', 'containers_month', 'mt', 'mt_month'];
  for (const segment of [...INHERITED, 'Export', 'FOODSERVICE', ' retail', 'wholesale', '', 5, null, undefined, ['retail'], {}, { toString: 1 }]) {
    assert.deepEqual(unitsFor('passion-fruit', segment), usual, JSON.stringify(segment) ?? String(segment));
    assert.equal(segmentOf(segment), undefined, JSON.stringify(segment) ?? String(segment));
    assert.equal(defaultUnit('passion-fruit', segment), 'containers');
  }
  for (const segment of ['export', 'foodservice', 'retail']) assert.equal(segmentOf(segment), segment);
  assert.deepEqual(unitsFor('bananas', 'foodservice'), usual);
  assert.equal(unitAllowed('bananas', 'kg'), false);
  assert.equal(unitAllowed('passion-fruit', 'kg'), true);
  for (const unit of [...INHERITED, ['kg'], { toString: 1 }]) assert.equal(unitAllowed('passion-fruit', unit), false);
});

test('route assessment: its enum, text and key fields take the same hostile values without an exception', () => {
  const assessment = overrides => ({
    idempotencyKey: '0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69', service: 'vietnam-cambodia-consolidation', origin: 'Hanoi', destination: 'Phnom Penh', cargo: 'Cassava',
    volume: '1 container', contact: { company: 'Co', email: 'a@b.co' }, consent: { contact: true }, ...overrides,
  });
  assert.equal(validateRouteAssessment(assessment()).ok, true);
  for (const hostile of [...INHERITED, ['x'], {}, { toString: 1 }, 5, true]) {
    for (const field of ['service', 'origin', 'destination', 'cargo', 'volume', 'frequency', 'notes', 'source', 'locale', 'website', 'idempotencyKey']) {
      assert.doesNotThrow(() => validateRouteAssessment(assessment({ [field]: hostile })), `${field} ${JSON.stringify(hostile)}`);
    }
    assert.equal(validateRouteAssessment(assessment({ service: hostile })).ok, false);
  }
});

test('own lookups: strings the table itself holds, nothing inherited, nothing coerced', () => {
  const table = { a: 1, b: undefined };
  assert.deepEqual([own(table, 'a'), own(table, 'b'), own(table, 'c')], [1, undefined, undefined]);
  assert.equal(hasOwn(table, 'b'), true);
  for (const name of [...INHERITED, ['a'], { toString: () => 'a' }, 5, null, undefined]) assert.equal(hasOwn(table, name), false, String(name?.constructor?.name ?? name));
  assert.equal(hasOwn(undefined, 'a'), false);
  assert.equal(hasOwn(null, 'a'), false);
});
