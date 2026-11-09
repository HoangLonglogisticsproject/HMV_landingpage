// @ts-check
import { test, expect } from '@playwright/test';
import { articles } from '../../src/data/articles.js';
import { LOCALES, PAGES, localizePath } from '../../src/i18n/routes.js';

/**
 * D-14 visual baselines: screenshots of the Next.js build, taken before the image and font work of PR-08 and compared
 * on every CI run (playwright.next-visual.config.js). Every page, plus one product and one article:
 * - the full page in both languages (Vietnamese text exercises the fonts' coverage), images masked: layout, image boxes
 *   and text, at a fraction of the size of photographs;
 * - the first viewport in English with its images, the hero (LCP) image included.
 * Stabilized, not masked: reduced motion (the site's CSS then stops every animation and transition, and the activities
 * carousel does not autoplay), every image loaded and decoded, every declared web font face loaded.
 */
const KEYS = [...PAGES, '/products/passion-fruit', `/blog/${articles[0].slug.en}`];

for (const lang of LOCALES) {
  for (const key of KEYS) {
    test(`${lang} ${key}`, async ({ page }) => {
      await page.goto(localizePath(key, lang));
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = 'eager';
        await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
        // Every declared face, not only those already requested: a <select>'s text can request its face late, and
        // `fonts.ready` alone then races the network (seen on CI on /contact).
        await Promise.all([...document.fonts].map(face => face.load().catch(() => {})));
        await document.fonts.ready;
      });
      const name = `${lang}-${key.slice(1).replaceAll('/', '-') || 'home'}`;
      if (lang === 'en') await expect(page, 'first viewport').toHaveScreenshot(`${name}-viewport.png`);
      await expect(page, 'full page').toHaveScreenshot(`${name}.png`, { fullPage: true, mask: [page.locator('img')] });
    });
  }
}
