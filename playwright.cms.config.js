import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

/**
 * CMS-mode E2E: the `npm run build:cms` bundle (dist-cms) served by `vite preview` on port 4174.
 * Every spec mocks /api/v1/public/** itself, so no CMS backend is needed and results are deterministic.
 * Run with `npm run test:e2e:cms`.
 */
export default defineConfig({
  ...base,
  testIgnore: undefined,
  testMatch: /cms-.*\.spec\.js/,
  use: { ...base.use, baseURL: 'http://localhost:4174' },
  webServer: {
    command: `${process.env.CI ? 'npm run build:cms && ' : ''}npx vite preview --outDir dist-cms --port 4174 --strictPort`,
    url: 'http://localhost:4174',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
