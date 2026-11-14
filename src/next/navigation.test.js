import { test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useLanguageSwitch } from './navigation.jsx';

let pathname;
vi.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: vi.fn(), useSearchParams: vi.fn() }));
function Probe({ report }) {
  report(useLanguageSwitch());
  return null;
}
function switchAt(path) {
  let result;
  pathname = path;
  renderToStaticMarkup(h(Probe, { report: value => (result = value) }));
  return result;
}

// Simplified Chinese and Korean are page-scoped locales (i18n/routes.js PAGE_LOCALES): only the cassava pages offer them.
test('useLanguageSwitch: the EN and VI cassava pages offer their Chinese and Korean versions; other pages only EN and VI', () => {
  for (const path of ['/products/dried-cassava-chips', '/vi/san-pham/san-lat-kho']) {
    const { scoped, hrefFor } = switchAt(path);
    assert.deepEqual(scoped, ['zh-CN', 'ko'], path);
    assert.equal(hrefFor('zh-CN'), '/zh-cn/cassava-chips');
    assert.equal(hrefFor('ko'), '/ko/tapioca-chips');
  }
  for (const path of ['/', '/products/passion-fruit', '/vi/about']) assert.deepEqual(switchAt(path).scoped, [], path);
});
