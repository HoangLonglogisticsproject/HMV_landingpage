// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Navigation, layout, and browser history tests.
 *
 * Known facts from source:
 *  - Navigation: <nav class="site-nav" aria-label="Main navigation">
 *  - Mobile toggle: <Button class="mobile-toggle"
 *                     aria-label={menu ? 'Close navigation' : t.menu}
 *                     aria-expanded={menu}>
 *    where t.menu = "Open navigation" (en) / "Mở điều hướng" (vi)
 *  - Footer: rendered by <Footer /> inside SiteShell, semantic <footer> element
 *  - Article page: renders its own <SiteShell> (separate from SiteLayout)
 */

// ─── Desktop navigation ─────────────────────────────────────────────

test('desktop: site-nav is visible with key internal links', async ({ page }) => {
  test.skip(test.info().project.name === 'chromium-mobile');
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

// ─── Mobile navigation ──────────────────────────────────────────────

test('mobile: hamburger opens the nav drawer and shows links', async ({ page }) => {
  test.skip(test.info().project.name === 'chromium-desktop');
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // The toggle button has class "mobile-toggle" and aria-label "Open navigation"
  const menuToggle = page.locator('button.mobile-toggle[aria-label*="navigation" i], button.mobile-toggle[aria-label*="điều hướng" i]').first();
  await expect(menuToggle).toBeVisible({ timeout: 5000 });
  // Initially collapsed: aria-expanded="false"
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

  await menuToggle.click();
  await page.waitForTimeout(400); // allow CSS transition

  // After click: aria-expanded="true", button label changes to "Close navigation"
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

  // The drawer must now expose navigable links
  const navLinks = page.locator('nav.site-nav a[href^="/"]');
  const count = await navLinks.count();
  expect(count).toBeGreaterThanOrEqual(4);
});

// ─── Footer ─────────────────────────────────────────────────────────

test('footer is present and contains copyright text', async ({ page }) => {
  await page.goto('/about');
  const footer = page.locator('footer').first();
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  // Footer must contain HMV branding — copy[lang].rights = "HMV Global Co., LTD. All rights reserved."
  await expect(footer).toContainText(/HMV Global/i);
});

// ─── Browser back/forward ─────────────────────────────────────────

test('browser back/forward preserves correct page identity', async ({ page }) => {
  await page.goto('/');
  await page.goto('/about');
  await page.goto('/supply-chain');

  // Back → should land on /about with the about h1
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/, { timeout: 5000 });
  await expect(page.locator('h1').first()).toHaveText(/about hmv|về hmv/i, { timeout: 5000 });

  // Forward → should land on /supply-chain
  await page.goForward();
  await expect(page).toHaveURL(/\/supply-chain$/, { timeout: 5000 });
  await expect(page.locator('h1').first()).toHaveText(/supply chain|chuỗi cung ứng/i, { timeout: 5000 });

  // Back twice → home
  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL('http://localhost:4173/', { timeout: 5000 });
});

// ─── Product navigation ──────────────────────────────────────────────

test('navigating between product pages shows distinct h1 titles', async ({ page }) => {
  // passion-fruit: product[lang] = "Passion fruit" (en)
  await page.goto('/products/passion-fruit');
  const h1PF = page.locator('h1').first();
  await expect(h1PF).toHaveText(/passion fruit|chanh dây/i, { timeout: 6000 });

  // bananas: product[lang] = "Cavendish bananas" (en)
  await page.goto('/products/bananas');
  const h1Ban = page.locator('h1').first();
  await expect(h1Ban).toHaveText(/banana|chuối/i, { timeout: 6000 });

  // The two titles must be different
  const t1 = await page.locator('h1').first().textContent();
  await page.goto('/products/passion-fruit');
  const t2 = await page.locator('h1').first().textContent();
  expect(t1).not.toBe(t2);
});

// ─── Article page ────────────────────────────────────────────────────

test('article page renders h1, article body and a back-to-overview link', async ({ page }) => {
  // Canonical English slug from data/articles.js: 'exporting-passion-fruit-eu'
  // title.en = "Exporting Passion Fruit to Europe: GlobalGAP Standards..."
  await page.goto('/blog/exporting-passion-fruit-eu');
  await page.waitForLoadState('load');

  // h1 must contain the article title
  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible({ timeout: 8000 });
  await expect(h1).toContainText(/exporting passion fruit|xuất khẩu chanh dây/i);

  // The <article> element must be in the DOM with body content
  const article = page.locator('article.article-body');
  await expect(article).toBeVisible();
  // Article must have at least one paragraph
  await expect(article.locator('p').first()).toBeVisible();
});

test('Vietnamese blog slug redirects to English canonical slug', async ({ page }) => {
  // slug.vi = 'xuat-khau-chanh-day-eu' → redirects to slug.en = 'exporting-passion-fruit-eu'
  await page.goto('/blog/xuat-khau-chanh-day-eu');
  await expect(page).toHaveURL(/\/blog\/exporting-passion-fruit-eu$/, { timeout: 8000 });
});

test('unknown blog slug redirects to /insights', async ({ page }) => {
  await page.goto('/blog/this-slug-does-not-exist-12345');
  await expect(page).toHaveURL(/\/insights$/, { timeout: 8000 });
});
