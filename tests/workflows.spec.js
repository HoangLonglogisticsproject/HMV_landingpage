// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Business workflow tests.
 *
 * Known facts from source:
 *  - Contact form: <form class="inquiry-form"> inside Contact.jsx (full=true)
 *    - <select name="product" defaultValue={params.get('product') || ''}>
 *    - Option values are p.en strings: "Passion fruit", "Cavendish bananas", etc.
 *    - passion-fruit → option value "Passion fruit" (from products[0].en)
 *  - Quick RFQ section: <section id="initiate-trade" class="rfq-section">
 *    - <form class="rfq-form glass">, two steps (requirement, contact), submitted to the inquiry port
 *  - Navigation "HMV Trade Desk" button (.nav-support-btn) opens the HMV Trade Desk dialog; there is no support chat
 *  - The contact form and the product-page RFQ build mailto drafts; UI must never claim a message was "sent"
 */

// ─── Contact page ────────────────────────────────────────────────────

test('contact page renders the inquiry form with expected fields', async ({ page }) => {
  await page.goto('/contact');

  // The full contact form is rendered with class="inquiry-form"
  const form = page.locator('form.inquiry-form');
  await expect(form).toBeVisible({ timeout: 8000 });

  // Required input fields must be present
  await expect(form.locator('input[name="name"]')).toBeAttached();
  await expect(form.locator('input[name="email"]')).toBeAttached();
  await expect(form.locator('input[name="company"]')).toBeAttached();
  await expect(form.locator('select[name="product"]')).toBeAttached();
  await expect(form.locator('textarea[name="message"]')).toBeAttached();
});

// ─── Product → Contact E2E flow ────────────────────────────────────
//
// Source facts:
//  - ProductDetailPage inquiry button: <Link to={`/contact?product=${encodeURIComponent(product.en)}`}>
//  - product.en values: 'Passion fruit', 'Cavendish bananas', etc. (from data/hmv.js)
//  - Contact select: <option value={p.en}> — value IS p.en, not p.id
//  - select defaultValue={params.get('product') || ''}
//  - URL param 'Passion fruit' → defaultValue 'Passion fruit' → matches option → preselected

// Golden passion fruit, International Buyers: the hero's Trade Desk button opens the desk with the page's product known;
// the page's one form is the Quick RFQ, fixed to the product (it asks no product).
test('passion-fruit page: the hero opens the Trade Desk with "Passion fruit"; the Quick RFQ stays', async ({ page }) => {
  await page.goto('/products/passion-fruit?lang=en');
  await page.getByRole('button', { name: 'Ask HMV Trade Desk' }).click();
  const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
  await expect(desk).toBeVisible();
  // The product is known: the summary has it and the conversation starts at the destination.
  await expect(desk.getByRole('complementary', { name: 'Your requirement' })).toContainText('Passion fruit');
  await expect(desk.getByRole('log')).toHaveText('HMVWhere would you like the goods delivered?');
  await page.keyboard.press('Escape');
  await expect(desk).toBeHidden();
  const rfq = page.locator('section#rfq');
  await expect(rfq.locator('form')).toBeAttached();
  await expect(rfq.getByLabel('Product', { exact: true })).toHaveCount(0);
});

// The two other segments are their own pages on the Vite site as well, with their own heading and Trade Desk button.
for (const [path, h1, cta] of [
  ['/products/passion-fruit/foodservice', 'Golden Passion Fruit for Professional Food & Beverage', 'Discuss Your Supply Needs'],
  ['/products/passion-fruit/retail', 'Golden Passion Fruit for Retail & Distribution', 'Discuss a Retail Partnership'],
]) {
  test(`${path}: its own heading; the button opens the Trade Desk with "Passion fruit"`, async ({ page }) => {
    await page.goto(`${path}?lang=en`);
    await expect(page.locator('h1')).toHaveText(h1);
    // The hero's button; the partnership section repeats the Retail label.
    await page.getByRole('button', { name: cta }).first().click();
    const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
    await expect(desk.getByRole('complementary', { name: 'Your requirement' })).toContainText('Passion fruit');
  });
}

// Dried cassava chips: the procurement page (views/products/CassavaProcurement). Both calls to action open the HMV Trade
// Desk with the product known; there is no RFQ form or email draft on the page.
test('dried-cassava-chips: the hero and the closing call to action open the Trade Desk with the product; no RFQ form', async ({ page }) => {
  await page.goto('/products/dried-cassava-chips?lang=en');
  const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
  for (const [section, cta] of [['#overview', 'Build Your Cassava Supply Plan with HMV'], ['#rfq', 'Send your requirement to HMV']]) {
    await page.locator(section).getByRole('button', { name: cta }).click();
    await expect(desk).toBeVisible();
    await expect(desk.getByRole('complementary', { name: 'Your requirement' })).toContainText('Dried cassava chips');
    await page.keyboard.press('Escape');
    await expect(desk).toBeHidden();
  }
  await expect(page.locator('form, input[name="product"]')).toHaveCount(0);
});

test('ProductDetailPage inquiry button for bananas preselects "Cavendish bananas"', async ({ page }) => {
  await page.goto('/products/bananas?lang=en');
  await expect(page).toHaveURL(/\/products\/bananas/, { timeout: 5000 });
  await page.waitForLoadState('networkidle');

  const inquiryBtn = page.locator('a[href*="/contact?product="]').first();
  await expect(inquiryBtn).toBeVisible({ timeout: 5000 });

  await Promise.all([
    page.waitForURL(/\/contact/, { timeout: 5000 }),
    inquiryBtn.click(),
  ]);

  const params = new URL(page.url()).searchParams;
  expect(params.get('product')).toBe('Cavendish bananas');

  await page.waitForLoadState('networkidle');
  const select = page.locator('form.inquiry-form select[name="product"]');
  const selectedValue = await select.evaluate((el) => el.value);
  expect(selectedValue).toBe('Cavendish bananas');
});

// ─── Quick RFQ on home page ──────────────────────────────────────────

test('home page Quick RFQ asks the requirement first, then the contact', async ({ page }) => {
  await page.goto('/#initiate-trade');

  const section = page.locator('section#initiate-trade');
  await expect(section).toBeVisible({ timeout: 8000 });

  // The form keeps its class "rfq-form glass"; step 1 is the requirement only
  const rfqForm = section.locator('form.rfq-form');
  await expect(rfqForm).toBeVisible();
  await expect(rfqForm.getByLabel('Product', { exact: true })).toBeAttached();
  await expect(rfqForm.getByLabel('Destination', { exact: true })).toBeAttached();
  await expect(rfqForm.getByLabel('Estimated volume', { exact: true })).toBeAttached();
  await expect(rfqForm.getByLabel('Company', { exact: true })).toHaveCount(0);
  await expect(rfqForm.locator('textarea')).toHaveCount(0);

  await rfqForm.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  await rfqForm.getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await rfqForm.getByLabel('Estimated volume', { exact: true }).fill('500');
  await rfqForm.getByRole('button', { name: 'Continue' }).click();

  // Step 2: company, work email, consent; the page stays where it is
  await expect(rfqForm.getByRole('heading', { name: 'Where should HMV contact you?' })).toBeFocused();
  await expect(rfqForm.getByLabel('Company', { exact: true })).toBeVisible();
  await expect(rfqForm.getByLabel('Work email', { exact: true })).toBeVisible();
  await expect(rfqForm.getByLabel('HMV may contact me about this inquiry.')).not.toBeChecked();
  await expect(rfqForm.getByRole('button', { name: 'Send Request' })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/');
});

// ─── HMV Trade Desk (replaces the support chat) ─────────────────────

test('the navigation "HMV Trade Desk" button opens the Trade Desk; there is no support chat', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('#chat-launcher-btn')).toHaveCount(0);
  const cta = page.locator('nav .nav-support-btn');
  await expect(cta).toHaveText('HMV Trade Desk');
  await expect(page.locator('body')).not.toContainText(/24\/7 Support|Support Chat|LIVE SUPPORT/);
  await cta.click();
  await expect(page.getByRole('dialog', { name: 'HMV Trade Desk' })).toBeVisible({ timeout: 8000 });
});

// ─── Mailto draft — must never claim message was sent ───────────────

test('contact form copy says "draft prepared", never "sent"', async ({ page }) => {
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');

  const pageText = (await page.textContent('body') ?? '').toLowerCase();

  // The form note must mention "draft" (copy.en.emailNote contains "draft")
  expect(pageText).toMatch(/draft/);

  // The page must NEVER assert that a message was already sent
  expect(pageText).not.toMatch(/your (request|message|inquiry|email) (has been|was|is) sent/);
  expect(pageText).not.toMatch(/(successfully|thank you).{0,40}sent/);
});

test('home page Quick RFQ never claims a request was received unless the server accepted it', async ({ page }) => {
  // The Vite build has no endpoint (the inquiry port answers 503): the form says it could not send, and only then
  // offers the email draft.
  await page.goto('/#initiate-trade');
  const rfqSection = page.locator('section#initiate-trade');
  await expect(rfqSection).toBeVisible({ timeout: 8000 });
  await expect(rfqSection.getByRole('button', { name: 'Send by email instead' })).toHaveCount(0);

  const form = rfqSection.locator('form.rfq-form');
  await form.getByLabel('Product', { exact: true }).selectOption('passion-fruit');
  await form.getByLabel('Destination', { exact: true }).fill('Rotterdam, Netherlands');
  await form.getByLabel('Estimated volume', { exact: true }).fill('2');
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByLabel('Company', { exact: true }).fill('Example Foods B.V.');
  await form.getByLabel('Work email', { exact: true }).fill('buyer@example.com');
  await form.getByLabel('HMV may contact me about this inquiry.').check();
  await form.getByRole('button', { name: 'Send Request' }).click();

  await expect(form.getByRole('alert')).toContainText('We could not send your request');
  await expect(form.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(form.getByRole('button', { name: 'Send by email instead' })).toBeVisible();
  const sectionText = (await rfqSection.textContent() ?? '').toLowerCase();
  expect(sectionText).not.toMatch(/request received|your (request|message|inquiry) (has been|was) (sent|delivered|received)/);
});
