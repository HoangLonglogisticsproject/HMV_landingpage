// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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
  await expect(desk(page)).toContainText('Integrated agricultural supply and trade execution');
  // Product-led: the first step is the product, with no goal to choose.
  await expect(desk(page).getByRole('group', { name: 'Product', exact: true })).toBeVisible();
  await expect(desk(page)).not.toContainText('What do you need?');
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
  await expect(d).toContainText('Phương án cung ứng và thực thi giao thương nông sản xuyên suốt');
  await expect(d.getByRole('radio', { name: 'Chanh dây' })).toBeVisible();
  await expect(d).not.toContainText('Bạn cần hỗ trợ gì?');
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
  expect(events.at(-1)).toEqual({ event: 'generate_lead', product: 'passion-fruit', locale: 'en' });
  expect(JSON.stringify(events)).not.toMatch(/goal/);
  expect(posted).not.toHaveProperty('goal');
  expect(posted).not.toHaveProperty('goods');
  expect(JSON.stringify(events)).not.toMatch(/buyer@example\.com|Example Foods|Rotterdam/);
  // This build has no NEXT_PUBLIC_HMV_* channels: no follow-up links rather than broken ones.
  await expect(desk(page).locator('.desk-follow-up')).toHaveCount(0);
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

// Media type and validation are checked on every target: neither can create an inquiry. The valid request is sent only
// to the local build (no delivery adapter, so 503): a hosted preview may have INQUIRY_DELIVERY=cms, and a test must never
// create a real CMS inquiry.
test('POST /api/inquiry: validates, and without a delivery adapter refuses with 503', async ({ request }) => {
  const inquiry = {
    idempotencyKey: '9d2c4e6a-1b3f-4a5c-8e7d-6f5a4b3c2d1e',
    locale: 'en',
    product: 'passion-fruit',
    contact: { company: 'Example Foods', email: 'buyer@example.com' },
    consent: { contact: true },
  };
  const invalid = await request.post('/api/inquiry', { data: { ...inquiry, contact: { company: 'E', email: 'x' } } });
  expect(invalid.status()).toBe(400);
  expect(await invalid.json()).toEqual({ error: 'invalid', fields: ['contact.company', 'contact.email'] });
  expect((await request.post('/api/inquiry', { headers: { 'content-type': 'text/plain' }, data: 'x' })).status()).toBe(415);
  if (!process.env.PLAYWRIGHT_BASE_URL) expect((await request.post('/api/inquiry', { data: inquiry })).status()).toBe(503);
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

// Chunks a page loads, read from the network: whether the desk's code (its copy) is among them.
function deskCodeLoads(page) {
  const loaded = { desk: false };
  page.on('response', async res => {
    if (/\/_next\/static\/chunks\/.+\.js$/.test(res.url()) && (await res.text().catch(() => '')).includes('Integrated agricultural supply and trade execution')) loaded.desk = true;
  });
  return loaded;
}

test('lazy: the desk code loads on the first open; on a slow connection that open is kept, product included', async ({ page }) => {
  const loaded = deskCodeLoads(page);
  await page.goto('/products/dried-cassava-chips');
  await page.waitForLoadState('networkidle');
  expect(loaded.desk).toBe(false);
  // From here on, every script takes 1.5 s: the desk chunk arrives well after the click.
  await page.route('**/_next/static/chunks/**', async route => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.getByRole('button', { name: 'Request a Cassava Supply Proposal' }).click();
  await expect(page.getByRole('status')).toHaveText('Opening HMV Trade Desk…');
  await expect(desk(page).getByRole('radio', { name: 'Dried cassava chips', exact: true })).toBeChecked({ timeout: 15_000 });
  expect(loaded.desk).toBe(true);
  const events = (await dataLayer(page)).map(e => e.event);
  expect(events.filter(e => e === 'trade_desk_open')).toHaveLength(1);
});

test('navigation: "HMV Trade Desk" opens the desk (desktop bar or mobile drawer); there is no support chat', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#chat-launcher-btn, .hmv-floating-chat-launcher')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/24\/7 Support|Support Chat|LIVE SUPPORT/);
  if (test.info().project.name === 'chromium-mobile') await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('nav .nav-support-btn').click();
  await expect(desk(page)).toBeVisible();
  await expect(desk(page).getByRole('radio', { name: 'Passion fruit', exact: true })).toBeVisible();
  await expect(desk(page).getByRole('button', { name: 'Review requirement' })).toBeDisabled();
});

test('the consent checkbox links the privacy notice, in the buyer language', async ({ page }) => {
  await page.goto('/vi/san-pham/san-lat-kho');
  await page.getByRole('button', { name: 'Yêu cầu phương án cung ứng sắn lát' }).click();
  const d = page.getByRole('dialog', { name: 'HMV Trade Desk' });
  await d.getByRole('button', { name: 'Xem phân tích' }).click();
  await d.getByRole('button', { name: 'Xem phương án sơ bộ' }).click();
  await expect(d.getByRole('link', { name: 'Thông báo quyền riêng tư' })).toHaveAttribute('href', '/vi/privacy');
  const res = await page.request.get('/vi/privacy');
  expect(res.status()).toBe(200);
  expect(await res.text()).not.toMatch(/GDPR|CCPA/);
});

test('no CMS address, secret or signing code in any browser chunk', () => {
  test.skip(Boolean(process.env.PLAYWRIGHT_BASE_URL), 'reads the local build');
  const files = [];
  const walk = dir => readdirSync(dir, { withFileTypes: true }).forEach(e => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.js') && files.push(join(dir, e.name))));
  walk('.next/static');
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const js = readFileSync(file, 'utf8');
    expect(js, file).not.toMatch(/CMS_INQUIRY_(URL|SECRET)|x-hmv-signature|x-hmv-timestamp|integrations\/trade-inquiries/i);
  }
});
