// @ts-check
/**
 * About page in CMS mode (dist-cms bundle, port 4174). The CMS public pages API is mocked per test with payloads
 * shaped like CMS_HMV docs/api/openapi-spec.json (PublicPage). Unmatched API calls answer 404 like the CMS.
 */
import { test, expect } from '@playwright/test';
import { about } from '../src/data/about.js';

test.use({ baseURL: 'http://localhost:4174' });

const API = '/api/v1/public/pages/about';
// CMS content deliberately different from the bundled copy: fewer items, other text.
const cms = {
  ...about.en,
  hero: { title: '[CMS] About HMV', lead: '[CMS] Lead from the CMS.' },
  purpose: { eyebrow: '[CMS] PURPOSE', title: '[CMS] Purpose title', intro: '[CMS] Purpose intro' },
  vision: { ...about.en.vision, quote: '[CMS] Vision quote', markets: [{ name: 'Japan', flag: '🇯🇵' }] },
  mission: { ...about.en.mission, highlights: [{ title: '[CMS] Highlight', text: 'Only one' }] },
  values: { title: '[CMS] Three values', items: about.en.values.items.slice(0, 3) },
  team: { ...about.en.team, members: [{ name: '[CMS] Person', role: 'Founder', badge: '5 Years', bio: 'Bio', specialties: ['Trade'] }], ctaLabel: '[CMS] Talk to us' },
};
const page = (locale, content, seo = { title: `${content.hero.title} SEO`, description: 'CMS SEO description' }) => ({
  key: 'about', locale, title: content.hero.title, seo, content,
  publishedAt: '2026-10-20T08:00:00.000Z', updatedAt: '2026-10-20T08:00:00.000Z', alternates: [],
});
const BUNDLED = /Four Pillars of Value|Dr\. Le Phong Hai|STRATEGIC PURPOSE/;

async function mockCms(pw, routes, { delay = 0 } = {}) {
  const requests = [];
  await pw.route('**/api/v1/public/**', async route => {
    const url = new URL(route.request().url());
    const key = url.pathname + url.search;
    requests.push({ key, headers: await route.request().allHeaders() });
    if (delay) await new Promise(r => setTimeout(r, delay));
    const r = routes[key];
    if (typeof r === 'number') return route.fulfill({ status: r, json: { statusCode: r, code: 'INTERNAL_ERROR', message: 'Unavailable' } });
    if (r) return route.fulfill({ json: r });
    return route.fulfill({ status: 404, json: { statusCode: 404, code: 'PAGE_NOT_FOUND', message: 'Page not found' } });
  });
  return requests;
}

test('renders the published CMS content with the existing layout', async ({ page: pw }) => {
  await mockCms(pw, { [`${API}?locale=en`]: page('en', cms) });
  await pw.goto('/about');
  await expect(pw.locator('h1').first()).toHaveText('[CMS] About HMV');
  await expect(pw.locator('.detail-heading p:not(.eyebrow)')).toHaveText('[CMS] Lead from the CMS.');
  await expect(pw).toHaveTitle('[CMS] About HMV SEO | HMV Global');
  await expect(pw.locator('meta[name="description"]')).toHaveAttribute('content', 'CMS SEO description');
  await expect(pw.locator('.vm-vision-card h3')).toHaveText('“[CMS] Vision quote”');
  await expect(pw.locator('.market-badge')).toHaveText(['🇯🇵Japan']);
  await expect(pw.locator('.vm-highlight-item')).toHaveCount(1);
  await expect(pw.locator('.cv-header h4')).toHaveText('[CMS] Three values');
  await expect(pw.locator('.cv-item')).toHaveCount(3);
  await expect(pw.locator('.leader-card .leader-name')).toHaveText(['[CMS] Person']);
  await expect(pw.locator('.leader-card .leader-icon')).toHaveCount(1);
  await expect(pw.locator('.team-committed-banner a[href="/contact"]')).toContainText('[CMS] Talk to us');
  await expect(pw.locator('main')).not.toContainText(BUNDLED);
  await expect(pw.locator('meta[name="robots"]')).toHaveCount(0);
});

test('switching language loads that locale from the CMS', async ({ page: pw }) => {
  const vi = { ...cms, hero: { title: '[CMS] Về HMV', lead: '[CMS] Giới thiệu.' } };
  await mockCms(pw, { [`${API}?locale=en`]: page('en', cms), [`${API}?locale=vi`]: page('vi', vi) });
  await pw.goto('/about?lang=vi');
  await expect(pw.locator('h1').first()).toHaveText('[CMS] Về HMV');
  await expect(pw.locator('html')).toHaveAttribute('lang', 'vi');
});

test('loading state while the CMS responds', async ({ page: pw }) => {
  await mockCms(pw, { [`${API}?locale=en`]: page('en', cms) }, { delay: 1500 });
  await pw.goto('/about');
  await expect(pw.locator('.cms-status[role="status"]')).toHaveText('Loading…');
  await expect(pw.locator('h1').first()).toHaveText('[CMS] About HMV', { timeout: 10_000 });
});

test('API errors show an error state, never the bundled copy', async ({ page: pw }) => {
  await mockCms(pw, { [`${API}?locale=en`]: 503 });
  await pw.goto('/about');
  await expect(pw.locator('.cms-status[role="alert"]')).toHaveText('This page could not be loaded. Please try again later.');
  await expect(pw.locator('main')).not.toContainText(BUNDLED);
  await expect(pw.locator('meta[name="robots"]')).toHaveCount(0); // a temporary failure must not deindex the page
});

test('a locale that is not published shows not-published with noindex, not the other language', async ({ page: pw }) => {
  await mockCms(pw, { [`${API}?locale=vi`]: page('vi', cms) });
  await pw.goto('/about');
  await expect(pw.locator('.cms-status[role="alert"]')).toHaveText('This page has not been published in English yet.');
  await expect(pw.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(pw.locator('main')).not.toContainText('[CMS]');
  await expect(pw.locator('main')).not.toContainText(BUNDLED);
});

test('page requests are public-only and carry no admin cookie or CSRF token', async ({ page: pw, context }) => {
  await context.addCookies([{ name: 'hmv_session', value: 'admin-session-must-not-leak', domain: 'localhost', path: '/' }]);
  const requests = await mockCms(pw, { [`${API}?locale=en`]: page('en', cms) });
  await pw.goto('/about');
  await expect(pw.locator('h1').first()).toHaveText('[CMS] About HMV');
  expect(requests.map(r => r.key)).toContain(`${API}?locale=en`);
  for (const { key, headers } of requests) {
    expect(key.startsWith('/api/v1/public/')).toBe(true);
    expect(headers.cookie).toBeUndefined();
    expect(headers['x-csrf-token']).toBeUndefined();
  }
});
