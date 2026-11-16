// @ts-check
import { test, expect } from '@playwright/test';

// The page-scoped cassava pages' language menu on a phone. Collected only by the chromium-mobile project
// (playwright.next.config.js), so it never needs a run-time skip.

test('phone: the compact language menu opens inside the viewport and its links switch the page', async ({ page }) => {
  await page.goto('/zh-cn/cassava-chips');
  const viewport = page.viewportSize();
  const trigger = page.getByRole('button', { name: '选择语言，当前：简体中文' });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const menu = await page.getByRole('menu').boundingBox();
  expect(menu && viewport && menu.x >= 0 && menu.x + menu.width <= viewport.width).toBe(true);
  await expect(page.getByRole('menuitem')).toHaveText(['English', 'Tiếng Việt', '简体中文', '한국어']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  await page.getByRole('menuitem', { name: '한국어' }).click();
  await expect(page).toHaveURL(/\/ko\/tapioca-chips$/);
  await expect(page.getByRole('button', { name: '언어 선택, 현재: 한국어' })).toBeVisible();
});
