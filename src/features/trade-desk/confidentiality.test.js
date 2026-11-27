import { test } from 'vitest';
import assert from 'node:assert/strict';
import { asksForSupplier, asksForTraceability, recognizeProduct } from './rules.js';
import { deskCopy } from './copy.js';

// HMV Global is the one commercial point of contact: the desk never names or locates a supplier, and answers a request for
// one as HMV's representative. A buyer who needs traceability or compliance documents is told how HMV provides them.

test('a request for a supplier\'s identity, contact or location is recognized, in English and Vietnamese', () => {
  for (const words of [
    'Please send me the phone number of your farm owner',
    'who grows your passion fruit?',
    'Who supplies the golden passion fruit',
    'Give me the contact of the grower',
    'What is the factory address and exact location',
    'Can I get the email of your supplier',
    'Cho tôi số điện thoại của chủ vườn chanh dây',
    'Địa chỉ nhà cung cấp ở đâu',
    'Ai trồng chanh dây này',
    'Tên và liên hệ của nông dân',
  ]) assert.equal(asksForSupplier(words), true, words);
});

test('ordinary words about suppliers, farms or products are not read as such a request', () => {
  for (const words of [
    'passion fruit supplier for hotels',
    'We are a distributor and a supplier of beverages',
    'golden passion fruit',
    'I need dried cassava chips from an orchard region',
    'chanh dây cho khách sạn',
    'nhà cung ứng chanh dây vàng',
    '',
    undefined,
  ]) assert.equal(asksForSupplier(words), false, String(words));
});

test('a request for traceability or compliance documents is recognized, and a supplier request is answered first', () => {
  for (const words of ['I need traceability documents for customs', 'Do you provide certificates and an audit?', 'tài liệu truy xuất nguồn gốc và chứng nhận', 'chứng từ hải quan']) {
    assert.equal(asksForTraceability(words), true, words);
    assert.equal(asksForSupplier(words), false, words);
  }
  assert.equal(asksForTraceability('the supplier contact and the traceability documents'), false);
  assert.equal(asksForTraceability('passion fruit'), false);
});

test('the answers speak for HMV, in both languages, and name, locate and promise nothing', () => {
  const NAMES = /\b(farm|grower|supplier)s? (is|are|located|in)\b|\d{6,}|@|https?:/i;
  assert.equal(deskCopy.en.supplierContact, 'HMV Global coordinates sourcing and commercial communication through our supply network. Please share your requirements, and our team will assist with the relevant product information and supply arrangements.');
  for (const lang of ['en', 'vi']) {
    for (const key of ['supplierContact', 'traceability']) {
      assert.doesNotMatch(deskCopy[lang][key], NAMES, `${lang} ${key}`);
      assert.ok(deskCopy[lang][key].includes('HMV'), `${lang} ${key}`);
    }
    assert.notEqual(deskCopy[lang].supplierContact, deskCopy[lang].traceability);
  }
  // A request that names a supplier does not name a product: the desk goes on asking which one.
  assert.equal(recognizeProduct('give me the phone number of your farm owner'), null);
});
