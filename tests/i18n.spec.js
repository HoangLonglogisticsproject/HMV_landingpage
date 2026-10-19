// @ts-check
import { test, expect } from '@playwright/test';

/**
 * i18n tests — language switching via ?lang=, switcher UI, and persistence.
 *
 * Known facts from source:
 *  - CinematicHero H1 (en): "Rooted in the land." + <span>"Connecting the world."</span>
 *  - CinematicHero H1 (vi): "Bám rễ từ đất lành." + <span>"Vươn tầm ra thế giới."</span>
 *  - LanguageSwitcher trigger: aria-label="Select language (current: English)" (en)
 *                           or aria-label="Chọn ngôn ngữ (hiện tại: Tiếng Việt)" (vi)
 *  - Language stored in localStorage key 'hmv_lang'
 *  - ?lang= is stripped from the URL by LangQueryBootstrap after being applied
 */

// ─── ?lang= query bootstrap ─────────────────────────────────────────

test('?lang=vi sets Vietnamese and strips the query param', async ({ page }) => {
  await page.goto('/?lang=vi');
  // LangQueryBootstrap strips the param and calls replace() — URL becomes '/'
  await expect(page).toHaveURL('http://localhost:4173/', { timeout: 5000 });
  // localStorage must record the selected language
  const lang = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(lang).toBe('vi');
  // Verify Vietnamese H1 is rendered — CinematicHero VI text contains "Bám rễ"
  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible({ timeout: 5000 });
  await expect(h1).toContainText('Bám rễ', { timeout: 5000 });
});

test('?lang=en sets English and strips the query param', async ({ page }) => {
  // First establish Vietnamese so switching is meaningful
  await page.goto('/?lang=vi');
  await expect(page).toHaveURL('http://localhost:4173/', { timeout: 5000 });
  await page.goto('/?lang=en');
  await expect(page).toHaveURL('http://localhost:4173/', { timeout: 5000 });
  const lang = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(lang).toBe('en');
  // Verify English H1 is rendered — CinematicHero EN text contains "Rooted in the land"
  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible({ timeout: 5000 });
  await expect(h1).toContainText('Rooted in the land', { timeout: 5000 });
});

// ─── Language switcher UI (desktop only) ────────────────────────────
// On mobile the switcher is inside the collapsed drawer.

test('language switcher changes the active locale', async ({ page }) => {
  test.skip(test.info().project.name === 'chromium-mobile', 'Switcher hidden inside drawer on mobile');

  // Start in English
  await page.goto('/?lang=en');
  await expect(page).toHaveURL('http://localhost:4173/', { timeout: 5000 });

  // LanguageSwitcher trigger: class="hmv-lang-trigger"
  // aria-label="Select language (current: English)" when lang=en
  const trigger = page.locator('button.hmv-lang-trigger').first();
  await expect(trigger).toBeVisible({ timeout: 5000 });

  // Clicking opens the Radix DropdownMenu
  await trigger.click();

  // The "Tiếng Việt" menu item must be visible in the dropdown
  const viItem = page.locator('[role="menuitem"]:has-text("Tiếng Việt")').first();
  await expect(viItem).toBeVisible({ timeout: 3000 });
  await viItem.click();

  // After selection, localStorage must be updated to 'vi'
  await page.waitForTimeout(300);
  const langAfter = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(langAfter).toBe('vi');

  // H1 must now contain Vietnamese text (Bám rễ)
  const h1 = page.locator('h1').first();
  await expect(h1).toContainText('Bám rễ', { timeout: 3000 });
});

// ─── Language persistence across navigation ─────────────────────────

test('language choice persists when navigating between pages', async ({ page }) => {
  await page.goto('/?lang=vi');
  await expect(page).toHaveURL('http://localhost:4173/', { timeout: 5000 });

  // Navigate to a detail page
  await page.goto('/about');
  const lang = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(lang).toBe('vi');

  // Navigate to another page — still Vietnamese
  await page.goto('/supply-chain');
  const lang2 = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(lang2).toBe('vi');
});
