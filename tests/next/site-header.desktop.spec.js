// @ts-check
import { test, expect } from '@playwright/test';

// The site header from desktop to phone widths. Its full row (logo, links, language menu, HMV Trade Desk) is up to
// 979 px wide, so at 1040 px and below the links and actions are in the drawer, with room for a classic scrollbar;
// between 821 and 1010 px the row used to overflow every English and Vietnamese page, by up to 167 px. The page-scoped
// header has no drawer and keeps its own row. The tests set each viewport themselves, so they run in the desktop
// project only (*.desktop.spec.js, playwright.next.config.js).
const PAGES = ['/', '/vi', '/products/dried-cassava-chips', '/vi/san-pham/san-lat-kho', '/products/passion-fruit', '/vi/san-pham/chanh-day'];
const DRAWER_MAX = 1040;
const WIDTHS = [821, 850, 900, 950, 1024, 1025, 1027, 1030, 1040, 1041, 375, 390, 768, 1280, 1440];

const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const path of PAGES) {
  test(`${path}: no horizontal overflow from 375 to 1440 px; the drawer up to ${DRAWER_MAX} px, the full row above`, async ({ page }) => {
    test.setTimeout(120_000);
    const toggle = page.locator('.site-nav .mobile-toggle');
    const desk = page.locator('.site-nav .nav-support-btn');
    for (const width of WIDTHS) {
      const where = `${path} ${width}px`;
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      expect(await overflow(page), where).toBeLessThanOrEqual(0);
      const drawer = width <= DRAWER_MAX;
      await expect(toggle, where).toBeVisible({ visible: drawer });
      // A click before hydration does nothing: retry.
      if (drawer) await expect(async () => {
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true', { timeout: 2_000 });
      }, where).toPass({ timeout: 15_000 });
      await expect(desk, where).toBeInViewport({ ratio: 1 });
    }
  });
}

test('the page-scoped header keeps its row, section links shown, where the site header has its drawer', async ({ page }) => {
  for (const path of ['/zh-cn/cassava-chips', '/ko/tapioca-chips', '/ko/tapioca-market']) {
    for (const width of [1025, 1030, 1040, 1041]) {
      const where = `${path} ${width}px`;
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      expect(await overflow(page), where).toBeLessThanOrEqual(0);
      // One line of section links, not the drawer's column.
      const tops = await page.locator('.site-nav .nav-center > a').evaluateAll(els => els.map(el => Math.round(el.getBoundingClientRect().top)));
      expect(tops.length > 1 && new Set(tops).size === 1, where).toBe(true);
      await expect(page.locator('.site-nav .nav-support-btn'), where).toBeInViewport({ ratio: 1 });
    }
  }
});
