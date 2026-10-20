import { defineConfig } from '@playwright/test';

/**
 * Playwright E2E configuration.
 *
 * Build freshness:
 *   - In CI (`CI=true`): webServer runs `npm run build && npm run preview`,
 *     ensuring tests always run against the latest build.
 *   - In local dev: reuses an existing preview server if one is already
 *     running on port 4173 to keep the feedback loop fast.
 *     Run `npm run test:e2e` (not `npm run preview` separately) to get a
 *     fresh build guarantee locally too.
 */
export default defineConfig({
  testDir: './tests',
  // CMS-mode specs need the dist-cms bundle: they run via playwright.cms.config.js
  testIgnore: /cms-.*\.spec\.js/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Limit workers to avoid resource contention on the 8MB hero image
  workers: process.env.CI ? 1 : 4,
  // Global test timeout — desktop loads a full-sized hero image (~8MB)
  timeout: 60_000,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Action timeout — covers clicks, assertions, waitForURL
    actionTimeout: 10_000,
    // Navigation timeout — covers page.goto, waitForLoadState
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'chromium-mobile',
      use: { browserName: 'chromium', viewport: { width: 375, height: 667 } },
    },
  ],
  webServer: {
    // In CI, always build first. Locally, reuse existing server if available.
    command: process.env.CI
      ? 'npm run build && npm run preview'
      : 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
