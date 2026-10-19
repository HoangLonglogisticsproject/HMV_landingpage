// @ts-check
import { test, expect } from '@playwright/test';

// ─── Navigation chrome ────────────────────────────────────────────
test('desktop: header navigation is visible with key links', async ({ page }) => {
  test.skip(test.info().project.name === 'chromium-mobile');
  await page.goto('/');
  const nav = page.locator('nav').first();
  await expect(nav).toBeVisible({ timeout: 5000 });
  // Check at least one internal link
  const links = nav.locator('a[href]');
  expect(await links.count()).toBeGreaterThan(0);
});

test('mobile: hamburger menu opens and shows navigation', async ({ page }) => {
  test.skip(test.info().project.name === 'chromium-desktop');
  await page.goto('/');
  // Look for a hamburger/menu button
  const menuBtn = page.locator('button[aria-label*="menu" i], button[class*="hamburger" i], button[class*="mobile" i], .mobile-menu-toggle, nav button').first();
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await page.waitForTimeout(500);
    // After opening, navigation links should be visible
    const navLinks = page.locator('nav a[href], [class*="mobile-nav"] a[href], [class*="nav-menu"] a[href]');
    expect(await navLinks.count()).toBeGreaterThan(0);
  }
});

// ─── Footer ───────────────────────────────────────────────────────
test('footer is visible at the bottom of the page', async ({ page }) => {
  await page.goto('/about');
  const footer = page.locator('footer').first();
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
});

// ─── Browser back/forward ──────────────────────────────────────────
test('browser back/forward works between pages', async ({ page }) => {
  await page.goto('/');
  await page.goto('/about');
  await page.goto('/supply-chain');
  // Go back
  await page.goBack();
  await page.waitForURL('**/about');
  expect(page.url()).toContain('/about');
  // Go forward
  await page.goForward();
  await page.waitForURL('**/supply-chain');
  expect(page.url()).toContain('/supply-chain');
  // Go back twice to home
  await page.goBack();
  await page.goBack();
  await page.waitForURL('**/');
});

// ─── Product navigation ───────────────────────────────────────────
test('navigating between product pages preserves layout', async ({ page }) => {
  await page.goto('/products/passion-fruit');
  const h1Before = await page.locator('h1').first().textContent();
  expect(h1Before).toBeTruthy();
  await page.goto('/products/bananas');
  const h1After = await page.locator('h1').first().textContent();
  expect(h1After).toBeTruthy();
  expect(h1After).not.toBe(h1Before);
});

// ─── Article navigation ───────────────────────────────────────────
test('article page loads and has article content', async ({ page }) => {
  await page.goto('/blog/exporting-passion-fruit-eu');
  const article = page.locator('article, [class*="article"], main').first();
  await expect(article).toBeVisible({ timeout: 8000 });
});
