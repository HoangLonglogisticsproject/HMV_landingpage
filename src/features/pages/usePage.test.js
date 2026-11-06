// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { about } from '../../data/about.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// `usePage` is chosen at import from VITE_CMS_CONTENT (.env.cms in `--mode cms`); tests import it fresh per mode.
async function importUsePage({ cms }) {
  vi.stubEnv('VITE_CMS_CONTENT', cms ? 'true' : '');
  vi.resetModules();
  return (await import('./usePage.js')).usePage;
}

let root, state, requests;
function Probe({ usePage, lang, report }) {
  report(usePage('about', lang));
  return null;
}
const show = (usePage, lang) => act(() => root.render(h(Probe, { usePage, lang, report: s => (state = s) })));
// Answers the requests made so far; later requests wait for the next settle().
const settle = () => act(() => {
  const answer = hold.resolve;
  hold = Promise.withResolvers();
  answer();
  return new Promise(r => setTimeout(r));
});

// The CMS public pages API, by URL: a PublicPage body (CMS_HMV openapi-spec.json) or an HTTP status.
// Responses wait for settle(), so the loading state can be observed.
let hold;
function mockCms(routes) {
  requests = [];
  hold = Promise.withResolvers();
  globalThis.fetch = vi.fn(async (url, init) => {
    requests.push({ url, init });
    await hold.promise;
    const r = routes[url];
    if (typeof r === 'number' || !r) return Response.json({ statusCode: r ?? 404 }, { status: r ?? 404 });
    return Response.json(r);
  });
}
const publicPage = (locale, content, seo) => ({ key: 'about', locale, title: content.hero.title, seo, content, alternates: [] });

beforeEach(() => {
  root = createRoot(document.createElement('div'));
  mockCms({});
});
afterEach(async () => {
  await act(() => root.unmount());
  vi.unstubAllEnvs();
});

test('static mode serves the bundled copy at once, in each language, with the hero as SEO, without any request', async () => {
  const usePage = await importUsePage({ cms: false });
  for (const lang of ['en', 'vi']) {
    await show(usePage, lang);
    assert.deepEqual(state, {
      status: 'ready',
      page: { content: about[lang], seo: { title: about[lang].hero.title, description: about[lang].hero.lead } },
    });
  }
  assert.equal(globalThis.fetch.mock.calls.length, 0);
});

test('CMS mode loads the page in the visitor language from the public API and serves its content and SEO', async () => {
  const viContent = { ...about.vi, hero: { title: '[CMS] Về HMV', lead: '[CMS] Giới thiệu' } };
  mockCms({ '/api/v1/public/pages/about?locale=vi': publicPage('vi', viContent, { title: 'SEO VI', description: 'Mô tả' }) });
  const usePage = await importUsePage({ cms: true });
  await show(usePage, 'vi');
  assert.deepEqual(state, { status: 'loading' });
  await settle();
  assert.deepEqual(state, { key: 'about|vi', status: 'ready', page: { content: viContent, seo: { title: 'SEO VI', description: 'Mô tả' } } });
  assert.deepEqual(requests.map(r => r.url), ['/api/v1/public/pages/about?locale=vi']);
  assert.equal(requests[0].init.credentials, 'omit');
});

test('CMS mode reloads when the language changes, and never falls back to the bundled copy', async () => {
  mockCms({ '/api/v1/public/pages/about?locale=en': 503 }); // vi not published: 404
  const usePage = await importUsePage({ cms: true });
  await show(usePage, 'en');
  await settle();
  assert.equal(state.status, 'error');
  assert.equal(state.error.status, 503);
  await show(usePage, 'vi');
  assert.deepEqual(state, { status: 'loading' });
  await settle();
  assert.deepEqual(state, { key: 'about|vi', status: 'not-found' });
  assert.equal(requests.length, 2);
});
