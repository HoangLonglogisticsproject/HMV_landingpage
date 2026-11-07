// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { abs, head, tags } from '../next/html.js';
import { MOCK_PORT, REVALIDATE_SECRET, SERVER_LOG } from './env.js';

/**
 * Next.js with CMS_CONTENT=true against the mock CMS (mock-cms.js), run by playwright.next-cms.config.js.
 * Serial: the tests share the mock's state and the Next.js cache. Each starts from the initial CMS content with every
 * cached CMS response expired.
 */
test.describe.configure({ mode: 'serial' });

const MOCK = `http://localhost:${MOCK_PORT}/__mock`;
const mock = (request, action, query = '') => request.post(`${MOCK}/${action}${query}`);
const cmsRequests = async request => (await (await request.get(`${MOCK}/requests`)).json()).map(r => r.path);
const revalidate = request => request.post('/api/revalidate', { headers: { 'x-revalidate-secret': REVALIDATE_SECRET } });
const html = async (request, url) => (await request.get(url)).text();
const status = async (request, url) => (await request.get(url, { maxRedirects: 0 })).status();
const location = async (request, url) => {
  const res = await request.get(url, { maxRedirects: 0 });
  expect(res.status(), url).toBe(308);
  // Next.js 16.4.5 sends Location twice, identical, when it regenerates a redirecting ISR page (architecture §10).
  const [first, ...repeated] = res.headers().location.split(', ');
  expect(repeated.every(value => value === first), url).toBe(true);
  return new URL(first, 'https://site.invalid').pathname;
};

test.beforeEach(async ({ request }) => {
  await mock(request, 'reset');
  expect((await revalidate(request)).status()).toBe(200);
});

test('About comes from the CMS in each language, in the server HTML', async ({ request }) => {
  expect(head(await html(request, '/about')).h1).toBe('[CMS] About HMV');
  expect(head(await html(request, '/vi/about')).h1).toBe('[CMS] Về HMV');
});

test('a page not published in a language: 200, noindex, no canonical, the not-published message', async ({ request }) => {
  await mock(request, 'unpublish-page', '?locale=vi');
  await revalidate(request);
  const res = await request.get('/vi/about');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(head(body).robots).toContain('noindex');
  expect(head(body).canonical).toBeUndefined();
  expect(body).toContain('Trang này chưa được xuất bản bằng tiếng Việt.');
});

test('home and EcoNews list CMS articles, never the bundled ones', async ({ request }) => {
  const home = await html(request, '/');
  expect(home).toContain('[CMS] Trade update');
  expect(home).not.toContain('Exporting Passion Fruit');
  const insightsVi = await html(request, '/vi/insights');
  expect(insightsVi).toContain('[CMS] Chỉ tiếng Việt');
  expect(tags(insightsVi, 'a').map(a => a.href)).toContain('/vi/tin-tuc/cms-cap-nhat-thuong-mai');
});

test('article: server-rendered, hreflang from the CMS alternates, structured data', async ({ request }) => {
  const body = await html(request, '/blog/cms-trade-update');
  const h = head(body);
  expect(h.h1).toBe('[CMS] Trade update');
  expect(h.canonical).toBe(abs('/blog/cms-trade-update'));
  expect(h.hreflang).toEqual({ en: abs('/blog/cms-trade-update'), vi: abs('/vi/tin-tuc/cms-cap-nhat-thuong-mai'), 'x-default': abs('/blog/cms-trade-update') });
  expect(body).toContain('"@type":"Article"');
  // Published in Vietnamese only: no hreflang at all (SEO spec §7.3), still self-canonical.
  const viOnly = head(await html(request, '/vi/tin-tuc/cms-chi-tieng-viet'));
  expect(viOnly.hreflang).toEqual({});
  expect(viOnly.canonical).toBe(abs('/vi/tin-tuc/cms-chi-tieng-viet'));
});

test('the other language\'s slug: 308 to this language\'s alternate (M-52, M-54)', async ({ request }) => {
  expect(await location(request, '/blog/cms-cap-nhat-thuong-mai')).toBe('/blog/cms-trade-update');
  expect(await location(request, '/vi/tin-tuc/cms-trade-update')).toBe('/vi/tin-tuc/cms-cap-nhat-thuong-mai');
});

test('not available in this language: 200, noindex, a link to the published one (M-53)', async ({ request }) => {
  const res = await request.get('/blog/cms-chi-tieng-viet');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(head(body).robots).toContain('noindex');
  expect(tags(body, 'a').some(a => a.href === '/vi/tin-tuc/cms-chi-tieng-viet' && a.hreflang === 'vi')).toBe(true);
});

test('unknown slug: 404 (M-57); the CMS admin link format resolves (M-56)', async ({ request }) => {
  expect(await status(request, '/blog/cms-unknown')).toBe(404);
  expect(await location(request, '/tin-tuc/cms-cap-nhat-thuong-mai')).toBe('/vi/tin-tuc/cms-cap-nhat-thuong-mai');
  expect(await location(request, '/tin-tuc/cms-trade-update')).toBe('/blog/cms-trade-update');
  expect(await status(request, '/tin-tuc/cms-unknown')).toBe(404);
});

test('takedown: cached until the protected revalidation, then gone from detail, lists and sitemap', async ({ request }) => {
  expect(await status(request, '/blog/cms-takedown')).toBe(200);
  expect(await html(request, '/insights')).toContain('[CMS] Takedown');
  expect(await html(request, '/sitemap.xml')).toContain('/blog/cms-takedown');

  await mock(request, 'reset-requests');
  await mock(request, 'unpublish', '?slug=cms-takedown');
  // Cached: the article is still served, without asking the CMS.
  expect(await status(request, '/blog/cms-takedown')).toBe(200);
  expect(await cmsRequests(request)).toEqual([]);
  // The endpoint refuses a missing or wrong secret, and nothing changes.
  expect((await request.post('/api/revalidate')).status()).toBe(401);
  expect((await request.post('/api/revalidate', { headers: { 'x-revalidate-secret': 'wrong' } })).status()).toBe(401);
  expect(await status(request, '/blog/cms-takedown')).toBe(200);

  expect((await revalidate(request)).status()).toBe(200);
  expect(await status(request, '/blog/cms-takedown')).toBe(404);
  expect(await html(request, '/insights')).not.toContain('[CMS] Takedown');
  expect(await html(request, '/sitemap.xml')).not.toContain('/blog/cms-takedown');
  // The CMS answers with `max-age=60`; the refetch still went to it, asking any HTTP cache on the way to revalidate.
  const log = await (await request.get(`${MOCK}/requests`)).json();
  const refetch = log.find(r => r.path.startsWith('/api/v1/public/articles/cms-takedown?locale=en'));
  expect(refetch?.cacheControl).toBe('no-cache');
  // The other translation was not taken down.
  expect(await status(request, '/vi/tin-tuc/cms-go-bo')).toBe(200);
});

test('CMS_BLOCKED_SLUGS: 404 under every URL form, absent from lists, alternates and the sitemap', async ({ request }) => {
  for (const url of ['/blog/cms-blocked', '/vi/tin-tuc/cms-bi-chan', '/blog/cms-bi-chan', '/vi/tin-tuc/cms-blocked', '/tin-tuc/cms-bi-chan']) {
    expect(await status(request, url), url).toBe(404);
  }
  // Legacy aliases reach the canonical URL, which is a 404.
  expect(await location(request, '/vi/blog/cms-bi-chan')).toBe('/vi/tin-tuc/cms-bi-chan');
  expect(await location(request, '/en/blog/cms-blocked')).toBe('/blog/cms-blocked');
  expect(await location(request, '/blog/cms-blocked?lang=vi')).toBe('/vi/tin-tuc/cms-blocked');
  expect(await html(request, '/insights')).not.toContain('[CMS] Blocked');
  expect(await html(request, '/vi/insights')).not.toContain('[CMS] Bị chặn');
  const sitemap = await html(request, '/sitemap.xml');
  expect(sitemap).not.toContain('cms-blocked');
  expect(sitemap).not.toContain('cms-bi-chan');
});

test('an uncached page whose CMS request fails is a 5xx, not a 404 or bundled content', async ({ request }) => {
  await mock(request, 'fail', '?status=503');
  expect(await status(request, '/blog/cms-never-requested')).toBeGreaterThanOrEqual(500);
  await mock(request, 'fail', '?status=0');
});

test('the browser never calls the CMS', async ({ page }) => {
  const cms = [];
  page.on('request', r => r.url().includes(`:${MOCK_PORT}`) && cms.push(r.url()));
  for (const url of ['/', '/vi/insights', '/blog/cms-trade-update', '/vi/about']) await page.goto(url);
  expect(cms).toEqual([]);
});

test('no secret or CMS origin in client bundles or server output', () => {
  const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  for (const file of files('.next/static')) {
    const code = readFileSync(file, 'utf8');
    expect(code, file).not.toContain(REVALIDATE_SECRET);
    expect(code, file).not.toContain(`localhost:${MOCK_PORT}`);
  }
  expect(readFileSync(SERVER_LOG, 'utf8')).not.toContain(REVALIDATE_SECRET);
});

// What the visitor sees for an unknown or blocked CMS slug: Next.js's default 404 page. Accepted UX exception (D-17),
// with correct 404 and noindex semantics; not counted as solved.
test('unknown or blocked slug in a browser: Next.js default 404 (accepted exception, D-17)', async ({ page }) => {
  for (const path of ['/blog/cms-unknown', '/vi/tin-tuc/cms-bi-chan']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.locator('h1'), path).toHaveText('404');
    await expect(page.getByText('This page could not be found.'), path).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first(), path).toHaveAttribute('content', /noindex/);
  }
});
