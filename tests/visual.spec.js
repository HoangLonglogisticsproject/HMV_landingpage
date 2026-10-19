// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Visual smoke screenshots.
 *
 * PURPOSE: Manual inspection, not automated pixel-diff regression.
 * Screenshots are saved to tests/screenshots/ (gitignored — never committed).
 *
 * Each test also:
 *  - Asserts zero uncaught JS errors during load.
 *  - Asserts the main content area is visible (page is not blank).
 *  - Records console errors for debugging.
 *
 * This is explicitly NOT a pixel-identical regression suite.
 * To add visual regression, use Playwright's built-in snapshot API
 * (`toHaveScreenshot()`) with committed baselines on a specific OS/browser.
 */

const VISUAL_PAGES = [
  // CinematicHero: <h1>Rooted in the land.<span>Connecting the world.</span></h1>
  { name: 'home',                path: '/',                        expectH1: /rooted in the land|connecting the world|bám rễ|vươn tầm/i },
  { name: 'about',               path: '/about',                   expectH1: /about hmv|về hmv/i },
  { name: 'supply-chain',        path: '/supply-chain',            expectH1: /supply chain|chuỗi cung ứng/i },
  { name: 'trade-solutions',     path: '/trade-solutions',         expectH1: /trade solutions|giải pháp/i },
  { name: 'contact',             path: '/contact',                 expectH1: /partner with us|kết nối/i },
  { name: 'product-passion-fruit', path: '/products/passion-fruit', expectH1: /passion fruit|chanh dây/i },
  { name: 'insights',            path: '/insights',                expectH1: /econews/i },
  { name: 'logistics',           path: '/logistics',               expectH1: /logistic/i },
];

// Ensure screenshots directory exists
const screenshotDir = path.join(import.meta.dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

for (const pg of VISUAL_PAGES) {
  test(`smoke: ${pg.name} page loads without JS errors`, async ({ page }) => {
    const jsErrors = [];
    const consoleErrors = [];

    page.on('pageerror', (err) => jsErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(pg.path);
    await page.waitForLoadState('networkidle');
    // Allow animations and lazy-loaded images to settle
    await page.waitForTimeout(800);

    // 1. Verify the page is not blank — main content container must exist
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible({ timeout: 5000 });

    // 2. Verify expected H1 content
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible({ timeout: 5000 });
    await expect(h1).toHaveText(pg.expectH1, { timeout: 3000 });

    // 3. Zero uncaught JS errors — these would indicate runtime crashes
    expect(
      jsErrors,
      `${pg.path} threw uncaught JS errors:\n${jsErrors.join('\n')}`
    ).toHaveLength(0);

    // 4. Take screenshot for manual review (NOT a pixel-diff assertion)
    const screenshotPath = path.join(
      screenshotDir,
      `${pg.name}-${test.info().project.name}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });
}
