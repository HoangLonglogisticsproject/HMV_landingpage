// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext.jsx';
import { copy, products } from '../../data/hmv.js';
import { productMeta } from '../meta.js';
import { ProductDetailPage } from './ProductDetailPage.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
vi.setConfig({ testTimeout: 20_000 });

let root, container;
beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  localStorage.clear();
});

async function renderProduct(lang, id) {
  localStorage.setItem('hmv_lang', lang);
  const page = h(Routes, null, h(Route, { path: '/products/:id', element: h(ProductDetailPage) }));
  await act(() =>
    root.render(h(HelmetProvider, null, h(LanguageProvider, null, h(MemoryRouter, { initialEntries: [`/products/${id}`] }, page)))),
  );
}

// The document title targets wholesale sourcing searches; the visible heading stays the product name.
for (const lang of ['en', 'vi']) {
  test(`${lang} product page: the heading is the product name, the document title the sourcing title`, async () => {
    const [product] = products;
    await renderProduct(lang, product.id);
    assert.equal(container.querySelector('h1').textContent, product[lang]);
    assert.equal(document.title, `${productMeta(lang, product).title} | HMV Global`);
  });
}

test('an unknown product id renders the not-found heading', async () => {
  await renderProduct('en', 'unknown');
  assert.equal(container.querySelector('h1').textContent, copy.en.notfound);
});
