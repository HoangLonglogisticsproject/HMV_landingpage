import { defineConfig } from '@playwright/test';
import base from './playwright.next-cms.config.js';

/**
 * Stale-on-error (tests/next-cms/stale.spec.js): the CMS-mode server with a 2 s revalidation interval instead of the
 * production 300 s, and SITE_INDEXABLE=true so a page that turned noindex would show. Builds into .next again.
 */
export default defineConfig({
  ...base,
  testIgnore: undefined,
  testMatch: /stale\.spec\.js/,
  webServer: { ...base.webServer, env: { CMS_REVALIDATE_SECONDS: '2', SITE_INDEXABLE: 'true' } },
});
