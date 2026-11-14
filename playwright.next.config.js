import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

/**
 * Next.js E2E (tests/next/). Locally: `npm run test:e2e:next` builds and serves `next start` on port 4175.
 * Against a preview deployment: PLAYWRIGHT_BASE_URL=<Next preview URL>, plus VERCEL_AUTOMATION_BYPASS_SECRET when the
 * deployment is protected. These are preview acceptance tests: they refuse to run against the production domain,
 * which has its own suite (docs/architecture/MIGRATION_ROADMAP.md, acceptance tests).
 */
const target = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = target ?? 'http://localhost:4175';
if (/(^|\.)hmv-global\.com$/i.test(new URL(baseURL).hostname)) {
  throw new Error(`Preview tests must not run against production (${baseURL}).`);
}
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

// Specs scoped by file name instead of skipped at run time: *.mobile.spec.js runs in the phone project only,
// *.desktop.spec.js (which sets its own viewports) in the desktop project only, and *.local-build.spec.js reads this
// machine's .next build, so it is not collected against a hosted preview.
const MOBILE_ONLY = /\.mobile\.spec\.js$/;
const DESKTOP_ONLY = /\.desktop\.spec\.js$/;
const LOCAL_BUILD_ONLY = target ? [/\.local-build\.spec\.js$/] : [];

export default defineConfig({
  ...base,
  testDir: './tests/next',
  testIgnore: undefined,
  projects: base.projects.map(project => ({
    ...project,
    testIgnore: [project.name === 'chromium-mobile' ? DESKTOP_ONLY : MOBILE_ONLY, ...LOCAL_BUILD_ONLY],
  })),
  use: {
    ...base.use,
    baseURL,
    extraHTTPHeaders: bypass ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' } : undefined,
  },
  webServer: target
    ? undefined
    : {
        command: 'npx next start -p 4175',
        url: 'http://localhost:4175',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        // No delivery adapter, whatever the shell exports: a local run must never send a real inquiry (503 expected).
        env: { INQUIRY_DELIVERY: '' },
      },
});
