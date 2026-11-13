import { test } from 'vitest';
import assert from 'node:assert/strict';
import { emptyBrief, isRfqReady, routeOf, stageOf, summarize, toInquiry } from './brief.js';
import { detectLanguage } from './language.js';
import { recognizeProduct } from './rules.js';
import { validateInquiry } from './validation.js';

const cassava = (over = {}) => ({ ...emptyBrief({ product: 'dried-cassava-chips' }), ...over });
const volume = { amount: '2,000', unit: 'mt_month' };

test('readiness: product, destination and volume make a requirement ready for quotation; nothing else is needed', () => {
  assert.equal(isRfqReady(emptyBrief()), false);
  assert.equal(isRfqReady(cassava()), false);
  assert.equal(isRfqReady(cassava({ destination: 'Chennai, India' })), false);
  assert.equal(isRfqReady(cassava({ volume })), false);
  assert.equal(isRfqReady(cassava({ destination: '   ', volume })), false);
  assert.equal(isRfqReady(cassava({ destination: 'Chennai, India', volume })), true);
  assert.equal(isRfqReady({ ...emptyBrief(), destination: 'Chennai', volume }), false);
});

test('routing: a ready requirement goes to HMV Sales (rfq), anything else to Customer Service (discovery)', () => {
  assert.equal(routeOf(cassava({ destination: 'Chennai, India', volume })), 'rfq');
  assert.equal(routeOf(cassava({ destination: 'Chennai, India' })), 'discovery');
  assert.equal(routeOf(cassava()), 'discovery');
});

test('the conversation asks product, then destination, then volume, then decides', () => {
  const exploring = false;
  assert.equal(stageOf(emptyBrief(), { exploring }), 'product');
  assert.equal(stageOf(cassava(), { exploring }), 'destination');
  assert.equal(stageOf(cassava({ destination: 'Chennai' }), { exploring }), 'volume');
  assert.equal(stageOf(cassava({ destination: 'Chennai', volume }), { exploring }), 'decision');
  // Still exploring: the decision comes without the missing destination or volume.
  assert.equal(stageOf(cassava(), { exploring: true }), 'decision');
  assert.equal(stageOf(cassava({ destination: 'Chennai' }), { exploring: true }), 'decision');
  // There is no decision without a product.
  assert.equal(stageOf(emptyBrief(), { exploring: true }), 'product');
});

test('the summary has product, destination and volume only, in the buyer language', () => {
  const brief = cassava({ destination: ' Chennai, India ', volume });
  assert.deepEqual(summarize(brief, 'en'), { product: 'Dried cassava chips', destination: 'Chennai, India', volume: '2,000 MT / month' });
  assert.deepEqual(summarize(brief, 'vi'), { product: 'Sắn lát khô', destination: 'Chennai, India', volume: '2,000 tấn / tháng' });
  assert.deepEqual(summarize(emptyBrief(), 'en'), { product: '', destination: '', volume: '' });
  // A product's usual unit comes first: MT / month for cassava chips, containers otherwise.
  assert.equal(emptyBrief({ product: 'passion-fruit' }).volume.unit, 'containers');
  assert.equal(emptyBrief({ product: 'not-a-product' }).product, null);
});

test('the inquiry leaves application, transport and requirements empty: nothing is filled in for them', () => {
  const inquiry = toInquiry(cassava({ destination: 'Chennai, India', volume }), {
    contact: { company: 'Acme', email: 'a@acme.com', name: '', phone: '' },
    consent: true,
    locale: 'en',
    context: { page: '/products/dried-cassava-chips', landingPage: '/', referrer: '', utm: {} },
    idempotencyKey: 'abcdef12-3456',
  });
  assert.equal(inquiry.application, '');
  assert.equal(inquiry.transport, '');
  assert.deepEqual(inquiry.requirements, {});
  assert.equal(inquiry.notes, '');
  assert.equal(inquiry.website, '');
  const { ok, value } = validateInquiry(inquiry);
  assert.equal(ok, true);
  assert.deepEqual([value.application, value.transport, value.requirements], ['', '', {}]);
  // The origin is not asked, so none is sent or assumed.
  assert.equal('origin' in inquiry, false);
  assert.equal(value.origin, '');
  // A discovery inquiry, without destination and volume, is accepted too.
  assert.equal(validateInquiry({ ...inquiry, destination: '', volume: { amount: '', unit: 'mt_month' } }).ok, true);
});

test('product recognition: the catalogue names in English and Vietnamese, with or without accents', () => {
  const cases = [
    ['We need dried cassava chips for our plant in India.', 'dried-cassava-chips'],
    ['Bên tôi đang tìm sắn lát giao về Đồng Nai.', 'dried-cassava-chips'],
    ['san lat kho', 'dried-cassava-chips'],
    ['cassava starch for paper mills', 'tapioca-starch'],
    ['Tinh bột sắn', 'tapioca-starch'],
    ['Fresh bananas', 'bananas'],
    ['chuối Cavendish', 'bananas'],
    ['Passion fruit', 'passion-fruit'],
    ['chanh leo', 'passion-fruit'],
    ['dragonfruit', 'dragon-fruit'],
    ['black pepper', 'spices'],
    ['hạt điều', 'nuts'],
  ];
  for (const [text, product] of cases) assert.equal(recognizeProduct(text), product, text);
  // Any run of whitespace is one space: still tapioca starch, never cassava chips.
  for (const text of ['cassava starch', 'cassava  starch', 'cassava\nstarch', 'Cassava \t Starch']) {
    assert.equal(recognizeProduct(text), 'tapioca-starch', JSON.stringify(text));
  }
  // Whole words only, plurals where buyers use them; Vietnamese names keep working.
  const words = [
    ['passion', 'passion-fruit'], ['passion fruit', 'passion-fruit'], ['passion fruits', 'passion-fruit'],
    ['banana', 'bananas'], ['bananas', 'bananas'], ['spice', 'spices'], ['spices', 'spices'], ['peppercorns', 'spices'],
    ['cashew', 'nuts'], ['cashews', 'nuts'], ['dragon fruits', 'dragon-fruit'],
    ['chuối', 'bananas'], ['thanh long', 'dragon-fruit'], ['sắn', 'dried-cassava-chips'], ['hạt điều', 'nuts'], ['gia vị', 'spices'],
  ];
  for (const [text, product] of words) assert.equal(recognizeProduct(text), product, text);
  for (const text of ['I am passionate about sourcing rice', 'passionate', 'spicy', 'cashewnut butter', 'bananarama']) {
    assert.equal(recognizeProduct(text), null, text);
  }
  // None, or more than one: the buyer chooses.
  for (const text of ['rice', 'chuỗi cung ứng nông sản', 'bananas and dragon fruit', 'compassion', '', null]) {
    assert.equal(recognizeProduct(text), null, String(text));
  }
});

test('language: decided by the words of a message, never by a place, a number or a product name', () => {
  assert.equal(detectLanguage('We need dried cassava chips for our plant in India.'), 'en');
  assert.equal(detectLanguage('Bên tôi đang tìm sắn lát giao về Đồng Nai'), 'vi');
  assert.equal(detectLanguage('Giao về Chennai'), 'vi');
  assert.equal(detectLanguage('Delivery to Đà Nẵng'), 'en');
  for (const text of ['India', 'Chennai, India', 'Hanoi', 'Đồng Nai', '500 MT', '2,000', 'Dried cassava chips', '', undefined]) {
    assert.equal(detectLanguage(text), null, String(text));
  }
});
