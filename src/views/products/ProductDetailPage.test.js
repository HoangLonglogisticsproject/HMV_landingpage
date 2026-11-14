// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext.jsx';
import { copy, products } from '../../data/hmv.js';
import { cassavaEvidence } from '@/data/cassavaEvidence.js';
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
    test(`${lang} ${id} buyer page: heading, title and an RFQ fixed to the product`, async () => {
      const product = products.find(p => p.id === id);
      await renderProduct(lang, id);
      assert.equal(container.querySelector('h1').textContent, productPages[id][lang].h1);
      assert.equal(document.title, `${productPages[id].seo[lang].title} | HMV Global`);
      assert.equal(container.querySelector('#rfq input[name="product"]').value, product.en);
      assert.equal(container.querySelector('#rfq input[readonly]').value, product[lang]);
      // The hero call to action opens the HMV Trade Desk with this product; the RFQ above stays as the fallback.
      const cta = container.querySelector('.money-actions button');
      assert.equal(cta.textContent, productPages[id][lang].rfq.title);
      const opened = new Promise(resolve => window.addEventListener('open-hmv-trade-desk', e => resolve(e.detail), { once: true }));
      cta.click();
      assert.deepEqual(await opened, { product: id, source: 'product_hero' });
      // The hero's second link jumps to a section of the same page.
      const { target } = productPages[id][lang].hero.secondary;
      assert.ok(container.querySelector(`a[href="#${target}"]`) && container.querySelector(`section#${target}`), target);
    });
  }
}

// The requirement fields belong to the page's product, so its RFQ offers no product choice.
test('a product-page RFQ cannot switch product, and the draft carries the page product', async () => {
  await renderProduct('en', 'dried-cassava-chips');
  const form = container.querySelector('#rfq form');
  assert.equal(form.querySelectorAll('select[name="product"], input[name="product"]:not([type="hidden"])').length, 0);
  assert.ok(![...form.querySelectorAll('select option')].some(o => products.some(p => p.en === o.value)));
  form.elements.namedItem('company').value = 'Feed Co';
  form.elements.namedItem('email').value = 'buyer@example.com';
  await act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  assert.equal(createInquiryMailto.mock.calls.at(-1)[0].product, 'Dried cassava chips');
});

// The dossier facts as rendered: written once in data/productPages.js and formatted per language.
const CASSAVA_FACTS = {
  en: {
    results: ['71.1%', '11.55%', '2.99%', '1.86%', '0.45%', 'Not detected', '0.17 mg/kg', '0.28 mg/kg', '<0.02 mg/kg'],
    figures: ['50,000 MT/month', '10,000 MT/month', '150 containers/month', '250 containers/month'],
    source: 'Source: Intertek Vietnam analysis report AGRIVIETNAM2026-1700, dated 05 Oct 2026. The reported values apply to the analyzed sample.',
  },
  vi: {
    results: ['71,1%', '11,55%', '2,99%', '1,86%', '0,45%', 'Không phát hiện', '0,17 mg/kg', '0,28 mg/kg', '<0,02 mg/kg'],
    figures: ['50.000 tấn/tháng', '10.000 tấn/tháng', '150 container/tháng', '250 container/tháng'],
    source: 'Nguồn: Báo cáo phân tích Intertek Việt Nam AGRIVIETNAM2026-1700 ngày 05/10/2026. Các giá trị áp dụng cho mẫu được phân tích.',
  },
};

// The supply evidence (data/cassavaEvidence.js): what HMV can organize, then the photographs, then the quality results.
test('cassava page: the supply evidence between the buyer section and the quality results; lazy, sized, localized', async () => {
  const { copy, photos } = cassavaEvidence;
  for (const lang of ['en', 'vi']) {
    await renderProduct(lang, 'dried-cassava-chips');
    const section = container.querySelector('section#supply-evidence');
    assert.equal(section.querySelector('h2').textContent, copy[lang].title, lang);
    assert.ok(section.previousElementSibling.textContent.includes(productPages['dried-cassava-chips'][lang].audience.text), lang);
    assert.equal(section.nextElementSibling.id, 'quality', lang);
    const images = [...section.querySelectorAll('img')]
      .map(i => [i.getAttribute('src'), i.alt, i.width, i.height, i.getAttribute('loading')]);
    assert.deepEqual(images, photos.map(p => [p.src, p.alt[lang], p.width, p.height, 'lazy']), lang);
    assert.deepEqual([...section.querySelectorAll('figcaption')].map(f => f.textContent), photos.map(p => p.caption[lang]), lang);
    await act(() => root.unmount());
    root = createRoot(container);
  }
  await renderProduct('en', 'passion-fruit');
  assert.equal(container.querySelector('#supply-evidence'), null);
});

test('cassava page: the Intertek results, report and capacity figures exactly, with their notes', async () => {
  for (const lang of ['en', 'vi']) {
    await renderProduct(lang, 'dried-cassava-chips');
    const { quality, figures } = productPages['dried-cassava-chips'][lang];
    const texts = selector => [...container.querySelectorAll(selector)].map(e => e.textContent);
    assert.deepEqual(texts('.landing-table tbody td'), CASSAVA_FACTS[lang].results, lang);
    assert.deepEqual(texts('.money-figures dd'), CASSAVA_FACTS[lang].figures, lang);
    assert.ok(container.textContent.includes(CASSAVA_FACTS[lang].source), lang);
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
  assert.ok(container.querySelector('#rfq output.rfq-success-message'));
});

// A generic product page links the product it is told apart from; without a see-also there is no such link.
test('a product with a see-also links the related product page', async () => {
  await renderProduct('en', 'tapioca-starch');
  const link = container.querySelector('.money-see-also a');
  assert.equal(link.textContent, products.find(p => p.id === 'tapioca-starch').seeAlso.en);
  assert.equal(link.getAttribute('href'), '/products/dried-cassava-chips');
});

test('a product without a see-also has no related-product link', async () => {
  assert.equal(products.find(p => p.id === 'bananas').seeAlso, undefined);
  await renderProduct('en', 'bananas');
  assert.equal(container.querySelector('.money-see-also'), null);
});

test('an unknown product id renders the not-found heading', async () => {
  await renderProduct('en', 'unknown');
  assert.equal(container.querySelector('h1').textContent, copy.en.notfound);
});
