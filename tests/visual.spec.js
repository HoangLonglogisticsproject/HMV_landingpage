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
 * Each test asserts:
 *  1. Zero uncaught JS errors (pageerror events) — indicate runtime crashes.
 *  2. Zero browser console errors — after filtering known-harmless messages.
 *  3. main#main-content is visible — page is not blank.
 *  4. H1 text matches expected content — correct page loaded.
 *  5. Screenshot saved to tests/screenshots/ for manual review only.
 *
 * This is explicitly NOT a pixel-identical regression suite.
 * To add visual regression, use Playwright's built-in snapshot API
 * (`toHaveScreenshot()`) with committed baselines on a specific OS/browser.
 *
 * Known-harmless console messages that are filtered before asserting:
 *  - Favicon 404s (browser default behavior, not app code)
 *  - React DevTools suggestion (development mode only, suppressed in prod build)
 *  - Third-party analytics or CDN messages (none currently used)
 */

/**
 * Returns true if the console error message is a known-harmless browser
 * message that is not caused by HMV application code.
 * @param {string} text
 */
function isHarmlessConsoleError(text) {
  // Favicon 404: browsers auto-request /favicon.ico; vite preview serves it correctly
  // but this pattern is kept as a safety net for any host that doesn't.
  if (text.includes('favicon.ico')) return true;
  // React DevTools suggestion is only emitted in development builds, never in prod.
  // Kept here as explicit documentation of known-filtered messages.
  if (text.includes('Download the React DevTools')) return true;
  return false;
}

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
    await page.waitForLoadState('load');
    // Allow animations and lazy-loaded images to settle
    await page.waitForTimeout(800);

    // 1. Verify the page is not blank — main content container must exist
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible({ timeout: 5000 });

    // 2. Verify expected H1 content — confirms the correct page loaded
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible({ timeout: 5000 });
    await expect(h1).toHaveText(pg.expectH1, { timeout: 3000 });

    // 3. Zero uncaught JS errors — these would indicate runtime crashes
    expect(
      jsErrors,
      `${pg.path} threw uncaught JS errors:\n${jsErrors.join('\n')}`
    ).toHaveLength(0);

    // 4. Zero browser console errors (after filtering known-harmless messages)
    //    Browser-level console.error() calls indicate React warnings, missing
    //    resources, or failed fetches that production code should not emit.
    const appConsoleErrors = consoleErrors.filter(
      (msg) => !isHarmlessConsoleError(msg)
    );
    expect(
      appConsoleErrors,
      `${pg.path} emitted console errors:\n${appConsoleErrors.join('\n')}`
    ).toHaveLength(0);

    // 5. Take screenshot for manual review (NOT a pixel-diff assertion)
    const screenshotPath = path.join(
      screenshotDir,
      `${pg.name}-${test.info().project.name}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });
}

