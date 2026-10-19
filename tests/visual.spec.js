// @ts-check
import { test, expect } from '@playwright/test';

// Representative visual smoke screenshots for key pages.
// These are taken but NOT committed as baselines.
// To establish baselines: npx playwright test --update-snapshots
// Screenshots are stored in tests/screenshots/ (gitignored).

const VISUAL_PAGES = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'supply-chain', path: '/supply-chain' },
  { name: 'trade-solutions', path: '/trade-solutions' },
  { name: 'contact', path: '/contact' },
  { name: 'product-passion-fruit', path: '/products/passion-fruit' },
  { name: 'insights', path: '/insights' },
  { name: 'logistics', path: '/logistics' },
];

for (const pg of VISUAL_PAGES) {
  test(`visual: ${pg.name} renders without errors`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(pg.path);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take a screenshot (for manual visual review, not for pixel-diff CI)
    await page.screenshot({
      path: `tests/screenshots/${pg.name}-${test.info().project.name}.png`,
      fullPage: true,
    });

    // Verify no console errors during page load
    expect(errors, `Page ${pg.path} had JS errors: ${errors.join(', ')}`).toHaveLength(0);
  });
}
