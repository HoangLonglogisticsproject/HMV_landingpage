// @ts-check
/**
 * EcoNews in CMS mode (dist-cms bundle, port 4174).
 * The CMS public API is mocked per test with payloads shaped like CMS_HMV docs/api/openapi-spec.json,
 * so these run without a backend. Unmatched API calls answer 404 like the CMS does.
 *
 * No zero-console-error assertion here: resolving a slug from the other locale makes one expected 404.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:4174' });

const API = '/api/v1/public';
const category = { en: { code: 'SUPPLY_CHAIN_INSIGHTS', name: 'Supply Chain Insights' }, vi: { code: 'SUPPLY_CHAIN_INSIGHTS', name: 'Thông Tin Chuỗi Cung Ứng' } };
const content = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Intro with ' }, { type: 'text', text: 'a source', marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'https://example.com/report', target: '_blank', rel: 'noopener noreferrer nofollow' } }] }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Section heading' }] },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Sub heading' }] },
    { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quoted line' }] }] },
    { type: 'orderedList', attrs: { start: 1, type: null }, content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Step one' }] }] }] },
    { type: 'image', attrs: { src: '/favicon.png', alt: 'Inline image alt', title: null, width: null, height: null, mediaId: '0199f3a0-0000-7000-8000-000000000001' } },
    { type: 'horizontalRule' },
  ],
};
function article(locale, slug, title, alternates) {
  return {
    id: `id-${slug}`, locale, slug, title, excerpt: `${title} excerpt`, category: category[locale],
    cover: { url: '/og-image.jpg', width: 1200, height: 630, alt: `${title} cover` },
    isFeatured: false, authorName: null, authorRole: null, readTimeMinutes: 1,
    publishedAt: '2026-10-13T10:00:00.000Z', updatedAt: '2026-10-13T10:00:00.000Z',
    content, seo: { title, description: `${title} description` }, alternates,
  };
}
const A_EN = article('en', 'test-econews-integration', '[TEST] EcoNews integration', [{ locale: 'vi', slug: 'test-econews-tich-hop' }]);
const A_VI = article('vi', 'test-econews-tich-hop', '[TEST] Tích hợp EcoNews', [{ locale: 'en', slug: 'test-econews-integration' }]);
const B_VI = article('vi', 'test-chi-tieng-viet', '[TEST] Chỉ tiếng Việt', []);
const summary = ({ content: _c, seo: _s, alternates: _a, ...rest }) => rest;
const list = (...items) => ({ items: items.map(summary), page: 1, pageSize: items.length, total: items.length });

const PUBLISHED = {
  [`${API}/articles?locale=en&pageSize=3`]: list(A_EN),
  [`${API}/articles?locale=en&pageSize=100`]: list(A_EN),
  [`${API}/articles?locale=vi&pageSize=3`]: list(A_VI, B_VI),
  [`${API}/articles?locale=vi&pageSize=100`]: list(A_VI, B_VI),
  [`${API}/articles/test-econews-integration?locale=en`]: A_EN,
  [`${API}/articles/test-econews-tich-hop?locale=vi`]: A_VI,
  [`${API}/articles/test-chi-tieng-viet?locale=vi`]: B_VI,
};
const STATIC_TITLES = /Exporting Passion Fruit|Optimizing Tropical Agri-Logistics|Circular Agriculture/;

/** routes: path+query → JSON body or HTTP status. Returns the intercepted requests. */
async function mockCms(page, routes = PUBLISHED, { delay = 0 } = {}) {
  const requests = [];
  await page.route(`**${API}/**`, async route => {
    const req = route.request();
    const url = new URL(req.url());
    const key = url.pathname + url.search;
    requests.push({ key, headers: await req.allHeaders() });
    if (delay) await new Promise(r => setTimeout(r, delay));
    const r = routes[key];
    if (typeof r === 'number') return route.fulfill({ status: r, json: { statusCode: r, code: 'INTERNAL_ERROR', message: 'Unavailable' } });
    if (r) return route.fulfill({ json: r });
    return route.fulfill({ status: 404, json: { statusCode: 404, code: 'ARTICLE_NOT_FOUND', message: 'Article not found' } });
  });
  return requests;
}

test('home shows the latest CMS articles, not the bundled ones', async ({ page }) => {
  await mockCms(page);
  await page.goto('/');
  const section = page.locator('section.insights-home');
  await expect(section.locator('.insight-card h3')).toHaveText(['[TEST] EcoNews integration'], { timeout: 10_000 });
  await expect(section).not.toContainText(STATIC_TITLES);
});

test('listing card opens the article detail with rich content and metadata', async ({ page }) => {
  await mockCms(page);
  await page.goto('/insights');
  const card = page.locator('a.insight-card', { hasText: '[TEST] EcoNews integration' });
  await expect(card).toHaveAttribute('href', '/blog/test-econews-integration');
  await expect(card.locator('img')).toHaveAttribute('alt', '[TEST] EcoNews integration cover');
  await expect(card.locator('time')).toHaveText('October 2026');
  await card.click();

  await expect(page).toHaveURL(/\/blog\/test-econews-integration$/);
  await expect(page.locator('h1').first()).toHaveText('[TEST] EcoNews integration');
  await expect(page).toHaveTitle('[TEST] EcoNews integration | HMV Global');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', '[TEST] EcoNews integration description');
  await expect(page.locator('.article-meta')).toContainText('Supply Chain Insights');
  await expect(page.locator('.article-hero img')).toHaveAttribute('src', '/og-image.jpg');

  const body = page.locator('article.article-body');
  await expect(body.locator('h2')).toHaveText('Section heading');
  await expect(body.locator('h3')).toHaveText('Sub heading');
  await expect(body.locator('blockquote')).toHaveText('Quoted line');
  await expect(body.locator('ol > li')).toHaveText('Step one');
  await expect(body.locator('hr')).toHaveCount(1);
  await expect(body.locator('img')).toHaveAttribute('alt', 'Inline image alt');
  const link = body.locator('a[href="https://example.com/report"]');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  const cta = body.locator('a[href="/#initiate-trade"]');
  await expect(cta).toBeVisible();
  // Content-link styling must not leak onto the CTA button (it would turn its label blue on blue).
  const decoration = el => getComputedStyle(el).textDecorationLine;
  expect(await link.evaluate(decoration)).toContain('underline');
  expect(await cta.evaluate(decoration)).not.toContain('underline');

  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.some(s => s.includes('"headline":"[TEST] EcoNews integration"'))).toBe(true);
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test('loading state is shown while the CMS responds', async ({ page }) => {
  await mockCms(page, PUBLISHED, { delay: 1500 });
  await page.goto('/insights');
  await expect(page.locator('.insight-grid[aria-busy="true"]')).toBeVisible();
  await expect(page.locator('.insight-card h3')).toHaveText(['[TEST] EcoNews integration'], { timeout: 10_000 });
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
});

test('empty state when nothing is published in this locale', async ({ page }) => {
  await mockCms(page, { [`${API}/articles?locale=en&pageSize=100`]: list() });
  await page.goto('/insights');
  await expect(page.locator('.insight-status')).toHaveText('No EcoNews articles have been published yet.');
  await expect(page.locator('.insight-card')).toHaveCount(0);
});

test('API errors render an error state, never bundled articles', async ({ page }) => {
  await mockCms(page, { [`${API}/articles?locale=en&pageSize=100`]: 503, [`${API}/articles/test-econews-integration?locale=en`]: 500 });
  await page.goto('/insights');
  await expect(page.locator('.insight-status[role="alert"]')).toHaveText('EcoNews could not be loaded. Please try again later.');
  await expect(page.locator('main')).not.toContainText(STATIC_TITLES);

  await page.goto('/blog/test-econews-integration');
  await expect(page.locator('h1').first()).toHaveText('This article could not be loaded');
  // A temporary failure must not deindex a live article.
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test('unpublished, draft or archived slugs show not-found with noindex', async ({ page }) => {
  await mockCms(page);
  await page.goto('/blog/test-ban-nhap');
  await expect(page.locator('h1').first()).toHaveText('Article not found');
  await expect(page).toHaveURL(/\/blog\/test-ban-nhap$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('a[href="/insights"]', { hasText: 'All EcoNews articles' })).toBeVisible();
});

test('opening another language\'s slug redirects to the localized slug', async ({ page }) => {
  await mockCms(page);
  await page.goto('/blog/test-econews-integration?lang=vi');
  await expect(page).toHaveURL(/\/blog\/test-econews-tich-hop$/);
  await expect(page.locator('h1').first()).toHaveText('[TEST] Tích hợp EcoNews');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
});

test('switching language on an article follows its alternate slug', async ({ page }) => {
  test.skip(test.info().project.name === 'chromium-mobile', 'Switcher hidden inside drawer on mobile');
  await mockCms(page);
  await page.goto('/blog/test-econews-integration');
  await expect(page.locator('h1').first()).toHaveText('[TEST] EcoNews integration');
  await page.locator('button.hmv-lang-trigger').first().click();
  await page.locator('[role="menuitem"]:has-text("Tiếng Việt")').first().click();
  await expect(page).toHaveURL(/\/blog\/test-econews-tich-hop$/);
  await expect(page.locator('h1').first()).toHaveText('[TEST] Tích hợp EcoNews');
});

test('an article not published in the visitor\'s language is not shown automatically', async ({ page }) => {
  await mockCms(page);
  await page.goto('/blog/test-chi-tieng-viet');
  await expect(page.locator('h1').first()).toHaveText('This article is not available in English');
  await expect(page.locator('main')).not.toContainText('[TEST] Chỉ tiếng Việt');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await page.getByRole('button', { name: 'Read in Vietnamese' }).click();
  await expect(page.locator('h1').first()).toHaveText('[TEST] Chỉ tiếng Việt');
  await expect(page).toHaveURL(/\/blog\/test-chi-tieng-viet$/);
});

test('legacy /vi/blog/<slug> keeps working', async ({ page }) => {
  await mockCms(page);
  await page.goto('/vi/blog/test-econews-tich-hop');
  await expect(page).toHaveURL(/\/blog\/test-econews-tich-hop$/);
  await expect(page.locator('h1').first()).toHaveText('[TEST] Tích hợp EcoNews');
});

test('public requests carry no admin cookie or CSRF token and only hit /api/v1/public', async ({ page, context }) => {
  await context.addCookies([{ name: 'hmv_session', value: 'admin-session-must-not-leak', domain: 'localhost', path: '/' }]);
  const apiCalls = [];
  page.on('request', r => { if (new URL(r.url()).pathname.startsWith('/api/')) apiCalls.push(new URL(r.url()).pathname); });
  const requests = await mockCms(page);
  await page.goto('/insights');
  await page.locator('a.insight-card').first().click();
  await expect(page.locator('h1').first()).toHaveText('[TEST] EcoNews integration');

  expect(requests.length).toBeGreaterThanOrEqual(2);
  for (const { key, headers } of requests) {
    expect(key.startsWith(`${API}/articles`)).toBe(true);
    expect(headers.cookie).toBeUndefined();
    expect(headers['x-csrf-token']).toBeUndefined();
  }
  expect(apiCalls.every(p => p.startsWith(`${API}/`))).toBe(true);
});

test('bundles contain no admin credentials or privileged API paths', () => {
  const forbidden = /hmv_session|x-csrf-token|csrfToken|\/api\/v1\/(admin|auth)|credentials:\s*["'`]include/i;
  const scan = dir => readdirSync(`${dir}/assets`).filter(f => f.endsWith('.js')).map(f => readFileSync(`${dir}/assets/${f}`, 'utf8')).join('\n');
  const cms = scan('dist-cms');
  expect(cms).toContain(`${API}`);
  expect(cms).not.toMatch(forbidden);
  if (existsSync('dist')) {
    const plain = scan('dist');
    expect(plain).not.toMatch(forbidden);
    expect(plain).not.toContain(`${API}`); // CMS client is tree-shaken out of the default build
  }
});
