// @ts-check
import { test, expect } from '@playwright/test';

/**
 * The homepage Quick RFQ (fast lane) on the Next.js build: two steps, a real submission through POST /api/inquiry (the
 * API response is mocked with page.route; the endpoint itself is tested in trade-desk.spec.js and the unit tests), the
 * reference on the page, no email app, and the handoff to the Trade Desk (assisted lane). Runs on desktop and phone.
 */

const dataLayer = page => page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
const rfq = page => page.locator('section#initiate-trade');
const form = page => rfq(page).locator('form.rfq-form');
const desk = page => page.getByRole('dialog', { name: 'HMV Trade Desk' });

/** Step 1 answered and continued; the page has to be hydrated first (Continue is a client-side step). */
async function toContact(page, path = '/?utm_source=newsletter&utm_medium=email#initiate-trade') {
  await page.goto(path, { waitUntil: 'networkidle' });
  const f = form(page);
  await f.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  await f.getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await f.getByLabel('Estimated volume', { exact: true }).fill('500');
  await f.getByRole('button', { name: 'Continue' }).click();
  await expect(f.getByRole('heading', { name: 'Where should HMV contact you?' })).toBeFocused();
}
async function fillContact(page) {
  const f = form(page);
  await f.getByLabel('Company', { exact: true }).fill('Example Foods B.V.');
  await f.getByLabel('Work email', { exact: true }).fill('buyer@example.com');
  await f.getByLabel('HMV may contact me about this inquiry.').check();
}

test('step 1: the fast lane asks product, destination and volume only; the anchor and the heading are in place', async ({ page }) => {
  await page.goto('/#initiate-trade', { waitUntil: 'networkidle' });
  await expect(rfq(page)).toBeVisible();
  await expect(rfq(page).getByRole('heading', { level: 2, name: 'Tell us what you need' })).toBeVisible();
  await expect(rfq(page)).toContainText('QUICK RFQ · FAST LANE');
  const f = form(page);
  await expect(f.getByLabel('Product', { exact: true })).toBeVisible();
  await expect(f.getByLabel('Destination', { exact: true })).toBeVisible();
  await expect(f.getByLabel('Estimated volume', { exact: true })).toBeVisible();
  await expect(f.getByRole('button', { name: 'Continue' })).toBeVisible();
  await expect(f.getByLabel('Company', { exact: true })).toHaveCount(0);
  await expect(rfq(page)).not.toContainText(/Prepare RFQ email|email app/);
  // Nothing is counted for opening the page.
  expect(await dataLayer(page)).toEqual([]);

  // Validation says what is missing, in words, and moves focus to the first one.
  await f.getByRole('button', { name: 'Continue' }).click();
  await expect(f.getByText('Choose a product.')).toBeVisible();
  await expect(f.getByText('Enter a destination.')).toBeVisible();
  await expect(f.getByText('Enter a number, for example 500.')).toBeVisible();
  await expect(f.getByLabel('Product', { exact: true })).toBeFocused();
});

test('accepted: one inquiry through /api/inquiry with the visit, the reference on the page, no email app, no PII in analytics', async ({ page }) => {
  const posted = [];
  await page.route('**/api/inquiry', async route => {
    posted.push(route.request().postDataJSON());
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) });
  });
  const navigations = [];
  page.on('framenavigated', frame => navigations.push(frame.url()));

  await toContact(page);
  await fillContact(page);
  await form(page).getByRole('button', { name: 'Send Request' }).click();

  const done = rfq(page).getByRole('region', { name: 'Request received' });
  await expect(done).toContainText('HMV-2026-7KQ4XM');
  await expect(done).toContainText('HMV will review your requirement and contact you through the information provided.');
  await expect(done.getByRole('heading', { name: 'Request received' })).toBeFocused();
  await expect(form(page)).toHaveCount(0);
  expect(posted).toHaveLength(1);
  expect(posted[0]).toMatchObject({
    locale: 'en',
    product: 'dried-cassava-chips',
    destination: 'Busan, South Korea',
    volume: { amount: '500', unit: 'mt_month' },
    application: '',
    transport: '',
    requirements: {},
    contact: { company: 'Example Foods B.V.', email: 'buyer@example.com' },
    consent: { contact: true },
    website: '',
  });
  expect(posted[0].idempotencyKey).toMatch(/^[A-Za-z0-9-]{8,64}$/);
  expect(posted[0].context).toMatchObject({ page: '/', landingPage: '/', utm: { source: 'newsletter', medium: 'email' } });
  // Still on the home page, and the page was never navigated to an email app.
  expect(new URL(page.url()).pathname).toBe('/');
  expect(navigations.filter(url => url.startsWith('mailto:'))).toEqual([]);

  const events = await dataLayer(page);
  expect(events.map(e => e.event)).toEqual([
    'quick_rfq_start', 'quick_rfq_requirement_complete', 'quick_rfq_contact_start', 'quick_rfq_submit', 'quick_rfq_success', 'generate_lead',
  ]);
  expect(events.at(-1)).toEqual({ event: 'generate_lead', product: 'dried-cassava-chips', locale: 'en', route: 'rfq', source: 'quick_rfq' });
  expect(JSON.stringify(events)).not.toMatch(/buyer@example\.com|Example Foods|Busan|500|HMV-2026/);

  // Another request: from the start, with consent asked again.
  await rfq(page).getByRole('button', { name: 'Submit another request' }).click();
  await expect(form(page).getByLabel('Product', { exact: true })).toBeFocused();
  await expect(form(page).getByLabel('Product', { exact: true })).toHaveValue('');
});

test('failed delivery: nothing is claimed, the details stay, the retry reuses the key and the email draft is only a fallback', async ({ page }) => {
  const keys = [];
  let accept = false;
  await page.route('**/api/inquiry', async route => {
    keys.push(route.request().postDataJSON().idempotencyKey);
    if (accept) await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-RETRY1' }) });
    else await route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"failed"}' });
  });
  await toContact(page);
  await fillContact(page);
  await expect(rfq(page).getByRole('button', { name: 'Send by email instead' })).toHaveCount(0);
  await form(page).getByRole('button', { name: 'Send Request' }).click();

  await expect(form(page).getByRole('alert')).toContainText('We could not send your request');
  await expect(form(page).getByRole('alert')).toBeFocused();
  await expect(rfq(page)).not.toContainText(/Request received|HMV-2026/);
  await expect(form(page).getByLabel('Company', { exact: true })).toHaveValue('Example Foods B.V.');
  await expect(form(page).getByRole('button', { name: 'Send by email instead' })).toBeVisible();
  expect((await dataLayer(page)).map(e => e.event)).not.toContain('generate_lead');

  accept = true;
  await form(page).getByRole('button', { name: 'Try again' }).click();
  await expect(rfq(page)).toContainText('HMV-2026-RETRY1');
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
});

test('Vietnamese: the same two steps and the reference in Vietnamese', async ({ page }) => {
  await page.route('**/api/inquiry', route => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-VI0001' }) }));
  await page.goto('/vi#initiate-trade', { waitUntil: 'networkidle' });
  const f = form(page);
  await expect(rfq(page).getByRole('heading', { level: 2, name: 'Cho HMV biết nhu cầu của bạn' })).toBeVisible();
  await f.getByLabel('Sản phẩm', { exact: true }).selectOption('bananas');
  await f.getByLabel('Điểm đến', { exact: true }).fill('Rotterdam, Hà Lan');
  await f.getByLabel('Sản lượng dự kiến', { exact: true }).fill('4');
  await f.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(f.getByRole('heading', { name: 'HMV có thể liên hệ với bạn qua đâu?' })).toBeFocused();
  await f.getByLabel('Công ty', { exact: true }).fill('Công ty Ví Dụ');
  await f.getByLabel('Email công việc', { exact: true }).fill('buyer@example.com');
  await f.getByLabel('Tôi đồng ý để HMV liên hệ về yêu cầu này.').check();
  await f.getByRole('button', { name: 'Gửi yêu cầu' }).click();
  await expect(rfq(page)).toContainText('HMV đã nhận yêu cầu');
  await expect(rfq(page)).toContainText('Mã tham chiếu: HMV-2026-VI0001');
});

test('"Need guidance?" opens the Trade Desk with the product, destination and volume already given', async ({ page }) => {
  await page.goto('/#initiate-trade', { waitUntil: 'networkidle' });
  const f = form(page);
  await f.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  await f.getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await f.getByLabel('Estimated volume', { exact: true }).fill('500');
  // Not before the buyer has started (the hero has the assisted lane); from the first answer on, with what was typed.
  await expect(rfq(page)).toContainText('Use HMV Trade Desk for sourcing, logistics or requirement support.');
  await rfq(page).getByRole('button', { name: 'Open HMV Trade Desk' }).click();
  await expect(desk(page)).toBeVisible();
  await expect(desk(page).getByRole('log').locator('.desk-msg')).toHaveText([
    'HMVWhere would you like the goods delivered?',
    'YouBusan, South Korea',
    'HMVWhat volume are you planning to purchase?',
    'You500 MT / month',
    /^HMVThank you\. I have enough information to open a commercial inquiry/,
  ]);
  await expect(desk(page).getByRole('button', { name: 'Request Quotation' })).toBeFocused();
  const events = await dataLayer(page);
  expect(events.at(-2)).toEqual({ event: 'trade_desk_open', source: 'quick_rfq', product: 'dried-cassava-chips', locale: 'en' });
  expect(JSON.stringify(events)).not.toMatch(/Busan|500/);
});

test('keyboard: the whole fast lane is reachable and submittable with the keyboard', async ({ page }) => {
  await page.route('**/api/inquiry', route => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-KEY001' }) }));
  await page.goto('/#initiate-trade', { waitUntil: 'networkidle' });
  await form(page).getByLabel('Product', { exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Chennai, India');
  await page.keyboard.press('Tab');
  await page.keyboard.type('2,000');
  await page.keyboard.press('Enter');
  await expect(form(page).getByRole('heading', { name: 'Where should HMV contact you?' })).toBeFocused();
  // The heading has focus: Edit comes first, then the company and the email.
  await page.keyboard.press('Tab');
  await expect(form(page).getByRole('button', { name: 'Edit' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.type('Example Foods B.V.');
  await page.keyboard.press('Tab');
  await page.keyboard.type('buyer@example.com');
  await form(page).getByLabel('HMV may contact me about this inquiry.').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Enter');
  await expect(rfq(page)).toContainText('HMV-2026-KEY001');
});
