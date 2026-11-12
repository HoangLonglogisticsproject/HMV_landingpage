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

export default defineConfig({
  ...base,
  testDir: './tests/next',
  testIgnore: undefined,
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
