// @ts-check
import { test, expect } from '@playwright/test';

// Headers of `next start` serving this build; a hosted preview reports its cache differently.
test('the sitemap is prerendered: served from the build output, never computed per request', async ({ request }) => {
  for (const attempt of ['first', 'second']) {
    const res = await request.get('/sitemap.xml');
    expect(res.headers()['x-nextjs-cache'], attempt).toBe('HIT');
    expect(res.headers()['cache-control'], attempt).toBe('s-maxage=31536000');
  }
});
