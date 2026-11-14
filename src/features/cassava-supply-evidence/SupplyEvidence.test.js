// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { cassavaEvidence } from '@/data/cassavaEvidence.js';
import { SupplyEvidence } from './SupplyEvidence.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has HTMLDialogElement but not showModal() or close(): the test supplies them, recording the modal opens. The
// browser tests (tests/next/supply-evidence.spec.js) use the real ones, with the page behind made inert.
const modal = [];
HTMLDialogElement.prototype.showModal = function showModal() {
  modal.push(this);
  this.open = true;
};
HTMLDialogElement.prototype.close = function close() {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

let root, container;
const render = lang => act(() => root.render(h(SupplyEvidence, { evidence: cassavaEvidence, lang })));
beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  modal.length = 0;
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});

const triggers = () => [...container.querySelectorAll('.supply-evidence-frame')];
const preview = () => container.querySelector('dialog.supply-evidence-preview');
const key = (el, k) => act(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })));
const photo = i => cassavaEvidence.photos[i];

test('every photograph is a button that opens it in a modal dialog: the same file, its alt text and caption', async () => {
  for (const lang of ['en', 'vi', 'zh', 'ko']) {
    await render(lang);
    const buttons = triggers();
    assert.equal(buttons.length, cassavaEvidence.photos.length, lang);
    for (const [i, button] of buttons.entries()) {
      assert.equal(button.getAttribute('role'), 'button');
      assert.equal(button.tabIndex, 0);
      assert.equal(button.title, cassavaEvidence.copy[lang].zoom);
      assert.equal(preview(), null, 'closed until clicked');
      await act(() => button.click());
      const dialog = preview();
      // A native dialog opened as a modal, named by the caption; no ARIA role standing in for it.
      assert.ok(dialog.open && modal.at(-1) === dialog, 'showModal');
      assert.deepEqual([dialog.getAttribute('aria-label'), dialog.getAttribute('role'), dialog.getAttribute('aria-modal')], [photo(i).caption[lang], null, null]);
      const img = dialog.querySelector('img');
      assert.deepEqual([img.getAttribute('src'), img.alt], [photo(i).src, photo(i).alt[lang]], `${lang} ${photo(i).id}`);
      assert.equal(dialog.querySelector('figcaption').textContent, photo(i).caption[lang]);
      // Focus opens on the close button, inside the dialog.
      assert.equal(document.activeElement.getAttribute('aria-label'), cassavaEvidence.copy[lang].close);
      assert.ok(dialog.contains(document.activeElement));
      await act(() => document.activeElement.click());
      assert.equal(preview(), null);
      assert.equal(document.activeElement, button, 'focus returns to the photograph');
    }
  }
});

test('the keyboard: Enter and Space open; Escape closes once and gives focus back', async () => {
  await render('en');
  const [lead, loading] = triggers();
  await key(lead, 'Enter');
  assert.match(preview().querySelector('img').getAttribute('src'), /cassava-bulk-stock\.webp$/);
  await key(document, 'Escape');
  assert.equal(preview(), null);
  assert.equal(document.activeElement, lead);
  await key(loading, ' ');
  assert.match(preview().querySelector('img').getAttribute('src'), /cassava-container-loading\.webp$/);
  await key(document, 'Escape');
  assert.equal(document.activeElement, loading);
  assert.equal(modal.length, 2, 'one modal open per photograph');
});

// The browser's own ways out of a modal dialog go through the Lightbox state, which unmounts it.
test('the native cancel (Escape) is the state\'s to act on; a native close updates the state too', async () => {
  await render('en');
  const [lead, loading] = triggers();
  await act(() => lead.click());
  const cancel = new Event('cancel', { cancelable: true });
  await act(() => preview().dispatchEvent(cancel));
  assert.ok(cancel.defaultPrevented, 'the browser does not close it behind the state');
  assert.equal(preview(), null);
  assert.equal(document.activeElement, lead);
  await act(() => loading.click());
  await act(() => preview().close());
  assert.equal(preview(), null);
  assert.equal(document.activeElement, loading);
});

test('a click beside the photograph closes; on the photograph, its caption or nothing else it does not', async () => {
  await render('en');
  await act(() => triggers()[2].click());
  for (const inside of ['img', 'figcaption', 'figure']) {
    await act(() => preview().querySelector(inside).click());
    assert.ok(preview(), inside);
  }
  // The dialog fills the viewport: a click on it, not on its content, is a click beside the photograph.
  await act(() => preview().click());
  assert.equal(preview(), null);
});

// The production WebPs only: the container photograph's original shows the camera stamp, its number and the plate.
test('only the optimized files, never an original JPEG', () => {
  for (const p of cassavaEvidence.photos) assert.match(p.src, /\.webp$/, p.id);
});
