// @ts-check
import { test, expect } from '@playwright/test';

// The page-scoped cassava pages' layout, from desktop to phone widths. The test sets each viewport itself, so it runs
// in the desktop project only (*.desktop.spec.js, playwright.next.config.js).
const PAGES = [['/zh-cn/cassava-chips', '向 HMV 提交采购需求'], ['/ko/tapioca-chips', 'HMV에 원료 구매 요구사항 전달']];

test('layout: no horizontal overflow from 1440 to 375 px; the primary call to action is in the first viewport', async ({ page }) => {
  for (const [path, cta] of PAGES) {
    for (const [width, height] of [[1440, 900], [1280, 720], [1024, 768], [768, 1024], [390, 844], [375, 667]]) {
      const where = `${path} ${width}×${height}`;
      await page.setViewportSize({ width, height });
      await page.goto(path);
      const size = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(size[0], where).toBeLessThanOrEqual(size[1]);
      const box = await page.getByRole('button', { name: cta }).first().boundingBox();
      expect(box && box.y >= 0 && box.y + box.height <= height && box.x + box.width <= width, where).toBe(true);
    }
  }
});
