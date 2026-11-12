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
  assert.equal(document.querySelector('[role="status"]').textContent, 'Đang mở HMV Trade Desk…');

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
  assert.equal(document.querySelector('[role="status"]'), null);
  assert.deepEqual(window.dataLayer.map(e => e.event), ['trade_desk_open', 'trade_product_selected']);
});
