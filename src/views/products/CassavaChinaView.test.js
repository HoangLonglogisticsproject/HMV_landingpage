// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { cassavaChina as c } from '../../data/cassavaChina.js';
import { OPEN_TRADE_DESK } from '../../features/trade-desk/open.js';
import { CassavaChinaView } from './CassavaChinaView.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
vi.setConfig({ testTimeout: 20_000 });

let root, container;
beforeEach(async () => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  await act(() => root.render(h(CassavaChinaView)));
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
const texts = selector => [...container.querySelectorAll(selector)].map(e => e.textContent);

test('the Chinese copy: one heading, the hero, the Intertek rows and the RFQ checklist, from data/cassavaChina.js', () => {
  assert.deepEqual(texts('h1'), [c.hero.h1]);
  assert.deepEqual(texts('.money-trust li'), c.hero.trust);
  assert.deepEqual(texts('.landing-table tbody tr').map(String), c.quality.rows.map(([name, value]) => name + value));
  assert.deepEqual(texts('.landing-steps strong'), c.workflow.steps.map(s => s.title));
  assert.deepEqual(texts('.zh-rfq-card li'), c.rfq.items);
  assert.equal(container.querySelector('#zh-rfq-title').textContent, c.rfq.title.join(''));
  assert.ok(container.querySelector('#capability .zh-network').textContent.includes(c.network.text));
});

test('header: section links to sections of this page; this page in English, Vietnamese and Chinese, Chinese current', () => {
  for (const [id, label] of c.nav.items) {
    assert.equal(container.querySelector(`.nav-center a[href="#${id}"]`).textContent, label);
    assert.ok(container.querySelector(`section#${id}`), id);
  }
  const languages = [...container.querySelectorAll('.zh-langs a')].map(a => [a.hreflang, a.getAttribute('href'), a.getAttribute('aria-current')]);
  assert.deepEqual(languages, [
    ['en', '/products/dried-cassava-chips', null],
    ['vi', '/vi/san-pham/san-lat-kho', null],
    ['zh-CN', '/zh-cn/cassava-chips', 'page'],
  ]);
});

test('each call to action opens the HMV Trade Desk with dried cassava chips, and says it is in English', async () => {
  const opened = [];
  const onOpen = e => opened.push(e.detail);
  window.addEventListener(OPEN_TRADE_DESK, onOpen);
  const buttons = [...container.querySelectorAll('button[title]')];
  for (const button of buttons) await act(() => button.click());
  window.removeEventListener(OPEN_TRADE_DESK, onOpen);
  assert.deepEqual(opened, ['zh_nav', 'zh_hero', 'zh_rfq'].map(source => ({ product: 'dried-cassava-chips', source })));
  assert.ok(buttons.every(b => b.title === c.tradeDesk));
});
