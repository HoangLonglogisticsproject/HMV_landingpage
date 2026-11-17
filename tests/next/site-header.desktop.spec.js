// @ts-check
import { test, expect } from '@playwright/test';

// The site header from desktop to phone widths. Its full row (logo, links, language menu, HMV Trade Desk) needs about
// 1010 px, so at 1024 px and below the links and actions are in the drawer; between 821 and 1024 px the row used to
// overflow every English and Vietnamese page by up to 166 px. Two product pages in both languages. The test sets each
// viewport itself, so it runs in the desktop project only (*.desktop.spec.js, playwright.next.config.js).
const PAGES = ['/products/dried-cassava-chips', '/vi/san-pham/san-lat-kho', '/products/passion-fruit', '/vi/san-pham/chanh-day'];
const WIDTHS = [821, 850, 900, 950, 1024, 375, 390, 768, 1280, 1440];

test('layout from 1440 to 375 px: no horizontal overflow; the HMV Trade Desk in the row, in the drawer from 1024 px', async ({ page }) => {
  test.setTimeout(180_000);
  const desk = page.locator('.site-nav .nav-support-btn');
  for (const path of PAGES) {
    for (const width of WIDTHS) {
      const where = `${path} ${width}px`;
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const size = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(size[0], where).toBeLessThanOrEqual(size[1]);
      if (width <= 1024) await page.locator('.site-nav .mobile-toggle').click();
      await expect(desk, where).toBeInViewport({ ratio: 1 });
    }
  }
});
