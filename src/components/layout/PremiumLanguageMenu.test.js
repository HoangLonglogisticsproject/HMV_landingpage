// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { assetSrc } from '@/lib/utils';
import cnFlag from 'flag-icons/flags/4x3/cn.svg';
import gbFlag from 'flag-icons/flags/4x3/gb.svg';
import krFlag from 'flag-icons/flags/4x3/kr.svg';
import vnFlag from 'flag-icons/flags/4x3/vn.svg';
import { PremiumLanguageMenu } from './PremiumLanguageMenu.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// Radix measures the menu with ResizeObserver, which jsdom lacks.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// The dried cassava chips page in its four languages, as the page-scoped header passes them.
const PAGES = [
  ['en', 'English', '/products/dried-cassava-chips', assetSrc(gbFlag)],
  ['vi', 'Tiếng Việt', '/vi/san-pham/san-lat-kho', assetSrc(vnFlag)],
  ['zh-CN', '简体中文', '/zh-cn/cassava-chips', assetSrc(cnFlag)],
  ['ko', '한국어', '/ko/tapioca-chips', assetSrc(krFlag)],
];
const items = current => PAGES.map(([code, label, href]) => ({ code, label, href, current: code === current }));
const TRIGGER = {
  en: 'Select language, current: English',
  vi: 'Chọn ngôn ngữ, hiện tại: Tiếng Việt',
  'zh-CN': '选择语言，当前：简体中文',
  ko: '언어 선택, 현재: 한국어',
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

const trigger = () => container.querySelector('button.hmv-lang-trigger');
async function open(props) {
  await act(() => root.render(h(PremiumLanguageMenu, props)));
  await act(() => trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  return [...document.querySelectorAll('[role="menuitem"]')];
}

for (const [code, label, , flag] of PAGES) {
  test(`${label} current: its flag and name on the trigger, its check mark in the list`, async () => {
    await act(() => root.render(h(PremiumLanguageMenu, { items: items(code) })));
    assert.equal(trigger().textContent, label);
    assert.equal(trigger().getAttribute('aria-label'), TRIGGER[code]);
    // The flag is decorative: the name says the language.
    const img = trigger().querySelector('img');
    assert.equal(img.getAttribute('src'), flag);
    assert.deepEqual([img.alt, img.getAttribute('aria-hidden')], ['', 'true']);

    const options = await open({ items: items(code) });
    assert.deepEqual(options.map(o => o.textContent), ['English', 'Tiếng Việt', '简体中文', '한국어']);
    assert.deepEqual(options.map(o => [o.getAttribute('aria-current'), Boolean(o.querySelector('.hmv-lang-check'))]),
      PAGES.map(([c]) => (c === code ? ['page', true] : [null, false])));
    assert.deepEqual(options.map(o => o.querySelector('img').getAttribute('src')), PAGES.map(page => page[3]));
  });
}

test('the options are real links to the page in each language; without onSelect, a click follows the link', async () => {
  const options = await open({ items: items('ko') });
  assert.deepEqual(options.map(a => [a.tagName, a.getAttribute('href'), a.hreflang, a.lang]), PAGES.map(([c, , href]) => ['A', href, c, c]));
  // After React's handlers: was the link prevented? Then stop jsdom, which cannot navigate.
  let prevented;
  document.addEventListener('click', e => {
    prevented = e.defaultPrevented;
    e.preventDefault();
  }, { once: true });
  await act(() => options[2].click());
  assert.equal(prevented, false);
});

test('with onSelect, a choice is handled instead of the link: the site header keeps the query and #hash', async () => {
  const onSelect = vi.fn();
  const options = await open({ items: items('en'), onSelect });
  const click = new MouseEvent('click', { bubbles: true, cancelable: true });
  await act(() => options[1].dispatchEvent(click));
  assert.ok(click.defaultPrevented);
  assert.deepEqual(onSelect.mock.calls, [['vi']]);
});

test('without URLs (Vite), the options are menu actions', async () => {
  const onSelect = vi.fn();
  const options = await open({ items: items('vi').slice(0, 2).map(item => ({ ...item, href: undefined })), onSelect });
  assert.deepEqual(options.map(o => o.tagName), ['DIV', 'DIV']);
  await act(() => options[0].click());
  assert.deepEqual(onSelect.mock.calls, [['en']]);
});

test('keyboard: Enter opens on the first option, Escape closes and gives the focus back to the trigger', async () => {
  const options = await open({ items: items('zh-CN') });
  assert.equal(trigger().getAttribute('aria-expanded'), 'true');
  assert.equal(document.activeElement, options[0]);
  await act(() => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  assert.equal(trigger().getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement, trigger());
});
