// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

/**
 * Checks of this machine's `next build` output (.next/). Not collected against a hosted preview (PLAYWRIGHT_BASE_URL),
 * whose build is not on disk (playwright.next.config.js), so it never needs a run-time skip.
 */

test('no CMS address, secret or signing code in any browser chunk', () => {
  const files = [];
  const walk = dir => readdirSync(dir, { withFileTypes: true }).forEach(e => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.js') && files.push(join(dir, e.name))));
  walk('.next/static');
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const js = readFileSync(file, 'utf8');
    expect(js, file).not.toMatch(/CMS_INQUIRY_(URL|SECRET)|x-hmv-signature|x-hmv-timestamp|integrations\/trade-inquiries/i);
  }
});
