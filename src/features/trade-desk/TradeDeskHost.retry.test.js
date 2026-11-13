// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { TradeDeskHost } from './TradeDeskHost.jsx';
import { openTradeDesk } from './open.js';

vi.mock('@/lib/inquiry', () => ({ sendInquiry: vi.fn(), contactChannels: {} }));
// The desk's code fails to load until the test lets it (a new deployment, a dropped connection). Each import() of it
// is counted: a retry must be a new import, not React.lazy's cached rejection.
const load = vi.hoisted(() => ({ fail: true, imports: 0 }));
vi.mock('./TradeDesk.jsx', async importOriginal => {
  load.imports++;
  if (load.fail) throw new TypeError('Failed to fetch dynamically imported module');
  return importOriginal();
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root, container;
const tick = () => act(async () => new Promise(resolve => setTimeout(resolve, 10)));
const until = async check => {
  for (let i = 0; i < 300 && !check(); i++) await tick();
  assert.ok(check());
};
beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  vi.spyOn(console, 'error').mockImplementation(() => {}); // React reports the caught load error
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

test('a failed load keeps the page, shows a retry, and the retry loads the desk with a new import', async () => {
  const page = document.body.appendChild(document.createElement('main'));
  page.textContent = 'Product page';
  await act(async () => root.render(h(TradeDeskHost, { lang: 'en' })));
  await act(async () => openTradeDesk({ product: 'dried-cassava-chips', source: 'product_hero' }));
  const alert = () => document.querySelector('[role="alert"]');
  await until(() => alert());
  assert.equal(alert().querySelector('p').textContent, 'HMV Trade Desk could not be opened.');
  assert.equal(page.textContent, 'Product page');
  assert.equal(load.imports, 1);

  load.fail = false;
  await act(async () => [...alert().querySelectorAll('button')].find(b => b.textContent === 'Try again').click());
  const dialog = () => document.querySelector('[role="dialog"]');
  await until(() => dialog());
  assert.equal(load.imports, 2);
  assert.equal(alert(), null);
  // The request that failed is the one that opens: product preselected, the conversation at the destination.
  assert.ok(dialog().querySelector('.desk-summary').textContent.includes('Dried cassava chips'));
  assert.ok(dialog().textContent.includes('Where would you like the goods delivered?'));
  page.remove();
});
