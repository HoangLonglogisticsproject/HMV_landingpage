// @ts-check
import { test, expect } from '@playwright/test';

// The Simplified Chinese cassava page's layout, from desktop to phone widths. The test sets each viewport itself, so
// it runs in the desktop project only (*.desktop.spec.js, playwright.next.config.js).
test('layout: no horizontal overflow from 1440 to 375 px; the primary call to action is in the first viewport', async ({ page }) => {
  for (const [width, height] of [[1440, 900], [1280, 720], [1024, 768], [768, 1024], [390, 844], [375, 667]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/zh-cn/cassava-chips');
    const size = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(size[0], `${width}px`).toBeLessThanOrEqual(size[1]);
    const cta = await page.getByRole('button', { name: '向 HMV 提交采购需求' }).first().boundingBox();
    expect(cta && cta.y >= 0 && cta.y + cta.height <= height && cta.x + cta.width <= width, `${width}×${height}`).toBe(true);
  }
});
