import { test } from 'vitest';
import assert from 'node:assert/strict';
import { isSiteIndexable } from './indexability.js';

test('an explicit SITE_INDEXABLE wins, in both directions', () => {
  assert.equal(isSiteIndexable({ SITE_INDEXABLE: 'true' }), true);
  assert.equal(isSiteIndexable({ SITE_INDEXABLE: 'true', VERCEL_ENV: 'preview' }), true);
  assert.equal(isSiteIndexable({ SITE_INDEXABLE: 'false', VERCEL_ENV: 'production' }), false);
  assert.equal(isSiteIndexable({ SITE_INDEXABLE: 'false', VERCEL_TARGET_ENV: 'production' }), false);
});

test('without it, only a Vercel production deployment is indexable', () => {
  assert.equal(isSiteIndexable({ VERCEL_ENV: 'production' }), true);
  assert.equal(isSiteIndexable({ VERCEL_TARGET_ENV: 'production' }), true);
  assert.equal(isSiteIndexable({ VERCEL_ENV: 'preview' }), false);
  assert.equal(isSiteIndexable({ VERCEL_ENV: 'development' }), false);
  // VERCEL_TARGET_ENV is the more precise target (custom environments) and takes precedence.
  assert.equal(isSiteIndexable({ VERCEL_TARGET_ENV: 'staging', VERCEL_ENV: 'production' }), false);
});

test('fail-safe: no relevant variable, or any other SITE_INDEXABLE value, is noindex', () => {
  assert.equal(isSiteIndexable({}), false);
  assert.equal(isSiteIndexable({ SITE_INDEXABLE: '1' }), false);
  assert.equal(isSiteIndexable({ SITE_INDEXABLE: '' }), false);
});
