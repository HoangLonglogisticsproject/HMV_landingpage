// @ts-check
import { test, expect } from '@playwright/test';

// The Korean market page's layout from desktop to phone widths: no horizontal overflow, the heading in the first
// viewport, and layout shift under 0.05 while the page loads. The test sets each viewport itself, so it runs in the
// desktop project only (*.desktop.spec.js, playwright.next.config.js).
test('layout from 1440 to 375 px: no overflow, the heading in view, cumulative layout shift under 0.05', async ({ page }) => {
  await page.addInitScript(() => {
    const shifts = (/** @type {any} */ (window).layoutShift = { value: 0 });
    new PerformanceObserver(list => list.getEntries().forEach((/** @type {any} */ e) => {
      if (!e.hadRecentInput) shifts.value += e.value;
    })).observe({ type: 'layout-shift', buffered: true });
  });
  for (const [width, height] of [[1440, 900], [1280, 720], [1024, 768], [768, 1024], [390, 844], [375, 667]]) {
    const where = `${width}×${height}`;
    await page.setViewportSize({ width, height });
    await page.goto('/ko/tapioca-market', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), where).toBe(0);
    const h1 = await page.locator('h1').boundingBox();
    expect(h1 && h1.y >= 0 && h1.y + h1.height <= height, where).toBe(true);
    expect(await page.evaluate(() => /** @type {any} */ (window).layoutShift.value), where).toBeLessThan(0.05);
  }
});
