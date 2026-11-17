// @ts-check
import { test, expect } from '@playwright/test';

// ─── Desktop navigation ─────────────────────────────────────────────

test('desktop: site-nav is visible with key internal links', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const nav = page.locator('nav.site-nav');
  await expect(nav).toBeVisible({ timeout: 5000 });

  // Must contain the HMV home link
  const homeLink = nav.locator('a[href="/"], a[aria-label="HMV Global home"]').first();
  await expect(homeLink).toBeVisible();

  // Navigation must contain internal links to key sections
  const internalLinks = nav.locator('a[href^="/"]');
  const count = await internalLinks.count();
  expect(count).toBeGreaterThanOrEqual(4); // home, supply-chain, trade-solutions, contact minimum
});
