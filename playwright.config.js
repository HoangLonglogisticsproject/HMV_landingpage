import { defineConfig } from '@playwright/test';

/**
 * Playwright E2E configuration.
 *
 * Build freshness:
 *   - In CI (`CI=true`): webServer runs `npm run vite:build && npm run vite:preview`,
 *     ensuring tests always run against the latest build.
 *   - In local dev: reuses an existing preview server if one is already
 *     running on port 4173 to keep the feedback loop fast.
 *     Run `npm run test:e2e` (not `npm run vite:preview` separately) to get a
 *     fresh build guarantee locally too.
 */
// Specs scoped by file name instead of skipped at run time: *.mobile.spec.js runs in the phone project only,
// *.desktop.spec.js in the desktop project only. The CMS and Next.js configs apply the same split.
export const MOBILE_ONLY = /\.mobile\.spec\.js$/;
export const DESKTOP_ONLY = /\.desktop\.spec\.js$/;
// CMS-mode specs need the dist-cms bundle (playwright.cms.config.js); tests/next/, tests/next-cms/ and
// tests/next-visual/ target the Next.js build (playwright.next*.config.js).
const OTHER_BUILDS = [/cms-.*\.spec\.js/, /[\\/]next(-cms|-visual)?[\\/]/];

export default defineConfig({
  testDir: './tests',
  testIgnore: OTHER_BUILDS,
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
      testIgnore: [...OTHER_BUILDS, MOBILE_ONLY],
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'chromium-mobile',
      testIgnore: [...OTHER_BUILDS, DESKTOP_ONLY],
      use: { browserName: 'chromium', viewport: { width: 375, height: 667 } },
    },
  ],
  webServer: {
    // In CI, always build first. Locally, reuse existing server if available.
    command: process.env.CI
      ? 'npm run vite:build && npm run vite:preview'
      : 'npm run vite:preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
