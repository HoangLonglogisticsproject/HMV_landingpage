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

  // The drawer itself is open and visible (hidden until the toggle opens it).
  const drawer = page.locator('nav.site-nav .nav-links-wrap');
  await expect(drawer).toHaveClass(/\bnav-open\b/);
  await expect(drawer).toBeVisible();

  // Every top-level link is visible in it: the direct links and the link of each dropdown group. Submenu links stay
  // collapsed until their group opens, so they are not required here.
  const topLevelLinks = drawer.locator('.nav-center > a, .nav-center > .nav-dropdown > .nav-group > a');
  await expect(topLevelLinks).toHaveCount(5);
  expect(await topLevelLinks.evaluateAll(links => links.map(a => a.getAttribute('href')))).toEqual(['/', '/supply-chain', '/insights', '/regulations', '/about']);
  for (const link of await topLevelLinks.all()) await expect(link).toBeVisible();
});
