// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { bundledArticle } from '../../features/articles/bundled.js';
import { OPEN_TRADE_DESK } from '../../features/trade-desk/open.js';
import { ArticleView } from './ArticleView.jsx';

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

async function renderArticle(slug) {
  const article = bundledArticle(slug, 'en');
  await act(() => root.render(h(MemoryRouter, null, h(ArticleView, { lang: 'en', state: { status: 'ready', article } }))));
  return article;
}

// A bundled article about a product links its closing question to that product's page.
test('article with a product: the CTA question links to the product page', async () => {
  const { cta } = await renderArticle('exporting-passion-fruit-eu');
  const link = container.querySelector('.article-cta p a');
  assert.equal(link.textContent, cta);
  assert.equal(link.getAttribute('href'), '/products/passion-fruit');
});

// Without a product (like every CMS article) the question stays plain text.
test('article without a product: the CTA question renders, with no product link', async () => {
  const { cta, product } = await renderArticle('optimizing-tropical-logistics');
  assert.equal(product, undefined);
  assert.equal(container.querySelector('.article-cta p').textContent, cta);
  assert.equal(container.querySelector('.article-cta a[href^="/products/"]'), null);
});

// A cassava buyer guide: its inline links reach the product page, and its call to action opens the HMV Trade Desk with
// the product and the article's own source instead of the quotation form.
test('cassava guide: inline link to the product page; the CTA opens the Trade Desk with its source', async () => {
  const { tradeDesk } = await renderArticle('dried-cassava-chips-ethanol-procurement-guide');
  assert.equal(tradeDesk, 'en_ethanol_guide');
  assert.ok(container.querySelector('.article-body p a[href="/products/dried-cassava-chips"]'));
  assert.ok(container.querySelector('.article-body p a[href="/products/dried-cassava-chips#quality"]'));
  assert.equal(container.querySelector('.article-cta a[href="/#initiate-trade"]'), null);
  const opened = [];
  const onOpen = e => opened.push(e.detail);
  window.addEventListener(OPEN_TRADE_DESK, onOpen);
  await act(() => container.querySelector('.article-cta button').click());
  window.removeEventListener(OPEN_TRADE_DESK, onOpen);
  assert.deepEqual(opened, [{ product: 'dried-cassava-chips', source: 'en_ethanol_guide' }]);
});

test('article without a Trade Desk source: the CTA stays the quotation link', async () => {
  await renderArticle('exporting-passion-fruit-eu');
  assert.ok(container.querySelector('.article-cta a[href="/#initiate-trade"]'));
  assert.equal(container.querySelector('.article-cta button'), null);
});
