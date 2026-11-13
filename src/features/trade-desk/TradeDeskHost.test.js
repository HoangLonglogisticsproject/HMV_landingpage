// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { TradeDeskHost } from './TradeDeskHost.jsx';
import { openTradeDesk } from './open.js';

vi.mock('@/lib/inquiry', () => ({ sendInquiry: vi.fn(), contactChannels: {} }));
// The desk's module loads only when the test releases it: a slow connection, deterministically.
const load = vi.hoisted(() => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  return { gate, release: () => release() };
});
vi.mock('./TradeDesk.jsx', async importOriginal => {
  await load.gate;
  return importOriginal();
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root, container;
beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  delete window.dataLayer;
  sessionStorage.clear();
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

test('the desk loads on the first open, which is kept (product preselected) while its code loads', async () => {
  history.replaceState(null, '', '/products/dried-cassava-chips?utm_source=linkedin');
  await act(async () => root.render(h(TradeDeskHost, { lang: 'vi' })));
  assert.equal(document.querySelector('[role="dialog"]'), null);
  // The visit context is recorded on page load, before any open.
  assert.equal(sessionStorage.getItem('hmv_landing'), '/products/dried-cassava-chips');
  assert.equal(sessionStorage.getItem('hmv_utm'), JSON.stringify({ source: 'linkedin', medium: null, campaign: null }));

  await act(async () => openTradeDesk({ product: 'dried-cassava-chips', source: 'product_hero' }));
  // The loading state is an <output> (implicit role "status").
  assert.equal(document.querySelector('output.desk-loading').textContent, 'Đang mở HMV Trade Desk…');

  // Still loading a while later: no desk yet, the open request is kept.
  await act(async () => new Promise(resolve => setTimeout(resolve, 20)));
  assert.equal(document.querySelector('[role="dialog"]'), null);

  await act(async () => {
    load.release();
    await import('./TradeDesk.jsx');
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  const dialog = document.querySelector('[role="dialog"]');
  assert.ok(dialog);
  assert.equal(dialog.querySelector('input[type="radio"][value="dried-cassava-chips"]').checked, true);
  assert.equal(document.querySelector('output.desk-loading'), null);
  assert.deepEqual(window.dataLayer.map(e => e.event), ['trade_desk_open', 'trade_product_selected']);
});

test('first-touch attribution: the landing page, referrer and campaign of the first page load stay together', async () => {
  history.replaceState(null, '', '/?utm_source=newsletter&utm_campaign=a');
  await act(async () => root.render(h(TradeDeskHost, { lang: 'en' })));
  await act(async () => root.unmount());
  // A later page of the same visit, from campaign B: the stored first touch is unchanged.
  history.replaceState(null, '', '/products/bananas?utm_source=linkedin&utm_campaign=b');
  root = createRoot(container);
  await act(async () => root.render(h(TradeDeskHost, { lang: 'en' })));
  const { visitContext } = await import('./visit.js');
  const context = visitContext();
  assert.equal(context.landingPage, '/');
  assert.deepEqual(context.utm, { source: 'newsletter', medium: null, campaign: 'a' });
  assert.equal(context.page, '/products/bananas');
});

test('trade_desk_open carries a product only when it is a real product id', async () => {
  await act(async () => root.render(h(TradeDeskHost, { lang: 'en' })));
  await act(async () => openTradeDesk({ product: 'alice-smith', source: 'home_hero' }));
  await act(async () => openTradeDesk({ product: 'bananas', source: 'product_hero' }));
  assert.deepEqual(window.dataLayer, [
    { event: 'trade_desk_open', source: 'home_hero', locale: 'en' },
    { event: 'trade_desk_open', source: 'product_hero', product: 'bananas', locale: 'en' },
    { event: 'trade_product_selected', product: 'bananas', source: 'preselected' },
  ]);
});
