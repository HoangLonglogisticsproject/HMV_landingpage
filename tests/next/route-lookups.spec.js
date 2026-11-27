// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Lookups by a name from the URL or the request, on the real Next.js build: a name every object inherits (constructor,
 * toString, __proto__...) is not a product, a segment or a unit, in any of the routes, and never ends in a server error.
 * The known pages, the wrong-form segment URLs, the page-scoped locales and the inquiry endpoint keep their behavior.
 */

const INHERITED = ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__', 'prototype', 'isPrototypeOf'];
const status = async (request, url) => (await request.get(url, { maxRedirects: 0 })).status();

for (const name of INHERITED) {
  test(`the name "${name}" is no product and no segment, in English and Vietnamese: 404, never an error or a redirect`, async ({ request }) => {
    for (const url of [
      `/products/${name}`, `/products/${name}/retail`, `/products/${name}/foodservice`, `/products/passion-fruit/${name}`, `/products/bananas/${name}`,
      `/vi/san-pham/${name}`, `/vi/san-pham/${name}/doi-tac-ban-le`, `/vi/san-pham/chanh-day/${name}`, `/vi/san-pham/chuoi-cavendish/${name}`,
    ]) expect(await status(request, url), url).toBe(404);
  });

  test(`the name "${name}" in the legacy and language forms: no exception, and no URL is built from what it inherits`, async ({ request }) => {
    for (const url of [`/vi/products/${name}`, `/vi/products/passion-fruit/${name}`, `/products/${name}?lang=vi`, `/products/passion-fruit/${name}?lang=vi`, `/vi/san-pham/chanh-day/${name}?lang=en`]) {
      const response = await request.get(url, { maxRedirects: 0 });
      expect([301, 302, 307, 308, 404], url).toContain(response.status());
      const location = response.headers().location ?? '';
      expect(location.includes('function') || location.includes('[object'), `${url} -> ${location}`).toBe(false);
    }
  });
}

test('the known pages answer, and the wrong-form and unknown segment URLs stay 404 without a redirect', async ({ request }) => {
  for (const url of [
    '/products/passion-fruit', '/products/passion-fruit/foodservice', '/products/passion-fruit/retail', '/vi/san-pham/chanh-day', '/vi/san-pham/chanh-day/khach-san-nha-hang',
    '/vi/san-pham/chanh-day/doi-tac-ban-le', '/products/dried-cassava-chips', '/vi/san-pham/san-lat-kho', '/zh-cn/cassava-chips', '/ko/tapioca-chips',
  ]) expect(await status(request, url), url).toBe(200);
  for (const url of [
    '/products/passion-fruit/export', '/products/passion-fruit/khach-san-nha-hang', '/products/passion-fruit/wholesale', '/products/passion-fruit/Retail', '/vi/san-pham/chanh-day/retail',
    '/vi/san-pham/chanh-day/foodservice', '/products/bananas/retail', '/vi/san-pham/chuoi-cavendish/doi-tac-ban-le', '/products/no-such-product', '/vi/san-pham/no-such-product',
  ]) expect(await status(request, url), url).toBe(404);
  // `?lang=` keeps resolving a known page to its other-language URL in one step.
  const redirected = await request.get('/products/passion-fruit/retail?lang=vi', { maxRedirects: 0 });
  expect([redirected.status(), redirected.headers().location]).toEqual([308, '/vi/san-pham/chanh-day/doi-tac-ban-le']);
});

test('the inquiry endpoint answers hostile values with a controlled 400 by field, never a server error', async ({ request }) => {
  const base = {
    idempotencyKey: '1f2e3d4c-5b6a-4987-8a7b-6c5d4e3f2a1b', locale: 'en', product: 'passion-fruit', destination: 'Busan',
    volume: { amount: '5', unit: 'kg' }, contact: { company: 'Example Co', email: 'buyer@example.com' }, consent: { contact: true },
  };
  const post = async data => request.post('/api/inquiry', { data });
  const fields = async response => (await response.json()).fields;
  for (const unit of [['kg'], {}, { toString: 1 }, 5, true, 'constructor', '__proto__', 'toString', 'KG', 'lb']) {
    const response = await post({ ...base, volume: { amount: '5', unit } });
    expect([response.status(), await fields(response)], JSON.stringify(unit)).toEqual([400, ['volume.unit']]);
  }
  for (const amount of [5, ['5'], {}, { toString: 1 }, true]) {
    const response = await post({ ...base, volume: { amount, unit: 'kg' } });
    expect([response.status(), await fields(response)], JSON.stringify(amount)).toEqual([400, ['volume.amount']]);
  }
  // Kilograms of another product, and a product, an origin or a unit that is not a name: 400 by field, never a server error.
  const kilogramsOfCassava = await post({ ...base, product: 'dried-cassava-chips' });
  expect([kilogramsOfCassava.status(), await fields(kilogramsOfCassava)]).toEqual([400, ['volume.unit']]);
  for (const product of [['passion-fruit'], {}, { toString: 1 }, 'constructor', '__proto__']) {
    const response = await post({ ...base, product, volume: { amount: '5', unit: 'mt' } });
    expect([response.status(), await fields(response)], JSON.stringify(product)).toEqual([400, ['product']]);
  }
  const origin = await post({ ...base, origin: { toString: 1 } });
  expect([origin.status(), await fields(origin)]).toEqual([400, ['origin']]);
  // Valid requests reach the delivery step (503 here, which has no adapter): only against the local build, never against a
  // preview, where they could create a real inquiry. An optional field of the wrong type is dropped, not an error.
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    for (const body of [
      { ...base, application: { toString: 1 }, transport: ['air'] },
      { ...base, application: 'constructor', transport: '__proto__', requirements: { toString: 1 } },
      { ...base, context: { page: { toString: 1 }, utm: { source: ['x'] } } },
      { ...base, volume: { amount: '50', unit: 'kg_week' } },
      { ...base, volume: { amount: '2', unit: 'containers' } },
      { ...base, volume: { amount: '10', unit: 'mt_month' } },
      { ...base, volume: { amount: '' } },
      { ...base, product: 'dried-cassava-chips', origin: 'cambodia', volume: { amount: '5000', unit: 'mt_month' } },
    ]) expect((await post(body)).status(), JSON.stringify(body)).toBe(503);
  }
});
