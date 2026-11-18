// @ts-check
// CMS articles through the desktop header; the CMS mode and its mock as in tests/cms-articles.spec.js.
import { test, expect } from '@playwright/test';
import { mockCms } from './cms-articles.mock.js';

test.use({ baseURL: 'http://localhost:4174' });

test('switching language on an article follows its alternate slug', async ({ page }) => {
  await mockCms(page);
  await page.goto('/blog/test-econews-integration');
  await expect(page.locator('h1').first()).toHaveText('[TEST] EcoNews integration');
  await page.locator('button.hmv-lang-trigger').first().click();
  await page.locator('[role="menuitem"]:has-text("Tiếng Việt")').first().click();
  await expect(page).toHaveURL(/\/blog\/test-econews-tich-hop$/);
  await expect(page.locator('h1').first()).toHaveText('[TEST] Tích hợp EcoNews');
});
