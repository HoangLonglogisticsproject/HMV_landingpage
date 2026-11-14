// @ts-check
import { test, expect } from '@playwright/test';

// The supply evidence's layout on the three cassava pages, from desktop to phone widths: no horizontal overflow, the
// lead photograph beside the others (one column at 700 px and below), and no layout shift while the lazy photographs
// load. The test sets each viewport itself, so it runs in the desktop project only (playwright.next.config.js).
const PAGES = ['/products/dried-cassava-chips', '/vi/san-pham/san-lat-kho', '/zh-cn/cassava-chips'];

test('layout from 1440 to 375 px: no overflow, two columns then one, no shift as the photographs load', async ({ page }) => {
  test.setTimeout(120_000);
  for (const path of PAGES) {
    for (const [width, height] of [[1440, 900], [1280, 720], [1024, 768], [768, 1024], [390, 844], [375, 667]]) {
      const where = `${path} ${width}px`;
      await page.setViewportSize({ width, height });
      await page.goto(path);
      // Layout shifts from here on whose moved elements are in the evidence section.
      await page.evaluate(() => {
        const shifts = (/** @type {any} */ (window).evidenceShifts = []);
        new PerformanceObserver(list => list.getEntries().forEach((/** @type {any} */ e) => {
          if (e.sources?.some(s => s.node?.closest?.('#supply-evidence'))) shifts.push(e.value);
        })).observe({ type: 'layout-shift' });
      });
      const images = page.locator('#supply-evidence img');
      await page.locator('#supply-evidence').scrollIntoViewIfNeeded();
      await expect.poll(() => images.evaluateAll(els => els.every(i => i.complete && i.naturalWidth > 0)), where).toBe(true);
      const boxes = await images.evaluateAll(els => els.map(i => i.getBoundingClientRect().toJSON()));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), where).toBe(0);
      const [lead, ...others] = boxes;
      for (const b of others) expect(b.width / b.height, where).toBeCloseTo(4 / 3, 1);
      if (width > 700) expect(others.every(b => b.left > lead.right), where).toBe(true);
      else expect(boxes.every(b => Math.round(b.left) === Math.round(lead.left)), where).toBe(true);
      await page.waitForTimeout(200);
      expect(await page.evaluate(() => /** @type {any} */ (window).evidenceShifts), where).toEqual([]);
    }
  }
});
