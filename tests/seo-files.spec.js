// @ts-check
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// The Vite site's static SEO files live in src/app (Next.js generates its own); the build must serve them unchanged.
for (const file of ['sitemap.xml', 'robots.txt']) {
  test(`/${file} is the Vite site's file, unchanged`, async ({ request }) => {
    const res = await request.get(`/${file}`);
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe(readFileSync(`src/app/${file}`, 'utf8'));
  });
}
