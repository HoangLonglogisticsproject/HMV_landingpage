// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { products } from '@/data/hmv';
import { SupplyChainPillars } from './SupplyChainPillars.jsx';

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
const render = lang => act(() => root.render(h(MemoryRouter, null, h(SupplyChainPillars, { lang }))));
const texts = selector => [...container.querySelectorAll(selector)].map(e => e.textContent);

test('the three pillars, the jump links to them, and the logistics capacity, in both languages', async () => {
  for (const [lang, feature] of [['en', 'Continuous Cold Chain Preservation'], ['vi', 'Chuỗi Lạnh Chuyên Sâu (Cold Chain)']]) {
    await render(lang);
    const pillars = [...container.querySelectorAll('section[id]')].map(s => s.id);
    assert.deepEqual(pillars, ['commodities', 'wind-energy', 'logistics-capacity'], lang);
    for (const id of pillars) assert.ok(container.querySelector(`.pillar-pill[href="#${id}"]`), `${lang} #${id}`);
    assert.deepEqual(texts('#commodities h3').slice(0, products.length), products.map(p => p[lang]), lang);
    assert.equal(texts('.logistics-feature-card h3').length, 4, lang);
    assert.equal(texts('.logistics-feature-card h3')[0], feature, lang);
    assert.ok(container.querySelector('#logistics-capacity .logistics-compliance-card .compliance-card-left'), lang);
  }
});
