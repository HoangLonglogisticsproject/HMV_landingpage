// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { packagingData } from '@/data/operationalLogistics';
import { PackagingView } from './PackagingView.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has HTMLDialogElement but not showModal() or close(); the browser tests use the real ones.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close = function close() {
  this.open = false;
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
const render = lang => act(() => root.render(h(MemoryRouter, null, h(PackagingView, { lang }))));
const texts = selector => [...container.querySelectorAll(selector)].map(e => e.textContent);

test('the hero figures and the three parts, in both languages', async () => {
  for (const lang of ['en', 'vi']) {
    await render(lang);
    assert.deepEqual(texts('.pack-stat-item span'), packagingData.stats.map(s => (lang === 'vi' ? s.labelVi : s.labelEn)), lang);
    for (const part of ['.pack-standards-section', '.pack-stages-section', '.pack-assurance-section']) assert.ok(container.querySelector(part), `${lang} ${part}`);
    assert.equal(container.querySelectorAll('.pack-card').length, packagingData.standards.length, lang);
    assert.equal(container.querySelectorAll('.transport-stage-row').length, packagingData.transportStages.length, lang);
  }
});

test('a packaging photo opens in a modal dialog; Escape closes it and gives focus back', async () => {
  await render('vi');
  const thumb = container.querySelector('.pack-card-media');
  await act(() => thumb.click());
  const dialog = container.querySelector('dialog.pack-lightbox');
  assert.ok(dialog.open);
  assert.equal(dialog.getAttribute('aria-label'), 'Packaging & Freight Evidence');
  assert.equal(document.activeElement.getAttribute('aria-label'), 'Đóng cửa sổ');
  await act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
  assert.equal(container.querySelector('dialog'), null);
  assert.equal(document.activeElement, thumb);
});
