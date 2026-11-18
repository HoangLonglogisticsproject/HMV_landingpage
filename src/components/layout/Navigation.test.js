// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/i18n/LanguageContext.jsx';
import { copy, products } from '@/data/hmv.js';
import { OPEN_TRADE_DESK } from '@/features/trade-desk/open.js';
import { Navigation } from './Navigation.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// Radix measures the language menu with ResizeObserver, which jsdom lacks.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

let root, container;
beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});

const render = (lang, path = '/') =>
  act(() => root.render(h(MemoryRouter, { key: path, initialEntries: [path] }, h(LanguageProvider, null, h(Navigation, { lang })))));
const $ = selector => container.querySelector(selector);
const button = label => container.querySelector(`button[aria-label="${label}"]`);
const click = el => act(() => el.click());
const menu = () => $('.logistics-text-dropdown');
const links = el => [...el.querySelectorAll(':scope > a')].map(a => a.textContent);

test('the section of the current page is marked active, and only it', async () => {
  for (const [path, active] of [['/logistics', '/supply-chain'], ['/blog/x', '/insights'], ['/regulations', '/regulations'], ['/activities', '/about'], ['/', '/']]) {
    await render('en', path);
    const marked = [...container.querySelectorAll('.nav-center a.nav-active')].map(a => a.getAttribute('href'));
    assert.deepEqual(marked, [active], path);
  }
});

test('the supply chain menu: each group toggles its links; groups reopen as they were left', async () => {
  await render('en');
  const t = copy.en;
  assert.equal(menu(), null);
  await click(button(`${t.supply} submenu`));
  assert.equal(menu().getAttribute('role'), 'menu');
  const farming = button('Toggle Farming Commodities menu');
  assert.equal(farming.getAttribute('aria-expanded'), 'false');
  await click(farming);
  assert.equal(farming.getAttribute('aria-expanded'), 'true');
  assert.ok(farming.classList.contains('is-open'));
  assert.ok(farming.parentElement.classList.contains('is-active-dropdown'));
  assert.deepEqual(links(farming.closest('.log-text-group').querySelector('.log-text-sublist')), [...products.map(p => p.en), 'All products & specifications']);

  // Logistics holds the four services, each a group of its own.
  assert.equal(button('Toggle Cross Border menu'), null);
  await click(button('Toggle Logistics menu'));
  const services = ['Toggle Dangerous Goods menu', 'Toggle Cross Border menu', 'Toggle Local Agency menu', 'Toggle Oversea Agency menu'];
  assert.ok(services.every(label => button(label)?.getAttribute('aria-expanded') === 'false'));
  await click(button('Toggle Cross Border menu'));
  assert.deepEqual(links(button('Toggle Cross Border menu').closest('.log-text-group').querySelector('.log-text-sublist')), [
    'Cross-border container drayage',
    'Dual customs clearance (Moc Bai, Xa Mat, Hoa Lu)',
    'Express 12-24h transit (HCMC ⇄ Phnom Penh)',
  ]);

  // Closing the menu keeps which groups are open; a second toggle collapses one.
  await click(button(`${t.supply} submenu`));
  assert.equal(menu(), null);
  await click(button(`${t.supply} submenu`));
  for (const label of ['Toggle Farming Commodities menu', 'Toggle Logistics menu', 'Toggle Cross Border menu']) {
    assert.equal(button(label).getAttribute('aria-expanded'), 'true', label);
  }
  await click(button('Toggle Farming Commodities menu'));
  assert.equal(button('Toggle Farming Commodities menu').getAttribute('aria-expanded'), 'false');

  // Escape closes the menu; a link closes it too.
  await act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
  assert.equal(menu(), null);
  await click(button(`${t.supply} submenu`));
  await click(menu().querySelector('a[href="/supply-chain"]'));
  assert.equal(menu(), null);
});

test('Vietnamese: the menu and its groups in Vietnamese', async () => {
  await render('vi');
  await click(button(`${copy.vi.supply} submenu`));
  await click(button('Toggle Wind Energy menu'));
  assert.ok(menu().textContent.includes('Nông nghiệp & Nông sản xuất khẩu'));
  assert.ok(menu().textContent.includes('Tổng quan chuỗi cung ứng HMV'));
  assert.deepEqual(links(button('Toggle Wind Energy menu').closest('.log-text-group').querySelector('.log-text-sublist')), [
    'Dự án điện gió trên bờ & ngoài khơi',
    'Chuỗi vật tư & cấu kiện tuabin',
    'Chuyển đổi xanh & Tiêu chuẩn CBAM',
  ]);
});

test('the phone drawer opens and closes; the Trade Desk button closes it and opens the desk', async () => {
  await render('en');
  const toggle = $('button.mobile-toggle');
  assert.equal(toggle.getAttribute('aria-label'), copy.en.menu);
  await click(toggle);
  assert.ok($('.nav-links-wrap').classList.contains('nav-open'));
  assert.equal(toggle.getAttribute('aria-label'), 'Close navigation');
  const opened = [];
  const onOpen = e => opened.push(e.detail);
  window.addEventListener(OPEN_TRADE_DESK, onOpen);
  await click($('button.nav-support-btn'));
  window.removeEventListener(OPEN_TRADE_DESK, onOpen);
  assert.deepEqual(opened, [{ source: 'nav' }]);
  assert.ok(!$('.nav-links-wrap').classList.contains('nav-open'));
});
