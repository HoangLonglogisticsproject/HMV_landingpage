// @ts-check
import { test, expect } from '@playwright/test';
import { head } from '../next/html.js';
import { MOCK_PORT } from './env.js';

/**
 * Stale-on-error, run by playwright.next-cms-stale.config.js: the CMS-mode server with a 2 s revalidation interval
 * (production: 300 s) and SITE_INDEXABLE=true, so a page that turned noindex would show. Once a page's interval has
 * passed and the CMS starts failing, every request must keep getting the last good page.
 */
const MOCK = `http://localhost:${MOCK_PORT}/__mock`;
const INTERVAL_MS = 2_000;
const PAGES = {
  '/about': '[CMS] About HMV', '/vi/insights': '[CMS] Cập nhật thương mại', '/blog/cms-trade-update': '[CMS] Trade update',
  '/sitemap.xml': 'https://www.hmv-global.com/blog/cms-trade-update',
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

test('after the interval, a failing CMS leaves the last good page and sitemap in place: 200, same content, indexable', async ({ request }) => {
  await request.post(`${MOCK}/reset`);
  // 1. Good content, rendered and cached.
  for (const [url, text] of Object.entries(PAGES)) {
    await request.get(url);
    expect(await (await request.get(url)).text(), url).toContain(text);
  }
  // 2–3. The interval passes, then every CMS request fails with 500.
  await pause(INTERVAL_MS + 1_000);
  await request.post(`${MOCK}/fail?status=500`);
  await request.post(`${MOCK}/reset-requests`);
  // 4–5. The first request triggers a regeneration, which fails; that one and the next keep the last good page.
  for (const [url, text] of Object.entries(PAGES)) {
    for (const attempt of ['stale', 'after the failed regeneration']) {
      const res = await request.get(url, { maxRedirects: 0 });
      expect(res.status(), `${url}, ${attempt}`).toBe(200);
      const html = await res.text();
      expect(html, `${url}, ${attempt}`).toContain(text);
      expect(head(html).robots, `${url}, ${attempt}`).toBeUndefined();
      expect(res.headers()['x-robots-tag'], `${url}, ${attempt}`).toBeUndefined();
      await pause(500);
    }
  }
  // The regenerations did reach the failing CMS.
  expect((await (await request.get(`${MOCK}/requests`)).json()).length).toBeGreaterThan(0);
  await request.post(`${MOCK}/fail?status=0`);
});
