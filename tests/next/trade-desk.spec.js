// @ts-check
import { test, expect } from '@playwright/test';

/**
 * HMV Trade Desk on the Next.js build: entry points, the conversation (product, destination, volume), the route
 * (quotation or Customer Service), submission through POST /api/inquiry and its analytics. The browser flow mocks the
 * API response (page.route); the real endpoint is exercised directly, and with no delivery adapter configured (as in
 * CI) it validates and then refuses with 503. The phone layout and the local-build chunk check are in
 * trade-desk.mobile.spec.js and trade-desk.local-build.spec.js.
 */

const desk = page => page.getByRole('dialog', { name: 'HMV Trade Desk' });
const dataLayer = page => page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
const thread = page => desk(page).getByRole('log');
// Technical questions the desk must never ask or list as missing.
const TECHNICAL = /moisture|starch %|brix|incoterm|packaging|certification|\bFOB\b|\bCIF\b|destination port|delivery window|transport|application/i;

/** The buyer answers HMV's question in the conversation's field, sent with Enter. */
async function say(page, label, value) {
  const input = desk(page).getByLabel(label, { exact: true });
  await input.fill(value);
  await input.press('Enter');
}
async function fillContact(page) {
  const d = desk(page);
  await d.getByLabel('Company').fill('Example Foods B.V.');
  await d.getByLabel('Business email').fill('buyer@example.com');
  await d.getByLabel('HMV may contact me about this inquiry.').check();
}

test('home: "Request a Supply Plan" opens the desk at the product question; Escape closes it; focus stays inside', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Request a Supply Plan' }).click();
  await expect(desk(page)).toBeVisible();
  await expect(desk(page)).toContainText('B2B Agricultural Supply Desk');
  await expect(desk(page).getByRole('img', { name: 'HMV Global' })).toBeVisible();
  await expect(thread(page)).toHaveText('HMVWhat product are you looking for?');
  await expect(desk(page).getByLabel('Product', { exact: true })).toBeFocused();
  // Chat first: no steps, no questionnaire, no contact form.
  await expect(desk(page)).not.toContainText(/Step|\d \/ 4|Complete requirements|still needs/);
  await expect(desk(page)).not.toContainText(TECHNICAL);
  await expect(desk(page).getByLabel('Company')).toHaveCount(0);
  for (let i = 0; i < 16; i++) await page.keyboard.press('Tab');
  expect(await desk(page).evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(desk(page)).toBeHidden();
  await page.getByRole('button', { name: 'Discuss Your Requirements' }).click();
  await expect(desk(page)).toBeVisible();
});

test('Vietnamese home: the desk opens in Vietnamese; a typed product is recognized', async ({ page }) => {
  await page.goto('/vi');
  await page.getByRole('button', { name: 'Nhận phương án cung ứng' }).click();
  await expect(desk(page)).toContainText('Trợ lý giao thương & cung ứng nông sản');
  await expect(desk(page)).toContainText('THÔNG TIN YÊU CẦU', { ignoreCase: true });
  await expect(desk(page).getByRole('button', { name: 'Chanh dây' })).toBeVisible();
  await say(page, 'Sản phẩm', 'Bên tôi đang tìm sắn lát giao về Đồng Nai');
  await expect(thread(page)).toContainText('Anh/chị cần giao hàng đến đâu?');
  await expect(desk(page).locator('.desk-summary')).toContainText('Sắn lát khô');
});

test('product page: the product is known; destination and volume make a requirement ready for quotation', async ({ page }) => {
  await page.goto('/products/dried-cassava-chips');
  await page.getByRole('button', { name: 'Request a Cassava Supply Proposal' }).click();
  await expect(desk(page).locator('.desk-summary')).toContainText('Dried cassava chips');
  await expect(thread(page)).toHaveText('HMVWhere would you like the goods delivered?');
  await say(page, 'Delivery destination', 'Chennai, India');
  await say(page, 'Expected volume', '2,000');
  const messages = thread(page).locator('.desk-msg');
  await expect(messages).toHaveText([
    'HMVWhere would you like the goods delivered?',
    'YouChennai, India',
    'HMVWhat volume are you planning to purchase?',
    'You2,000 MT / month',
    /^HMVThank you\. I have enough information to open a commercial inquiry/,
  ]);
  await expect(desk(page).getByRole('button', { name: 'Request Quotation' })).toBeFocused();
  await expect(desk(page).getByRole('complementary', { name: 'Your requirement' })).toContainText('Ready for quotation');
  await expect(desk(page)).not.toContainText(TECHNICAL);
  await expect(desk(page).getByLabel('Company')).toHaveCount(0);
});

test('edit: a mistyped destination is corrected from the requirement panel, by keyboard; the volume is not asked again', async ({ page }) => {
  await page.goto('/products/dried-cassava-chips');
  await page.getByRole('button', { name: 'Request a Cassava Supply Proposal' }).click();
  await say(page, 'Delivery destination', 'Channai, India');
  await say(page, 'Expected volume', '2,000');
  const panel = desk(page).getByRole('complementary', { name: 'Your requirement' });
  await expect(panel).toContainText('Ready for quotation');
  // On a phone the requirement is folded into one line: opened first.
  if (test.info().project.name === 'chromium-mobile') await panel.getByRole('button', { name: /Your requirement/ }).click();
  await panel.getByRole('button', { name: 'Edit Destination' }).focus();
  await page.keyboard.press('Enter');
  await expect(desk(page).getByLabel('Delivery destination', { exact: true })).toBeFocused();
  await expect(panel).toContainText('2,000 MT / month');
  await expect(panel).not.toContainText('Channai');
  await page.keyboard.type('Chennai, India');
  await page.keyboard.press('Enter');
  await expect(desk(page).getByRole('button', { name: 'Request Quotation' })).toBeFocused();
  await expect(panel).toContainText('Chennai, India');
  await expect(panel).toContainText('Ready for quotation');
  await expect(desk(page).getByLabel('Expected volume', { exact: true })).toHaveCount(0);
});

test('RFQ accepted: contact last, reference and the commercial process, generate_lead only after acceptance, no PII', async ({ page }) => {
  let posted;
  await page.route('**/api/inquiry', async route => {
    posted = route.request().postDataJSON();
    expect((await dataLayer(page)).some(e => e.event === 'generate_lead')).toBe(false);
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) });
  });
  await page.goto('/products/passion-fruit?utm_source=linkedin&utm_medium=social');
  await page.getByRole('button', { name: 'Discuss Your Passion Fruit Requirements' }).click();
  await say(page, 'Delivery destination', 'Rotterdam, Netherlands');
  await say(page, 'Expected volume', '2');
  await desk(page).getByRole('button', { name: 'Request Quotation' }).click();
  await expect(desk(page).getByRole('form', { name: 'Request a quotation' })).toBeVisible();
  await expect(desk(page).getByLabel('Company')).toBeFocused();
  await fillContact(page);
  await desk(page).getByRole('button', { name: 'Send Request' }).click();
  await expect(desk(page).getByRole('heading', { name: 'Commercial inquiry received' })).toBeVisible();
  await expect(desk(page)).toContainText('HMV-2026-7KQ4XM');
  await expect(desk(page)).toContainText('HMV Sales will review your requirement and continue the quotation process with you.');
  await expect(desk(page).locator('.desk-timeline li')).toHaveText(['Request received', 'Quotation', 'Commercial discussion', 'Sales contract', 'Supply execution']);
  await expect(desk(page).locator('.desk-timeline li[aria-current="step"]')).toHaveText('Request received');
  expect(posted).toMatchObject({
    product: 'passion-fruit',
    destination: 'Rotterdam, Netherlands',
    volume: { amount: '2', unit: 'containers' },
    application: '',
    transport: '',
    requirements: {},
    contact: { company: 'Example Foods B.V.', email: 'buyer@example.com' },
    consent: { contact: true },
  });
  expect(posted.context).toMatchObject({ page: '/products/passion-fruit', utm: { source: 'linkedin', medium: 'social' } });
  const events = await dataLayer(page);
  expect(events.map(e => e.event)).toEqual([
    'trade_desk_open', 'trade_product_selected', 'trade_destination_completed', 'trade_volume_completed', 'trade_route_rfq',
    'trade_contact_start', 'generate_lead',
  ]);
  expect(events.at(-1)).toEqual({ event: 'generate_lead', product: 'passion-fruit', locale: 'en', route: 'rfq' });
  expect(JSON.stringify(events)).not.toMatch(/buyer@example\.com|Example Foods|Rotterdam/);
  // This build has no NEXT_PUBLIC_HMV_* channels: no follow-up links rather than broken ones.
  await expect(desk(page).locator('.desk-follow-up')).toHaveCount(0);
});

test('discovery accepted: a buyer still exploring reaches Customer Service without a destination or volume', async ({ page }) => {
  let posted;
  await page.route('**/api/inquiry', async route => {
    posted = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-EXPLOR' }) });
  });
  await page.goto('/products/dried-cassava-chips');
  await page.getByRole('button', { name: 'Request a Cassava Supply Proposal' }).click();
  await desk(page).getByRole('button', { name: "I'm still exploring" }).click();
  await expect(thread(page)).toContainText('No problem. HMV Customer Service can help clarify your requirement');
  await expect(desk(page).getByLabel('Expected volume')).toHaveCount(0);
  await expect(desk(page).getByRole('complementary', { name: 'Your requirement' })).toContainText('Exploring requirement');
  await desk(page).getByRole('button', { name: 'Discuss with HMV' }).click();
  await expect(desk(page).getByRole('form', { name: 'Talk to HMV Customer Service' })).toBeVisible();
  await fillContact(page);
  await desk(page).getByRole('button', { name: 'Send Request' }).click();
  await expect(desk(page).getByRole('heading', { name: 'Inquiry received' })).toBeVisible();
  await expect(desk(page)).toContainText('HMV Customer Service will continue the conversation and help clarify the requirement.');
  await expect(desk(page).locator('.desk-timeline')).toHaveCount(0);
  expect(posted).toMatchObject({ product: 'dried-cassava-chips', destination: '', volume: { amount: '' } });
  expect((await dataLayer(page)).at(-1)).toEqual({ event: 'generate_lead', product: 'dried-cassava-chips', locale: 'en', route: 'discovery' });
});

test('language: an English sentence on the Vietnamese site continues in English; the EN | VI choice wins', async ({ page }) => {
  await page.goto('/vi/san-pham/san-lat-kho');
  await page.getByRole('button', { name: 'Yêu cầu phương án cung ứng sắn lát' }).click();
  await expect(thread(page)).toHaveText('HMVAnh/chị cần giao hàng đến đâu?');
  await say(page, 'Nơi giao hàng', 'Delivery to our plant in Chennai, India');
  await expect(thread(page)).toContainText('What volume are you planning to purchase?');
  await desk(page).getByRole('button', { name: 'Tiếng Việt' }).click();
  await expect(thread(page)).toContainText('Anh/chị dự kiến mua với sản lượng bao nhiêu?');
  await expect(desk(page)).toHaveAttribute('lang', 'vi');
});

test('inquiry not delivered: error with the email fallback, answers kept, no lead counted', async ({ page }) => {
  await page.route('**/api/inquiry', route => route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"failed"}' }));
  await page.goto('/products/passion-fruit');
  await page.getByRole('button', { name: 'Discuss Your Passion Fruit Requirements' }).click();
  await say(page, 'Delivery destination', 'Rotterdam, Netherlands');
  await say(page, 'Expected volume', '2');
  await desk(page).getByRole('button', { name: 'Request Quotation' }).click();
  await fillContact(page);
  await desk(page).getByRole('button', { name: 'Send Request' }).click();
  await expect(desk(page).getByRole('alert')).toContainText('could not be sent');
  await expect(desk(page).getByRole('button', { name: 'Prepare an email instead' })).toBeVisible();
  await expect(desk(page).getByLabel('Company')).toHaveValue('Example Foods B.V.');
  await expect(thread(page)).toContainText('Rotterdam, Netherlands');
  expect((await dataLayer(page)).some(e => e.event === 'generate_lead')).toBe(false);
});

// Media type and validation are checked on every target: neither can create an inquiry. The valid requests are sent
// only to the local build (no delivery adapter, so 503): a hosted preview may have INQUIRY_DELIVERY=cms, and a test must
// never create a real CMS inquiry.
test('POST /api/inquiry: validates, and without a delivery adapter refuses with 503', async ({ request }) => {
  const inquiry = {
    idempotencyKey: '9d2c4e6a-1b3f-4a5c-8e7d-6f5a4b3c2d1e',
    locale: 'en',
    product: 'passion-fruit',
    application: '',
    transport: '',
    requirements: {},
    contact: { company: 'Example Foods', email: 'buyer@example.com' },
    consent: { contact: true },
  };
  const invalid = await request.post('/api/inquiry', { data: { ...inquiry, contact: { company: 'E', email: 'x' } } });
  expect(invalid.status()).toBe(400);
  expect(await invalid.json()).toEqual({ error: 'invalid', fields: ['contact.company', 'contact.email'] });
  expect((await request.post('/api/inquiry', { headers: { 'content-type': 'text/plain' }, data: 'x' })).status()).toBe(415);
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    // A discovery inquiry (product only) and a ready one (destination and volume) both pass validation.
    expect((await request.post('/api/inquiry', { data: inquiry })).status()).toBe(503);
    const ready = { ...inquiry, idempotencyKey: '1f2e3d4c-5b6a-4987-8a7b-6c5d4e3f2a1b', destination: 'Rotterdam', volume: { amount: '2', unit: 'containers' } };
    expect((await request.post('/api/inquiry', { data: ready })).status()).toBe(503);
  }
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
    if (/\/_next\/static\/chunks\/.+\.js$/.test(res.url()) && (await res.text().catch(() => '')).includes('B2B Agricultural Supply Desk')) loaded.desk = true;
  });
  return loaded;
}

test('lazy: no desk code on the homepage until the desk is opened', async ({ page }) => {
  const loaded = deskCodeLoads(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(loaded.desk).toBe(false);
  await page.getByRole('button', { name: 'Request a Supply Plan' }).click();
  await expect(desk(page)).toBeVisible();
  await expect.poll(() => loaded.desk).toBe(true);
});

test('lazy: on a slow connection the first open is kept, product included', async ({ page }) => {
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
  await expect(desk(page).locator('.desk-summary')).toContainText('Dried cassava chips', { timeout: 15_000 });
  await expect(thread(page)).toHaveText('HMVWhere would you like the goods delivered?');
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
  await expect(thread(page)).toHaveText('HMVWhat product are you looking for?');
  await expect(desk(page).getByRole('button', { name: 'Passion fruit', exact: true })).toBeVisible();
});

test('the consent checkbox links the privacy notice, in the buyer language', async ({ page }) => {
  await page.goto('/vi/san-pham/san-lat-kho');
  await page.getByRole('button', { name: 'Yêu cầu phương án cung ứng sắn lát' }).click();
  await desk(page).getByRole('button', { name: 'Tôi đang tìm hiểu' }).click();
  await desk(page).getByRole('button', { name: 'Trao đổi với HMV' }).click();
  await expect(desk(page).getByRole('link', { name: 'Thông báo quyền riêng tư' })).toHaveAttribute('href', '/vi/privacy');
  const res = await page.request.get('/vi/privacy');
  expect(res.status()).toBe(200);
  expect(await res.text()).not.toMatch(/GDPR|CCPA/);
});
