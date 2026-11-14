// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { cassavaEvidence } from '@/data/cassavaEvidence.js';
import { SupplyEvidence } from './SupplyEvidence.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root, container;
const render = lang => act(() => root.render(h(SupplyEvidence, { evidence: cassavaEvidence, lang })));
beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});

const triggers = () => [...container.querySelectorAll('.supply-evidence-frame')];
const preview = () => container.querySelector('.supply-evidence-preview');
const key = (el, k) => act(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })));

test('every photograph is a button that opens it larger: the same file, its alt text and caption, in each language', async () => {
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
      const photo = cassavaEvidence.photos[i];
      const img = preview().querySelector('img');
      assert.deepEqual([img.getAttribute('src'), img.alt], [photo.src, photo.alt[lang]], `${lang} ${photo.id}`);
      assert.equal(preview().querySelector('figcaption').textContent, photo.caption[lang]);
      assert.equal(preview().querySelector('[role="dialog"]').getAttribute('aria-label'), photo.caption[lang]);
      assert.equal(document.activeElement.getAttribute('aria-label'), cassavaEvidence.copy[lang].close, 'the close button has focus');
      await act(() => document.activeElement.click());
      assert.equal(preview(), null);
      assert.equal(document.activeElement, button, 'focus returns to the photograph');
    }
  }
});

test('the keyboard: Enter and Space open, Escape closes and gives focus back', async () => {
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
});

test('a click on the backdrop closes; a click on the photograph does not', async () => {
  await render('en');
  await act(() => triggers()[2].click());
  await act(() => preview().querySelector('img').click());
  assert.ok(preview());
  await act(() => preview().click());
  assert.equal(preview(), null);
});

// The production WebPs only: the container photograph's original shows the camera stamp, its number and the plate.
test('only the optimized files, never an original JPEG', () => {
  for (const p of cassavaEvidence.photos) assert.match(p.src, /\.webp$/, p.id);
});
