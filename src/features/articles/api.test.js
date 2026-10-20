import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchArticles, resolveArticle } from './api.js';

// Shapes follow CMS_HMV docs/api/openapi-spec.json (PublicArticleSummary / PublicArticle / ErrorResponse).
const summary = (over = {}) => ({
  id: '0199f3a0-0000-7000-8000-0000000000aa', locale: 'en', slug: 'test-econews-integration', title: '[TEST] EcoNews integration',
  excerpt: 'Excerpt', category: { code: 'SUPPLY_CHAIN_INSIGHTS', name: 'Supply Chain Insights' },
  cover: { url: 'http://localhost:4000/media-files/media/2026/10/cover.webp', width: 1600, height: 900, alt: 'Cover alt' },
  isFeatured: false, authorName: null, authorRole: null, readTimeMinutes: 2,
  publishedAt: '2026-10-13T10:00:00.000Z', updatedAt: '2026-10-14T08:00:00.000Z', ...over,
});
const detail = (over = {}) => ({
  ...summary(), content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Body' }] }] },
  seo: { title: 'SEO title', description: 'SEO description' }, alternates: [], ...over,
});
const notFound = { statusCode: 404, code: 'ARTICLE_NOT_FOUND', message: 'Article not found' };

// routes: url → JSON body, or an HTTP status number. Unlisted URLs answer 404 like the CMS.
function mockFetch(routes) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    const r = routes[url];
    if (typeof r === 'number') return Response.json({ statusCode: r, code: 'X', message: 'x' }, { status: r });
    return r ? Response.json(r) : Response.json(notFound, { status: 404 });
  };
  return calls;
}

test('list: exact public URL, no credentials, no custom headers', async () => {
  const calls = mockFetch({ '/api/v1/public/articles?locale=en&pageSize=3': { items: [summary()], page: 1, pageSize: 3, total: 1 } });
  await fetchArticles({ locale: 'en', pageSize: 3 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/v1/public/articles?locale=en&pageSize=3');
  assert.equal(calls[0].init.credentials, 'omit');
  assert.deepEqual(calls[0].init.headers, { Accept: 'application/json' });
});

test('list: maps DTOs to the view shape', async () => {
  mockFetch({ '/api/v1/public/articles?locale=en&pageSize=3': { items: [summary()], page: 1, pageSize: 3, total: 1 } });
  const [a] = await fetchArticles({ locale: 'en', pageSize: 3 });
  assert.deepEqual(a, {
    key: '0199f3a0-0000-7000-8000-0000000000aa', slug: 'test-econews-integration', title: '[TEST] EcoNews integration',
    metaTitle: '[TEST] EcoNews integration', description: 'Excerpt', category: 'Supply Chain Insights',
    date: { iso: '2026-10-13T10:00:00.000Z', label: 'October 2026' },
    image: { src: 'http://localhost:4000/media-files/media/2026/10/cover.webp', width: 1600, height: 900, alt: 'Cover alt' },
    content: null, cta: null,
  });
});

test('list: nullable fields and unsafe cover URLs', async () => {
  mockFetch({
    '/api/v1/public/articles?locale=vi&pageSize=100': { items: [
      summary({ excerpt: null, cover: null, publishedAt: null }),
      summary({ slug: 'b', cover: { url: 'javascript:alert(1)', width: 1, height: 1, alt: null } }),
      summary({ slug: 'c', cover: { url: 'https://media.example/x.webp', width: 1, height: 1, alt: null } }),
    ], page: 1, pageSize: 100, total: 3 },
  });
  const [a, b, c] = await fetchArticles({ locale: 'vi', pageSize: 100 });
  assert.equal(a.description, '');
  assert.equal(a.image, null);
  assert.deepEqual(a.date, { iso: undefined, label: '' });
  assert.equal(b.image, null);
  assert.equal(c.image.alt, '');
});

test('dates: labels match the bundled articles, in Vietnam time', async () => {
  mockFetch({
    '/api/v1/public/articles?locale=vi&pageSize=2': { items: [summary(), summary({ slug: 'b', publishedAt: '2026-09-30T20:00:00.000Z' })], page: 1, pageSize: 2, total: 2 },
    '/api/v1/public/articles?locale=en&pageSize=2': { items: [summary({ publishedAt: '2026-09-30T20:00:00.000Z' })], page: 1, pageSize: 2, total: 1 },
  });
  const vi = await fetchArticles({ locale: 'vi', pageSize: 2 });
  assert.deepEqual(vi.map(a => a.date.label), ['Tháng 10, 2026', 'Tháng 10, 2026']);
  const [en] = await fetchArticles({ locale: 'en', pageSize: 2 });
  assert.equal(en.date.label, 'October 2026'); // 20:00Z on Sep 30 is Oct 1 in Ho Chi Minh City
});

test('list: HTTP errors and malformed bodies reject, never fall back', async () => {
  mockFetch({ '/api/v1/public/articles?locale=en&pageSize=3': 503 });
  await assert.rejects(fetchArticles({ locale: 'en', pageSize: 3 }), { status: 503 });
  mockFetch({ '/api/v1/public/articles?locale=en&pageSize=3': { data: [] } });
  await assert.rejects(fetchArticles({ locale: 'en', pageSize: 3 }), { status: 0 });
  mockFetch({ '/api/v1/public/articles?locale=en&pageSize=3': { items: [{ slug: 1 }] } });
  await assert.rejects(fetchArticles({ locale: 'en', pageSize: 3 }), { status: 0 });
});

test('detail: found in the requested locale', async () => {
  const calls = mockFetch({ '/api/v1/public/articles/test-econews-integration?locale=en': detail() });
  const r = await resolveArticle({ slug: 'test-econews-integration', lang: 'en' });
  assert.equal(r.status, 'ready');
  assert.equal(r.article.metaTitle, 'SEO title');
  assert.equal(r.article.description, 'SEO description');
  assert.deepEqual(r.article.content, detail().content);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.credentials, 'omit');
});

test('detail: seo.description null falls back to the excerpt', async () => {
  mockFetch({ '/api/v1/public/articles/x?locale=en': detail({ slug: 'x', seo: { title: 'S', description: null } }) });
  const r = await resolveArticle({ slug: 'x', lang: 'en' });
  assert.equal(r.article.description, 'Excerpt');
});

test('detail: other-locale slug redirects to the localized slug via alternates', async () => {
  const calls = mockFetch({
    '/api/v1/public/articles/test-econews-tich-hop?locale=vi': detail({ locale: 'vi', slug: 'test-econews-tich-hop', alternates: [{ locale: 'en', slug: 'test-econews-integration' }] }),
  });
  const r = await resolveArticle({ slug: 'test-econews-tich-hop', lang: 'en' });
  assert.deepEqual(r, { status: 'redirect', to: '/blog/test-econews-integration' });
  assert.deepEqual(calls.map(c => c.url), [
    '/api/v1/public/articles/test-econews-tich-hop?locale=en',
    '/api/v1/public/articles/test-econews-tich-hop?locale=vi',
  ]);
});

test('detail: live only in the other locale is unavailable, not shown', async () => {
  mockFetch({ '/api/v1/public/articles/test-chi-tieng-viet?locale=vi': detail({ locale: 'vi', slug: 'test-chi-tieng-viet', alternates: [] }) });
  assert.deepEqual(await resolveArticle({ slug: 'test-chi-tieng-viet', lang: 'en' }), { status: 'unavailable', locale: 'vi' });
});

test('detail: an alternate equal to the current slug does not redirect (would loop)', async () => {
  mockFetch({ '/api/v1/public/articles/same?locale=en': detail({ slug: 'same', alternates: [{ locale: 'vi', slug: 'same' }] }) });
  assert.deepEqual(await resolveArticle({ slug: 'same', lang: 'vi' }), { status: 'unavailable', locale: 'en' });
});

test('detail: missing in both locales is not-found', async () => {
  const calls = mockFetch({});
  assert.deepEqual(await resolveArticle({ slug: 'test-ban-nhap', lang: 'vi' }), { status: 'not-found' });
  assert.equal(calls.length, 2);
});

test('detail: non-404 errors reject without probing the other locale', async () => {
  const calls = mockFetch({ '/api/v1/public/articles/x?locale=en': 500 });
  await assert.rejects(resolveArticle({ slug: 'x', lang: 'en' }), { status: 500 });
  assert.equal(calls.length, 1);
});

test('detail: the slug is encoded into a single path segment', async () => {
  const calls = mockFetch({});
  await resolveArticle({ slug: '../admin/articles?x=1', lang: 'en' });
  assert.equal(calls[0].url, '/api/v1/public/articles/..%2Fadmin%2Farticles%3Fx%3D1?locale=en');
  assert.ok(calls.every(c => c.url.startsWith('/api/v1/public/articles/')));
});
