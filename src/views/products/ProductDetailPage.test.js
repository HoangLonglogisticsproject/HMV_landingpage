// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext.jsx';
import { copy, products } from '../../data/hmv.js';
import { productPages } from '../../data/productPages.js';
import { createInquiryMailto } from '../../features/inquiries/inquiry.js';
import { productMeta } from '../meta.js';
import { ProductDetailPage } from './ProductDetailPage.jsx';

// The draft URL is a same-page hash: jsdom cannot open a mailto: link.
vi.mock('../../features/inquiries/inquiry.js', () => ({ createInquiryMailto: vi.fn(() => '#draft') }));

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
    const product = products.find(p => p.id === 'bananas');
    await renderProduct(lang, product.id);
    assert.equal(container.querySelector('h1').textContent, product[lang]);
    assert.equal(document.title, `${productMeta(lang, product).title} | HMV Global`);
  });
}

// Buyer pages: their own heading and title, and an RFQ with the page's product preselected.
for (const id of Object.keys(productPages)) {
  for (const lang of ['en', 'vi']) {
    test(`${lang} ${id} buyer page: heading, title and the RFQ preselected to the product`, async () => {
      const product = products.find(p => p.id === id);
      await renderProduct(lang, id);
      assert.equal(container.querySelector('h1').textContent, productPages[id][lang].h1);
      assert.equal(document.title, `${productPages[id].seo[lang].title} | HMV Global`);
      assert.equal(container.querySelector('#rfq select[name="product"]').value, product.en);
      assert.equal(container.querySelector('a[href="#rfq"]').textContent, productPages[id][lang].rfq.title);
    });
  }
}

test('cassava page: the Intertek results and capacity figures carry their notes', async () => {
  for (const lang of ['en', 'vi']) {
    await renderProduct(lang, 'dried-cassava-chips');
    const { quality, figures } = productPages['dried-cassava-chips'][lang];
    assert.equal(container.querySelectorAll('.landing-table tbody tr').length, 9, lang);
    assert.ok(container.textContent.includes(quality.note), lang);
    assert.ok(container.textContent.includes(figures.note), lang);
    await act(() => root.unmount());
    root = createRoot(container);
  }
});

test('the RFQ hands the product, the page requirements and the Incoterm to the email draft', async () => {
  await renderProduct('en', 'passion-fruit');
  const form = container.querySelector('#rfq form');
  const set = (name, value) => { form.elements.namedItem(name).value = value; };
  set('company', 'Buyer GmbH');
  set('email', 'buyer@example.com');
  set('grade', 'Brix 14');
  set('incoterm', 'CIF');
  await act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  const [data] = createInquiryMailto.mock.calls.at(-1);
  assert.equal(data.product, 'Passion fruit');
  assert.equal(data.incoterm, 'CIF');
  assert.deepEqual(data.requirements.find(([label]) => label === 'Brix / grade requirement'), ['Brix / grade requirement', 'Brix 14']);
  assert.ok(container.querySelector('#rfq [role="status"]'));
});

test('an unknown product id renders the not-found heading', async () => {
  await renderProduct('en', 'unknown');
  assert.equal(container.querySelector('h1').textContent, copy.en.notfound);
});
