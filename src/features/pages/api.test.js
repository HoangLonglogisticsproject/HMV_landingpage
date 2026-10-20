import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchPage } from './api.js';
import { about } from '../../data/about.js';

// Shape follows CMS_HMV docs/api/openapi-spec.json (PublicPage).
const publicPage = (over = {}) => ({
  key: 'about', locale: 'en', title: about.en.hero.title,
  seo: { title: 'About HMV Global', description: 'SEO description' },
  content: about.en, publishedAt: '2026-10-20T08:00:00.000Z', updatedAt: '2026-10-20T08:00:00.000Z', alternates: [],
  ...over,
});

function mockFetch(respond) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return respond(url);
  };
  return calls;
}

test('requests the public page with the locale only, no credentials, no custom headers', async () => {
  const calls = mockFetch(() => Response.json(publicPage()));
  const r = await fetchPage({ key: 'about', locale: 'en' });
  assert.equal(calls[0].url, '/api/v1/public/pages/about?locale=en');
  assert.equal(calls[0].init.credentials, 'omit');
  assert.deepEqual(calls[0].init.headers, { Accept: 'application/json' });
  assert.deepEqual(r, { status: 'ready', page: { content: about.en, seo: { title: 'About HMV Global', description: 'SEO description' } } });
});

test('missing SEO falls back to the page title and an empty description', async () => {
  mockFetch(() => Response.json(publicPage({ seo: undefined })));
  assert.deepEqual((await fetchPage({ key: 'about', locale: 'en' })).page.seo, { title: 'About HMV', description: '' });
});

test('404 (unknown page or locale not published) is not-found, never bundled content', async () => {
  mockFetch(() => Response.json({ statusCode: 404, code: 'PAGE_NOT_FOUND', message: 'Page not found' }, { status: 404 }));
  assert.deepEqual(await fetchPage({ key: 'about', locale: 'vi' }), { status: 'not-found' });
});

test('server errors and malformed bodies reject', async () => {
  mockFetch(() => Response.json({}, { status: 503 }));
  await assert.rejects(fetchPage({ key: 'about', locale: 'en' }), { status: 503 });
  mockFetch(() => Response.json({ title: 'x' }));
  await assert.rejects(fetchPage({ key: 'about', locale: 'en' }), { status: 0 });
});

test('the key is encoded into one path segment', async () => {
  const calls = mockFetch(() => Response.json(publicPage()));
  await fetchPage({ key: '../admin/pages', locale: 'en' });
  assert.equal(calls[0].url, '/api/v1/public/pages/..%2Fadmin%2Fpages?locale=en');
});

test('bundled About copy has the CMS page shape in both languages', () => {
  const shape = v => (Array.isArray(v) ? [shape(v[0])] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v);
  assert.deepEqual(shape(about.vi), shape(about.en));
  assert.deepEqual(Object.keys(about.en), ['hero', 'purpose', 'vision', 'mission', 'values', 'team']);
  const blank = [];
  const walk = (v, p) => (typeof v === 'string' ? !v.trim() && blank.push(p) : Object.entries(v ?? {}).forEach(([k, x]) => walk(x, `${p}.${k}`)));
  walk(about, 'about');
  assert.deepEqual(blank, []); // complete, so it can be imported and submitted for review as is
});
