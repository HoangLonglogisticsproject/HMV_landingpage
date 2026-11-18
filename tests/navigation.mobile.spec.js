// @ts-check
import { test, expect } from '@playwright/test';

// ─── Mobile navigation ──────────────────────────────────────────────

test('mobile: hamburger opens the nav drawer and shows links', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // The toggle button has class "mobile-toggle" and aria-label "Open navigation"
  const menuToggle = page.locator('button.mobile-toggle[aria-label*="navigation" i], button.mobile-toggle[aria-label*="điều hướng" i]').first();
  await expect(menuToggle).toBeVisible({ timeout: 5000 });
  // Initially collapsed: aria-expanded="false"
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

  await menuToggle.click();

  // After click: aria-expanded="true", button label changes to "Close navigation"
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

  // The drawer must now expose navigable links
  const navLinks = page.locator('nav.site-nav .nav-links-wrap a[href^="/"]');
  expect(await navLinks.count()).toBeGreaterThanOrEqual(4);
  await expect(navLinks.first()).toBeVisible();
});
