// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalReach } from './GlobalReach.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root, container;
beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
const render = (Section, lang) => act(() => root.render(h(Section, { lang })));

test('each chain node is a button described by its tooltip', async () => {
  await render(GlobalReach, 'en');
  const nodes = [...container.querySelectorAll('.chain-nodes li')];
  assert.equal(nodes.length, 3);
  for (const li of nodes) {
    assert.equal(li.getAttribute('tabindex'), null);
    const tip = container.querySelector(`#${li.querySelector('button').getAttribute('aria-describedby')}`);
    assert.equal(tip.getAttribute('role'), 'tooltip');
    assert.ok(li.contains(tip));
  }
});

test('the map is a labelled figure; a market hub shows its sample freight on hover, focus or click', async () => {
  await render(GlobalReach, 'vi');
  const map = container.querySelector('figure.living-logistics');
  assert.equal(map.getAttribute('aria-label'), 'Kết nối thị trường mục tiêu từ Việt Nam');
  const [europe] = container.querySelectorAll('.living-hub-btn');
  assert.equal(europe.getAttribute('aria-expanded'), 'false');
  await act(() => europe.click());
  assert.equal(europe.getAttribute('aria-expanded'), 'true');
  assert.ok(container.querySelector(`#${europe.getAttribute('aria-describedby')}`).textContent.includes('Đường biển: 24–28 ngày'));
  await act(() => europe.click());
  assert.equal(europe.getAttribute('aria-expanded'), 'false');
});
