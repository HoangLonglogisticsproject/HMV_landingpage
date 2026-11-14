// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { bundledArticle } from '../../features/articles/bundled.js';
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
