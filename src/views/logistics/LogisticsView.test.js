// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { StrictMode, act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { logisticsServicesData } from '@/data/logisticsServices';
import { LogisticsView } from './LogisticsView.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has HTMLDialogElement but not showModal() or close(); the browser tests use the real ones.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true;
};
// As in browsers, close() queues its close event.
HTMLDialogElement.prototype.close = function close() {
  this.open = false;
  setTimeout(() => this.dispatchEvent(new Event('close')));
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
const render = lang => act(() => root.render(h(MemoryRouter, null, h(LogisticsView, { lang }))));
const { dangerousGoods, crossBorder } = logisticsServicesData;

test('the page sections, in both languages', async () => {
  for (const lang of ['en', 'vi']) {
    await render(lang);
    assert.deepEqual([...container.querySelectorAll('section[id]')].map(s => s.id), ['dangerous-goods', 'cross-border', 'agency-network'], lang);
    assert.equal(container.querySelectorAll('.dg-img-thumb').length, dangerousGoods.subServices.flatMap(s => s.images).length, lang);
    assert.equal(container.querySelectorAll('.cb-img-card').length, crossBorder.images.length, lang);
    assert.ok(container.querySelector('.log-bottom-cta'), lang);
  }
  assert.ok(container.textContent.includes(crossBorder.featuresVi[0]));
  assert.equal(container.querySelectorAll('button button').length, 0, 'no button inside a gallery button');
});

test('a gallery photo is a button that opens it in a modal dialog; closing gives focus back', async () => {
  await render('en');
  const thumb = container.querySelector('.cb-img-card');
  assert.deepEqual([thumb.tagName, thumb.type], ['BUTTON', 'button']);
  await act(() => thumb.click());
  const dialog = container.querySelector('dialog.pack-lightbox');
  assert.ok(dialog.open);
  assert.equal(dialog.getAttribute('aria-label'), crossBorder.images[0].title);
  assert.equal(document.activeElement, dialog.querySelector('.pack-lightbox-close'));
  assert.ok(dialog.querySelector('.pack-lightbox-caption').textContent.includes(crossBorder.images[0].tag));
  await act(() => document.activeElement.click());
  assert.equal(container.querySelector('dialog'), null);
  assert.equal(document.activeElement, thumb);
});

test('under StrictMode the dialog stays open: the close event of the replayed effect is ignored', async () => {
  await act(() => root.render(h(StrictMode, null, h(MemoryRouter, null, h(LogisticsView, { lang: 'en' })))));
  await act(() => container.querySelector('.dg-img-thumb').click());
  await act(() => new Promise(resolve => setTimeout(resolve, 20)));
  assert.ok(container.querySelector('dialog.pack-lightbox')?.open);
});
