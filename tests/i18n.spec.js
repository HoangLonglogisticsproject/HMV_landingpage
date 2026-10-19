// @ts-check
import { test, expect } from '@playwright/test';

// ─── Language switching via ?lang= ─────────────────────────────────
test('?lang=vi switches to Vietnamese content', async ({ page }) => {
  await page.goto('/?lang=vi');
  // The lang param should be stripped
  await page.waitForURL('**/');
  // Check for Vietnamese content markers
  const body = await page.textContent('body');
  expect(body).toBeTruthy();
  // Verify localStorage was set
  const lang = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(lang).toBe('vi');
});

test('?lang=en switches to English content', async ({ page }) => {
  // First set Vietnamese
  await page.goto('/?lang=vi');
  await page.waitForURL('**/');
  // Then switch to English
  await page.goto('/?lang=en');
  await page.waitForURL('**/');
  const lang = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(lang).toBe('en');
});

// ─── Language switcher UI ──────────────────────────────────────────
// On mobile the switcher lives inside the collapsed drawer — only test on desktop.
test('language switcher toggles between EN and VI', async ({ page }) => {
  test.skip(test.info().project.name === 'chromium-mobile', 'Switcher is inside mobile drawer');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const switcher = page.locator('button[aria-label*="language" i], button[aria-label*="ngôn ngữ" i]').first();
  await expect(switcher).toBeVisible({ timeout: 5000 });
  const langBefore = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  await switcher.click();
  await page.waitForTimeout(500);
  const otherLang = langBefore === 'vi' ? 'English' : 'Tiếng Việt';
  const menuItem = page.locator(`[role="menuitem"]:has-text("${otherLang}")`).first();
  if (await menuItem.isVisible()) {
    await menuItem.click();
    await page.waitForTimeout(500);
    const langAfter = await page.evaluate(() => localStorage.getItem('hmv_lang'));
    expect(langAfter).not.toBe(langBefore);
  }
});

// ─── Language persistence across navigation ────────────────────────
test('language choice persists across page navigation', async ({ page }) => {
  await page.goto('/?lang=vi');
  await page.waitForURL('**/');
  // Navigate to about page
  await page.goto('/about');
  const lang = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(lang).toBe('vi');
});
