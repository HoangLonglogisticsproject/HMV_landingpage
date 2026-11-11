// @ts-check
import { test, expect } from '@playwright/test';

/**
 * HMV Trade Desk on the Next.js build: entry points, the four steps, submission through POST /api/inquiry and its
 * analytics. The browser flow mocks the API response (page.route); the real endpoint is exercised directly, and with no
 * delivery adapter configured (as in CI) it validates and then refuses with 503.
 */

const desk = page => page.getByRole('dialog', { name: 'HMV Trade Desk' });
const dataLayer = page => page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);

async function toBrief(page) {
  const d = desk(page);
  await d.locator('input[id$="-destination"]').fill('Rotterdam, Netherlands');
  await d.locator('input[id$="-volume"]').fill('2');
  await d.getByRole('button', { name: 'Review requirement' }).click();
  await d.getByRole('button', { name: 'See preliminary brief' }).click();
}
async function fillContact(page) {
  const d = desk(page);
  await d.getByLabel('Company').fill('Example Foods B.V.');
  await d.getByLabel('Work email').fill('buyer@example.com');
  await d.getByLabel('HMV Global may contact me about this inquiry.').check();
}

test('home: "Request a Supply Plan" opens the desk; Escape closes it; focus stays inside', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Request a Supply Plan' }).click();
  await expect(desk(page)).toBeVisible();
  await expect(desk(page)).toContainText('Trade inquiry & sourcing desk');
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  expect(await desk(page).evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(desk(page)).toBeHidden();
  await page.getByRole('button', { name: 'Discuss Your Requirements' }).click();
  await expect(desk(page)).toBeVisible();
});

test('Vietnamese home: the desk opens in Vietnamese', async ({ page }) => {
  await page.goto('/vi');
  await page.getByRole('button', { name: 'Nhận phương án cung ứng' }).click();
  const d = page.getByRole('dialog', { name: 'HMV Trade Desk' });
  await expect(d).toContainText('Tiếp nhận & chuẩn hóa yêu cầu giao thương');
  await expect(d.getByRole('radio', { name: 'Tìm nguồn hàng' })).toBeChecked();
});

test('product page: the desk opens with the product preselected and its own requirements', async ({ page }) => {
  await page.goto('/products/dried-cassava-chips');
  await page.getByRole('button', { name: 'Request a Cassava Supply Proposal' }).click();
  await expect(desk(page).getByRole('radio', { name: 'Dried cassava chips', exact: true })).toBeChecked();
  await desk(page).getByRole('button', { name: 'Review requirement' }).click();
  await expect(desk(page).locator('.desk-missing')).toContainText('Required starch %');
  await expect(desk(page)).toContainText('not a fixed shipment specification');
});

test('inquiry accepted: brief before contact, reference shown, generate_lead only after acceptance, no PII', async ({ page }) => {
  let posted;
  await page.route('**/api/inquiry', async route => {
    posted = route.request().postDataJSON();
    expect((await dataLayer(page)).some(e => e.event === 'generate_lead')).toBe(false);
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) });
  });
  await page.goto('/products/passion-fruit?utm_source=linkedin&utm_medium=social');
  await page.getByRole('button', { name: 'Discuss Your Passion Fruit Requirements' }).click();
  await toBrief(page);
  await expect(desk(page)).toContainText('Preliminary Supply Brief');
  await expect(desk(page)).toContainText('Availability, specifications, pricing and delivery terms are confirmed by HMV in the commercial proposal.');
  await fillContact(page);
  await desk(page).getByRole('button', { name: 'Send to HMV Commercial Team' }).click();
  await expect(desk(page)).toContainText('HMV-2026-7KQ4XM');
  expect(posted).toMatchObject({ product: 'passion-fruit', destination: 'Rotterdam, Netherlands', contact: { company: 'Example Foods B.V.', email: 'buyer@example.com' }, consent: { contact: true } });
  expect(posted.context).toMatchObject({ page: '/products/passion-fruit', utm: { source: 'linkedin', medium: 'social' } });
  const events = await dataLayer(page);
  expect(events.at(-1)).toEqual({ event: 'generate_lead', goal: 'sourcing', product: 'passion-fruit', locale: 'en' });
  expect(JSON.stringify(events)).not.toMatch(/buyer@example\.com|Example Foods|Rotterdam/);
});

test('inquiry not delivered: error with the email fallback, answers kept, no lead counted', async ({ page }) => {
  await page.route('**/api/inquiry', route => route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"failed"}' }));
  await page.goto('/products/passion-fruit');
  await page.getByRole('button', { name: 'Discuss Your Passion Fruit Requirements' }).click();
  await toBrief(page);
  await fillContact(page);
  await desk(page).getByRole('button', { name: 'Send to HMV Commercial Team' }).click();
  await expect(desk(page).getByRole('alert')).toContainText('could not be sent');
  await expect(desk(page).getByRole('button', { name: 'Prepare an email instead' })).toBeVisible();
  await expect(desk(page).getByLabel('Company')).toHaveValue('Example Foods B.V.');
  expect((await dataLayer(page)).some(e => e.event === 'generate_lead')).toBe(false);
});

test('POST /api/inquiry: validates, and without a delivery adapter refuses with 503', async ({ request }) => {
  const inquiry = {
    idempotencyKey: '9d2c4e6a-1b3f-4a5c-8e7d-6f5a4b3c2d1e',
    locale: 'en',
    goal: 'sourcing',
    product: 'passion-fruit',
    contact: { company: 'Example Foods', email: 'buyer@example.com' },
    consent: { contact: true },
  };
  const invalid = await request.post('/api/inquiry', { data: { ...inquiry, contact: { company: 'E', email: 'x' } } });
  expect(invalid.status()).toBe(400);
  expect(await invalid.json()).toEqual({ error: 'invalid', fields: ['contact.company', 'contact.email'] });
  expect((await request.post('/api/inquiry', { data: inquiry })).status()).toBe(503);
  expect((await request.post('/api/inquiry', { headers: { 'content-type': 'text/plain' }, data: 'x' })).status()).toBe(415);
});

test('mobile: the desk is a full-screen sheet', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium-mobile', 'phone layout');
  await page.goto('/products/passion-fruit');
  await page.getByRole('button', { name: 'Discuss Your Passion Fruit Requirements' }).click();
  const box = await desk(page).boundingBox();
  const viewport = page.viewportSize();
  expect(box).toMatchObject({ x: 0, y: 0, width: viewport?.width, height: viewport?.height });
  await expect(desk(page).getByRole('button', { name: 'Review requirement' })).toBeInViewport();
});

test('the existing RFQs remain as the fallback', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section#initiate-trade form.rfq-form')).toBeAttached();
  await page.goto('/products/dried-cassava-chips');
  await expect(page.locator('section#rfq input[type="hidden"][name="product"]')).toHaveValue('Dried cassava chips');
});
