// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { about } from '../../data/about.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// The content mode (VITE_CMS_CONTENT, .env.cms in `--mode cms`) is read at import: each test imports the page fresh,
// with the language provider from the same module graph, and renders it the way App does. That import takes seconds
// on a loaded machine, past the default 5 s.
vi.setConfig({ testTimeout: 20_000 });
async function renderAbout({ cms, lang }) {
  vi.stubEnv('VITE_CMS_CONTENT', cms ? 'true' : '');
  vi.resetModules();
  const [{ AboutPage }, { LanguageProvider }] = await Promise.all([
    import('./AboutPage.jsx'),
    import('../../i18n/LanguageContext.jsx'),
  ]);
  localStorage.setItem('hmv_lang', lang);
  await act(() =>
    root.render(h(HelmetProvider, null, h(LanguageProvider, null, h(MemoryRouter, { initialEntries: ['/about'] }, h(AboutPage))))),
  );
}

let root, container, requests, hold;
const texts = selector => [...container.querySelectorAll(selector)].map(e => e.textContent);
const head = () => ({
  title: document.title,
  description: document.head.querySelector('meta[name="description"]')?.content,
  canonical: document.head.querySelector('link[rel="canonical"]')?.href,
  robots: document.head.querySelector('meta[name="robots"]')?.content ?? null,
  lang: document.documentElement.lang,
});

// The CMS public pages API, by URL: a PublicPage body (CMS_HMV openapi-spec.json) or an HTTP status.
// Responses wait for settle(), so the loading state can be observed.
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
const settle = () => act(() => (hold.resolve(), new Promise(r => setTimeout(r))));
const publicPage = (locale, content, seo) => ({ key: 'about', locale, title: content.hero.title, seo, content, alternates: [] });

// Every text field of the copy is on the page, and each list renders its items in order, one element per item.
function assertRendersContent(content) {
  const strings = v => (typeof v === 'string' ? [v] : Object.values(v).flatMap(strings));
  for (const s of strings(content)) assert.ok(container.textContent.includes(s), `missing: ${s}`);
  assert.equal(container.querySelector('h1').textContent, content.hero.title);
  assert.equal(container.querySelector('.detail-heading p:not(.eyebrow)').textContent, content.hero.lead);
  assert.equal(container.querySelector('.vm-vision-card h3').textContent, `“${content.vision.quote}”`);
  assert.deepEqual(texts('.market-badge'), content.vision.markets.map(m => m.flag + m.name));
  assert.deepEqual(texts('.vm-highlight-item strong'), content.mission.highlights.map(x => x.title));
  assert.deepEqual(texts('.cv-item h5'), content.values.items.map(x => x.title));
  assert.deepEqual(texts('.leader-name'), content.team.members.map(m => m.name));
  assert.deepEqual(
    [...container.querySelectorAll('.leader-card')].map(card => [...card.querySelectorAll('.specialty-tag')].map(e => e.textContent)),
    content.team.members.map(m => m.specialties),
  );
  const cta = container.querySelector('.team-committed-banner a');
  assert.equal(cta.getAttribute('href'), '/contact');
  assert.equal(cta.textContent, content.team.ctaLabel);
}
const leaderIcons = () =>
  [...container.querySelectorAll('.leader-icon')].map(svg => [...svg.classList].find(c => c.startsWith('lucide-')));
const BUNDLED = /Four Pillars of Value|Dr\. Le Phong Hai|STRATEGIC PURPOSE|ĐỊNH HƯỚNG PHÁT TRIỂN/;

beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  mockCms({});
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.unstubAllEnvs();
});

for (const lang of ['en', 'vi']) {
  test(`static mode renders the bundled ${lang} copy with its SEO, without a CMS request`, async () => {
    await renderAbout({ cms: false, lang });
    assertRendersContent(about[lang]);
    assert.deepEqual(leaderIcons(), ['lucide-shield-check', 'lucide-briefcase', 'lucide-graduation-cap', 'lucide-plane']);
    assert.deepEqual(head(), {
      title: `${about[lang].hero.title} | HMV Global`,
      description: about[lang].hero.lead,
      canonical: 'https://www.hmv-global.com/about',
      robots: null,
      lang,
    });
    assert.equal(globalThis.fetch.mock.calls.length, 0);
  });
}

test('CMS mode shows loading, then the published CMS content, its SEO and its own list lengths', async () => {
  const member = (name, i) => ({ name, role: 'Co-founder', badge: `${i} Years`, bio: `[CMS] Bio ${i}`, specialties: [`[CMS] Skill ${i}`] });
  const cms = {
    hero: { title: '[CMS] About HMV', lead: '[CMS] Lead from the CMS.' },
    purpose: { eyebrow: '[CMS] PURPOSE', title: '[CMS] Purpose', intro: '[CMS] Intro' },
    vision: { label: '[CMS] Vision', quote: '[CMS] Quote', goalTitle: '[CMS] Goal', goalText: '[CMS] Goal text', markets: [{ name: 'Japan', flag: '🇯🇵' }] },
    mission: { label: '[CMS] Mission', title: '[CMS] Mission title', text: '[CMS] Mission text', highlights: [{ title: '[CMS] Highlight', text: '[CMS] Only one' }] },
    values: { title: '[CMS] Three values', items: [1, 2, 3].map(i => ({ title: `[CMS] Value ${i}`, text: `[CMS] Value text ${i}` })) },
    team: {
      eyebrow: '[CMS] TEAM', title: '[CMS] Team', intro: '[CMS] Team intro',
      members: ['[CMS] A', '[CMS] B', '[CMS] C', '[CMS] D', '[CMS] E'].map(member),
      closingTitle: '[CMS] Closing', closingText: '[CMS] Closing text', ctaLabel: '[CMS] Talk to us',
    },
  };
  mockCms({ '/api/v1/public/pages/about?locale=en': publicPage('en', cms, { title: '[CMS] SEO title', description: '[CMS] SEO description' }) });
  await renderAbout({ cms: true, lang: 'en' });

  assert.deepEqual(texts('.cms-status[role="status"]'), ['Loading…']);
  assert.equal(container.querySelector('h1').textContent, 'About HMV'); // the nav label, never bundled page copy
  assert.doesNotMatch(container.textContent, BUNDLED);

  await settle();
  assert.deepEqual(requests.map(r => r.url), ['/api/v1/public/pages/about?locale=en']);
  assertRendersContent(cms);
  assert.equal(container.querySelectorAll('.cms-status').length, 0);
  // Four designed icons by position; members beyond them get the generic one.
  assert.deepEqual(leaderIcons(), ['lucide-shield-check', 'lucide-briefcase', 'lucide-graduation-cap', 'lucide-plane', 'lucide-award']);
  assert.deepEqual(head(), {
    title: '[CMS] SEO title | HMV Global',
    description: '[CMS] SEO description',
    canonical: 'https://www.hmv-global.com/about',
    robots: null,
    lang: 'en',
  });
  assert.doesNotMatch(container.textContent, BUNDLED);
});

test('CMS mode: an API error shows the error alert, keeps the page indexable and never shows the bundled copy', async () => {
  mockCms({ '/api/v1/public/pages/about?locale=en': 503 });
  await renderAbout({ cms: true, lang: 'en' });
  await settle();
  assert.deepEqual(texts('.cms-status[role="alert"]'), ['This page could not be loaded. Please try again later.']);
  assert.equal(head().robots, null); // a temporary failure must not deindex the page
  assert.equal(container.querySelectorAll('.leader-card').length, 0);
  assert.doesNotMatch(container.textContent, BUNDLED);
});

test('CMS mode: a language not published shows not-published with noindex, in that language', async () => {
  mockCms({ '/api/v1/public/pages/about?locale=en': publicPage('en', about.en, null) }); // vi: 404
  await renderAbout({ cms: true, lang: 'vi' });
  await settle();
  assert.deepEqual(requests.map(r => r.url), ['/api/v1/public/pages/about?locale=vi']);
  assert.deepEqual(texts('.cms-status[role="alert"]'), ['Trang này chưa được xuất bản bằng tiếng Việt.']);
  assert.equal(container.querySelector('h1').textContent, 'Về HMV');
  assert.equal(head().robots, 'noindex');
  assert.equal(head().lang, 'vi');
  assert.equal(container.querySelectorAll('.leader-card').length, 0);
  assert.doesNotMatch(container.textContent, BUNDLED);
});
