import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';
import { NEXT_PORT } from './tests/next-cms/env.js';

/**
 * Next.js with CMS_CONTENT=true against the mock CMS (tests/next-cms/). `npm run test:e2e:next-cms` builds into .next,
 * replacing the bundled build. Desktop only and serial: the tests share the mock's state and the Next.js cache.
 */
export default defineConfig({
  ...base,
  testDir: './tests/next-cms',
  // stale.spec.js needs a short revalidation interval: playwright.next-cms-stale.config.js.
  testIgnore: /stale\.spec\.js/,
  fullyParallel: false,
  workers: 1,
  projects: [base.projects[0]],
  use: { ...base.use, baseURL: `http://localhost:${NEXT_PORT}` },
  webServer: {
    command: 'node tests/next-cms/serve.js',
    url: `http://localhost:${NEXT_PORT}`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
