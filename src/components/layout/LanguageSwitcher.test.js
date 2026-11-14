// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageSwitcher } from './LanguageSwitcher.jsx';

// The Next.js port's answer for a page: real language URLs, plus the page's page-scoped locales.
let scoped;
const select = vi.fn();
const HREF = { en: '/products/dried-cassava-chips', vi: '/vi/san-pham/san-lat-kho', 'zh-CN': '/zh-cn/cassava-chips', ko: '/ko/tapioca-chips' };
vi.mock('@/lib/navigation', () => ({ useLanguageSwitch: () => ({ lang: 'en', scoped, hrefFor: code => HREF[code], select }) }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// Radix measures the menu with ResizeObserver, which jsdom lacks.
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
  select.mockClear();
});

async function openMenu() {
  await act(() => root.render(h(LanguageSwitcher)));
  const trigger = container.querySelector('button.hmv-lang-trigger');
  await act(() => trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  return [...document.querySelectorAll('a[role="menuitem"]')];
}

test('a page with page-scoped locales lists them after English and Vietnamese, as links to those versions', async () => {
  scoped = ['zh-CN', 'ko'];
  const links = await openMenu();
  assert.deepEqual(links.map(a => [a.textContent, a.getAttribute('href'), a.hreflang, a.lang]), [
    ['English', HREF.en, 'en', 'en'],
    ['Tiếng Việt', HREF.vi, 'vi', 'vi'],
    ['简体中文', HREF['zh-CN'], 'zh-CN', 'zh-CN'],
    ['한국어', HREF.ko, 'ko', 'ko'],
  ]);
  await act(() => links[3].click());
  assert.deepEqual(select.mock.calls, [['ko']]);
});

test('any other page lists English and Vietnamese only', async () => {
  scoped = [];
  assert.deepEqual((await openMenu()).map(a => a.textContent), ['English', 'Tiếng Việt']);
});
