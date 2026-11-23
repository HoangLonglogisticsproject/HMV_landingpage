import { test } from 'vitest';
import assert from 'node:assert/strict';
import { isAccepted, newKey, withKey } from './submission.js';
import { KEY } from './validation.js';

const draft = { locale: 'en', product: 'bananas', contact: { company: 'Example', email: 'a@example.com' }, website: '' };

test('only a 201 with a reference is an accepted inquiry', () => {
  assert.equal(isAccepted({ status: 201, body: { reference: 'HMV-2026-ABC123' } }), true);
  assert.equal(isAccepted({ status: 201, body: {} }), false);
  assert.equal(isAccepted({ status: 200, body: { reference: 'HMV-2026-ABC123' } }), false);
  assert.equal(isAccepted({ status: 503, body: { reference: 'HMV-2026-ABC123' } }), false);
});

test('keys are valid for the server and never repeat', () => {
  assert.match(newKey(), KEY);
  assert.notEqual(newKey(), newKey());
});

test('an exact retry keeps the key; a changed content, the honeypot aside, takes a new one', () => {
  const first = withKey(draft, null);
  assert.match(first.inquiry.idempotencyKey, KEY);
  const last = { fingerprint: first.fingerprint, key: first.inquiry.idempotencyKey };
  assert.equal(withKey({ ...draft }, last).inquiry.idempotencyKey, last.key);
  // Key order and the honeypot do not make a different inquiry; any value does.
  assert.equal(withKey({ website: 'spam', contact: draft.contact, product: 'bananas', locale: 'en' }, last).inquiry.idempotencyKey, last.key);
  assert.notEqual(withKey({ ...draft, product: 'spices' }, last).inquiry.idempotencyKey, last.key);
  assert.notEqual(withKey({ ...draft, contact: { ...draft.contact, company: 'Example 2' } }, last).inquiry.idempotencyKey, last.key);
});
