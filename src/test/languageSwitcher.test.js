import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalizedPathname,
  isSamePageAcrossLocales,
  SUPPORTED_LANGS,
} from '../lib/localeRouting.js';

test('Supported languages includes English and Vietnamese', () => {
  assert.deepEqual(SUPPORTED_LANGS, ['en', 'vi']);
});

test('getLocalizedPathname correctly maps homepage routes', () => {
  assert.equal(getLocalizedPathname('vi', '/en'), '/vi');
  assert.equal(getLocalizedPathname('en', '/vi'), '/en');
  assert.equal(getLocalizedPathname('vi', '/en/'), '/vi/');
});

test('getLocalizedPathname maps standard and nested subpages', () => {
  assert.equal(getLocalizedPathname('vi', '/en/about'), '/vi/about');
  assert.equal(getLocalizedPathname('vi', '/en/supply-chain'), '/vi/supply-chain');
  assert.equal(getLocalizedPathname('en', '/vi/supply-chain'), '/en/supply-chain');
  assert.equal(getLocalizedPathname('vi', '/en/supply-chain/compliance'), '/vi/supply-chain/compliance');
  assert.equal(getLocalizedPathname('vi', '/en/logistics'), '/vi/logistics');
  assert.equal(getLocalizedPathname('vi', '/en/packaging-logistics'), '/vi/packaging-logistics');
});

test('getLocalizedPathname preserves product ID routes', () => {
  assert.equal(getLocalizedPathname('vi', '/en/products/passion-fruit'), '/vi/products/passion-fruit');
  assert.equal(getLocalizedPathname('en', '/vi/products/passion-fruit'), '/en/products/passion-fruit');
  assert.equal(getLocalizedPathname('vi', '/en/products/banana'), '/vi/products/banana');
});

test('getLocalizedPathname maps EcoNews localized slugs accurately', () => {
  // 1. Passion fruit article
  assert.equal(
    getLocalizedPathname('vi', '/en/blog/exporting-passion-fruit-eu'),
    '/vi/blog/xuat-khau-chanh-day-eu'
  );
  assert.equal(
    getLocalizedPathname('en', '/vi/blog/xuat-khau-chanh-day-eu'),
    '/en/blog/exporting-passion-fruit-eu'
  );

  // 2. Logistics article
  assert.equal(
    getLocalizedPathname('vi', '/en/blog/optimizing-tropical-logistics'),
    '/vi/blog/toi-uu-hoa-logistics'
  );

  // 3. Circular agriculture article
  assert.equal(
    getLocalizedPathname('vi', '/en/blog/circular-agriculture'),
    '/vi/blog/nong-nghiep-khep-kin'
  );
});

test('getLocalizedPathname falls back safely to insights when article is missing', () => {
  assert.equal(
    getLocalizedPathname('vi', '/en/blog/non-existent-article-slug'),
    '/vi/insights'
  );
});

test('isSamePageAcrossLocales accurately distinguishes locale switches from fresh page transitions', () => {
  // Same pages across locales -> should preserve scroll
  assert.equal(isSamePageAcrossLocales('/en', '/vi'), true);
  assert.equal(isSamePageAcrossLocales('/en/supply-chain', '/vi/supply-chain'), true);
  assert.equal(isSamePageAcrossLocales('/en/products/passion-fruit', '/vi/products/passion-fruit'), true);
  assert.equal(
    isSamePageAcrossLocales('/en/blog/exporting-passion-fruit-eu', '/vi/blog/xuat-khau-chanh-day-eu'),
    true
  );

  // Fallback to insights when article missing -> should NOT preserve scroll (different page)
  assert.equal(
    isSamePageAcrossLocales('/en/blog/unknown-article', '/vi/insights'),
    false
  );

  // Different pages -> should NOT preserve scroll
  assert.equal(isSamePageAcrossLocales('/en/about', '/vi/supply-chain'), false);
  assert.equal(isSamePageAcrossLocales('/en/products/passion-fruit', '/vi/products/banana'), false);
});
