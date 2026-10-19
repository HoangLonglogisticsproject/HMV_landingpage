// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Route identity tests.
 * Each test verifies:
 *  1. The page title is not a 404.
 *  2. A visible <h1> whose text matches an expected substring (EN default).
 *  3. The URL has not unexpectedly changed (no redirect loop).
 *
 * Selectors are derived from the actual JSX source — DetailLayout renders
 * <h1> from the `title` prop; ProductDetailPage uses product[lang]; etc.
 */

const ROUTES = [
  // CinematicHero: <h1>Rooted in the land.<span>Connecting the world.</span></h1>
  { path: '/', titleFrag: 'Agricultural Supply Chain', h1Text: /rooted in the land|connecting the world|bám rễ|vươn tầm/i },
  { path: '/about', titleFrag: 'About', h1Text: /about hmv|về hmv/i },
  { path: '/supply-chain', titleFrag: 'Supply', h1Text: /supply chain|chuỗi cung ứng/i },
  { path: '/trade-solutions', titleFrag: 'Trade', h1Text: /trade solutions|giải pháp thương mại/i },
  { path: '/activities', titleFrag: 'Activities', h1Text: /activities|hoạt động/i },
  { path: '/contact', titleFrag: 'Contact', h1Text: /partner with us|kết nối hợp tác/i },
  // InsightsPage uses title='EcoNews' in DetailLayout
  { path: '/insights', titleFrag: 'Insights', h1Text: /econews/i },
  { path: '/regulations', titleFrag: 'Regulations', h1Text: /regulations|quy định/i },
  { path: '/logistics', titleFrag: 'Logistics', h1Text: /logistics/i },
  { path: '/packaging-logistics', titleFrag: 'Packaging', h1Text: /packaging|đóng gói/i },
  // ProductDetailPage: title = product[lang] from data/hmv.js
  { path: '/products/passion-fruit', titleFrag: 'Passion fruit', h1Text: /passion fruit|chanh dây/i },
  { path: '/products/bananas', titleFrag: 'banana', h1Text: /banana|chuối/i },
  // ArticlePage: title = a.title[lang] from data/articles.js — "Exporting Passion Fruit..."
  { path: '/blog/exporting-passion-fruit-eu', titleFrag: 'Passion Fruit', h1Text: /passion fruit|chanh dây/i },
];

for (const route of ROUTES) {
  test(`route ${route.path} — page identity`, async ({ page }) => {
    await page.goto(route.path);

    // 1. Page title must not be a 404/error page
    await expect(page).not.toHaveTitle(/404|not found|error/i, { timeout: 8000 });

    // 2. URL must not have been redirected away from the expected path
    expect(page.url()).toContain(route.path.split('#')[0]);

    // 3. H1 must be visible with expected content
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible({ timeout: 8000 });
    await expect(h1).toHaveText(route.h1Text, { timeout: 5000 });
  });
}

// ─── Deep links ────────────────────────────────────────────────────

test('deep link /#initiate-trade reaches the RFQ section', async ({ page }) => {
  await page.goto('/#initiate-trade');
  // The section has id="initiate-trade" and aria-labelledby="rfq-title"
  const rfqSection = page.locator('section#initiate-trade');
  await expect(rfqSection).toBeVisible({ timeout: 8000 });
  // The RFQ form must be present inside it
  const rfqForm = rfqSection.locator('form.rfq-form');
  await expect(rfqForm).toBeVisible();
  // The section must contain the RFQ heading
  const rfqHeading = rfqSection.locator('h2#rfq-title');
  await expect(rfqHeading).toBeVisible();
  await expect(rfqHeading).toContainText(/initiate trade|bắt đầu giao thương/i);
});

test('deep link /supply-chain#commodities scrolls to commodities section', async ({ page }) => {
  await page.goto('/supply-chain#commodities');
  // Wait for React Router to handle the hash scroll
  await page.waitForTimeout(800);
  const section = page.locator('#commodities');
  await expect(section).toBeAttached({ timeout: 6000 });
  // Verify the supply-chain page loaded (h1 is present)
  await expect(page.locator('h1').first()).toBeVisible();
});

// ─── 404 page ──────────────────────────────────────────────────────

test('unknown route renders NotFoundPage with "Page not found" h1', async ({ page }) => {
  await page.goto('/this-page-does-not-exist-xyz');
  // NotFoundPage renders a plain <h1>Page not found</h1> (no site chrome)
  const h1 = page.locator('h1');
  await expect(h1).toBeVisible({ timeout: 8000 });
  await expect(h1).toHaveText('Page not found');
  // Must also contain a link back to the home page
  await expect(page.locator('a[href="/"]')).toBeVisible();
});

// ─── Legacy locale redirects ──────────────────────────────────────
// LegacyLocaleRedirect is a React Router component that renders
// <Navigate to="/about" replace> for /en/about and /vi/about.
// vite preview serves index.html as SPA fallback for unknown paths,
// so the React app loads and the redirect fires client-side.

test('/en/about redirects to /about and sets locale en', async ({ page }) => {
  await page.goto('/en/about');
  // Wait for the client-side <Navigate replace> to fire
  await expect(page).toHaveURL(/\/about$/, { timeout: 8000 });
  expect(page.url()).not.toContain('/en/');
  // LegacyLocaleRedirect also calls setLang('en')
  const lang = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(lang).toBe('en');
  // The about page heading must be visible (the redirect loaded the right page)
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
});

test('/vi/about redirects to /about and sets locale vi', async ({ page }) => {
  await page.goto('/vi/about');
  await expect(page).toHaveURL(/\/about$/, { timeout: 8000 });
  expect(page.url()).not.toContain('/vi/');
  const lang = await page.evaluate(() => localStorage.getItem('hmv_lang'));
  expect(lang).toBe('vi');
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
});
