// @vitest-environment jsdom
import { afterEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { track } from './analytics.js';

afterEach(() => {
  delete window.dataLayer;
});

test('events reach the dataLayer with their allowed, categorical parameters only', () => {
  track('trade_desk_open', { source: 'product_hero', product: 'passion-fruit', locale: 'vi' });
  track('trade_brief_generated', { goal: 'sourcing', product: 'dried-cassava-chips', missing: 3 });
  assert.deepEqual(window.dataLayer, [
    { event: 'trade_desk_open', source: 'product_hero', product: 'passion-fruit', locale: 'vi' },
    // A goal is not a parameter of any event: it is dropped.
    { event: 'trade_brief_generated', product: 'dried-cassava-chips', missing: 3 },
  ]);
});

test('no personal data can pass: unknown keys, free text and contact details are dropped, unknown events ignored', () => {
  track('generate_lead', { goal: 'sourcing', product: 'Buyer@Example.com', locale: 'en', email: 'buyer@example.com', company: 'Acme', phone: '+84 909', message: 'hi' });
  track('trade_goal_selected', { goal: 'Product sourcing for ACME Ltd' });
  track('form_submit', { email: 'buyer@example.com' });
  // trade_goal_selected is not an event any more: ignored like any unknown one.
  assert.deepEqual(window.dataLayer, [{ event: 'generate_lead', locale: 'en' }]);
});
