// @ts-check
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { articles } from '../../src/data/articles.js';
import { LOCALES, PAGES, localizePath } from '../../src/i18n/routes.js';

/**
 * D-14 visual baselines: screenshots of the Next.js build, taken before the image and font work of PR-08 and compared
 * on every CI run (playwright.next-visual.config.js). Every page, plus the two buyer product pages and one article:
 * - the full page in both languages (Vietnamese text exercises the fonts' coverage), images masked: layout, image boxes
 *   and text, at a fraction of the size of photographs;
 * - the first viewport in English with its images, the hero (LCP) image included.
 * Stabilized, not masked: reduced motion (the site's CSS then stops every animation and transition, and the activities
 * carousel does not autoplay), every image loaded and decoded, every declared web font face loaded.
 * Google Fonts serves different builds of the same font by user agent, region and day (CI got a different Poppins build
 * than the image that rendered the baselines), so the pages get the CSS and font files in fonts/, captured in that
 * image. Plus Jakarta Sans and Poppins are under the SIL Open Font License. Once the site self-hosts its fonts (D-20),
 * these routes match nothing and fonts/ can go.
 */
const KEYS = [...PAGES, '/products/passion-fruit', '/products/dried-cassava-chips', `/blog/${articles[0].slug.en}`];
const FONTS = path.join(import.meta.dirname, 'fonts');

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/fonts\.googleapis\.com\/css2\?/, route =>
    route.fulfill({ path: path.join(FONTS, 'css2.css'), contentType: 'text/css; charset=utf-8' }));
  await page.route(/^https:\/\/fonts\.gstatic\.com\//, route =>
    route.fulfill({
      path: path.join(FONTS, new URL(route.request().url()).pathname),
      contentType: 'font/woff2',
      headers: { 'access-control-allow-origin': '*' },
    }));
});

for (const lang of LOCALES) {
  for (const key of KEYS) {
    test(`${lang} ${key}`, async ({ page }) => {
      await page.goto(localizePath(key, lang));
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = 'eager';
        await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
        // Every declared face, not only those already requested: `fonts.ready` does not wait for a face that text
        // requests later.
        await Promise.all([...document.fonts].map(face => face.load().catch(() => {})));
        await document.fonts.ready;
      });
      const name = `${lang}-${key.slice(1).replaceAll('/', '-') || 'home'}`;
      if (lang === 'en') await expect(page, 'first viewport').toHaveScreenshot(`${name}-viewport.png`);
      await expect(page, 'full page').toHaveScreenshot(`${name}.png`, { fullPage: true, mask: [page.locator('img')] });
    });
  }
}
