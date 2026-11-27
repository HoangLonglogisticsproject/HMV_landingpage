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
import { SEGMENTS, passionFruitPages, segmentPath } from '../../data/passionFruitPages.js';
import { claimsIn } from '../../data/unsupportedClaims.js';
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

async function renderProduct(lang, id, segment) {
  localStorage.setItem('hmv_lang', lang);
  const page = h(Routes, null,
    h(Route, { path: '/products/:id', element: h(ProductDetailPage) }),
    h(Route, { path: '/products/:id/:segment', element: h(ProductDetailPage) }));
  const path = segment ? `/products/${id}/${segment}` : `/products/${id}`;
  await act(() =>
    root.render(h(HelmetProvider, null, h(LanguageProvider, null, h(MemoryRouter, { initialEntries: [path] }, page)))),
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

// Golden passion fruit: one page per buyer segment, each at its own URL with its own heading, title and call to action.
const headingOf = (lang, segment) => {
  const { title } = passionFruitPages[lang][segment].hero;
  return Array.isArray(title) ? title.join(' ') : title;
};
const opened = () => new Promise(resolve => window.addEventListener('open-hmv-trade-desk', e => resolve(e.detail), { once: true }));
// The rendered text and the image descriptions make none of the claims HMV cannot document (data/unsupportedClaims.js).

for (const lang of ['en', 'vi']) {
  for (const segment of SEGMENTS) {
    test(`${lang} passion fruit ${segment}: its own heading and title, the segment navigation, no unsupported claims`, async () => {
      await renderProduct(lang, 'passion-fruit', segment === 'export' ? undefined : segment);
      const headings = [...container.querySelectorAll('h1')].map(e => e.textContent.replaceAll(/\s+/g, ' ').trim());
      assert.deepEqual(headings, [headingOf(lang, segment)]);
      assert.equal(document.title, `${passionFruitPages[lang][segment].seo.title} | HMV Global`);
      assert.deepEqual(
        [...container.querySelectorAll('nav li a')].map(a => [a.textContent, a.getAttribute('href'), a.getAttribute('aria-current')]),
        SEGMENTS.map(s => [passionFruitPages[lang].nav.items[s], segmentPath(s), s === segment ? 'page' : null]),
      );
      const described = [...container.querySelectorAll('img')].map(img => img.alt).join(' ');
      assert.deepEqual(claimsIn(`${container.textContent} ${described}`), []);
      // Every photograph has a description and a size, so nothing shifts when it loads.
      for (const img of container.querySelectorAll('img')) {
        assert.ok(img.alt || img.closest('[aria-hidden="true"]'), img.src);
        assert.ok(img.getAttribute('width') && img.getAttribute('height'), img.src);
      }
    });
  }

  test(`${lang} passion fruit export: the Trade Desk opens with the product; the Quick RFQ is the one form, fixed to it`, async () => {
    await renderProduct(lang, 'passion-fruit');
    const { hero } = passionFruitPages[lang].export;
    const desk = [...container.querySelectorAll('header button')].find(b => b.textContent === hero.secondary);
    const detail = opened();
    desk.click();
    assert.deepEqual(await detail, { product: 'passion-fruit', segment: 'export', source: 'pf_export_hero' });
    assert.equal(container.querySelectorAll('form').length, 1);
    assert.ok(container.querySelector('section#rfq form'));
    // The product is the page's: the form does not ask for it.
    assert.ok(!container.querySelector('section#rfq [id$="-product"]'));
  });

  for (const segment of ['foodservice', 'retail']) {
    test(`${lang} passion fruit ${segment}: the calls to action open the Trade Desk with the product; no form`, async () => {
      await renderProduct(lang, 'passion-fruit', segment);
      const page = passionFruitPages[lang][segment];
      const [first, last] = [page.hero.primary, page.cta.button].map(label => [...container.querySelectorAll('button')].find(b => b.textContent === label));
      for (const [button, source] of [[first, `pf_${segment}_hero`], [last, `pf_${segment}_cta`]]) {
        const detail = opened();
        button.click();
        assert.deepEqual(await detail, { product: 'passion-fruit', segment, source });
      }
      assert.ok(!container.querySelector('form, input, select'));
    });
  }
}

test('an unknown passion fruit segment, or a segment of another product, renders the not-found heading', async () => {
  for (const [id, segment] of [['passion-fruit', 'wholesale'], ['bananas', 'retail']]) {
    // A new router per case: the memory router reads its first entry only when it is created.
    await act(() => root.unmount());
    root = createRoot(container);
    await renderProduct('en', id, segment);
    assert.equal(container.querySelector('h1').textContent, copy.en.notfound, `${id}/${segment}`);
  }
});

// Dried cassava chips: the procurement page (views/products/CassavaProcurement) through the product route, in the site's
// language and chrome; both calls to action open the HMV Trade Desk, and the page has no RFQ form or email draft.
for (const lang of ['en', 'vi']) {
  test(`${lang} dried-cassava-chips: the procurement page, its heading and title; the Trade Desk, no RFQ form`, async () => {
    const page = productPages['dried-cassava-chips'];
    await renderProduct(lang, 'dried-cassava-chips');
    assert.deepEqual([...container.querySelectorAll('h1')].map(e => e.textContent), [page[lang].hero.h1]);
    assert.equal(document.title, `${page.seo[lang].title} | HMV Global`);
    assert.equal(container.querySelector('form, input[name="product"], .rfq-form'), null);
    const opened = [];
    const onOpen = e => opened.push(e.detail);
    window.addEventListener('open-hmv-trade-desk', onOpen);
    for (const selector of ['#overview button', '#rfq button']) container.querySelector(selector).click();
    window.removeEventListener('open-hmv-trade-desk', onOpen);
    assert.deepEqual(opened, ['hero', 'rfq'].map(at => ({ product: 'dried-cassava-chips', source: `${lang}_${at}` })));
    assert.equal(createInquiryMailto.mock.calls.length, 0);
  });
}

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

test('cassava page: the Intertek results, report and capacity figures exactly, with their notes', async () => {
  for (const lang of ['en', 'vi']) {
    await renderProduct(lang, 'dried-cassava-chips');
    const { quality, figures } = productPages['dried-cassava-chips'][lang];
    const texts = selector => [...container.querySelectorAll(selector)].map(e => e.textContent);
    assert.deepEqual(texts('#quality tbody td'), CASSAVA_FACTS[lang].results, lang);
    assert.deepEqual(texts('#capability dd'), CASSAVA_FACTS[lang].figures, lang);
    // The hero panel: the same figures, then the Intertek reference's starch and moisture.
    assert.deepEqual(texts('#overview dd'), [...CASSAVA_FACTS[lang].figures, ...CASSAVA_FACTS[lang].results.slice(0, 2)], lang);
    assert.ok(container.textContent.includes(CASSAVA_FACTS[lang].source), lang);
    assert.ok(container.textContent.includes(quality.note), lang);
    assert.ok(container.textContent.includes(figures.note), lang);
    await act(() => root.unmount());
    root = createRoot(container);
  }
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
