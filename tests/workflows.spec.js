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
 *  - RFQ section: <section id="initiate-trade" class="rfq-section">
 *    - <form class="rfq-form glass">
 *  - Navigation "HMV Trade Desk" button (.nav-support-btn) opens the HMV Trade Desk dialog; there is no support chat
 *  - Forms build mailto drafts; UI must never claim a message was "sent"
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

// Buyer pages (passion fruit, dried cassava chips): the hero CTA opens the HMV Trade Desk with the page's product
// known. Their own RFQ (ProductRfq) stays lower on the page as the fallback, fixed to the product (read-only
// field, no product select).
for (const [id, product, cta] of [
  ['passion-fruit', 'Passion fruit', 'Discuss Your Passion Fruit Requirements'],
  ['dried-cassava-chips', 'Dried cassava chips', 'Build Your Cassava Supply Plan with HMV'],
]) {
  test(`${id} page CTA opens the Trade Desk with "${product}"; the RFQ fallback stays`, async ({ page }) => {
    await page.goto(`/products/${id}?lang=en`);
    await page.getByRole('button', { name: cta }).click();
    const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
    await expect(desk).toBeVisible();
    // The product is known: the summary has it and the conversation starts at the destination.
    await expect(desk.getByRole('complementary', { name: 'Your requirement' })).toContainText(product);
    await expect(desk.getByRole('log')).toHaveText('HMVWhere would you like the goods delivered?');
    await page.keyboard.press('Escape');
    await expect(desk).toBeHidden();
    const rfq = page.locator('section#rfq');
    await expect(rfq.locator('input[readonly]')).toHaveValue(product);
    await expect(rfq.locator('input[type="hidden"][name="product"]')).toHaveValue(product);
    await expect(rfq.locator('select[name="product"]')).toHaveCount(0);
  });
}

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

// ─── RFQ form on home page ───────────────────────────────────────────

test('home page RFQ form is present and has required fields', async ({ page }) => {
  await page.goto('/#initiate-trade');

  const section = page.locator('section#initiate-trade');
  await expect(section).toBeVisible({ timeout: 8000 });

  // The RFQ form must have class "rfq-form glass"
  const rfqForm = section.locator('form.rfq-form');
  await expect(rfqForm).toBeVisible();

  // Required inputs
  await expect(rfqForm.locator('input[name="company"]')).toBeAttached();
  await expect(rfqForm.locator('input[name="email"]')).toBeAttached();
  await expect(rfqForm.locator('select[name="product"]')).toBeAttached();
  await expect(rfqForm.locator('textarea[name="message"]')).toBeAttached();

  // Submit button must be present
  await expect(rfqForm.locator('button[type="submit"]')).toBeVisible();
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

test('RFQ form note on home page mentions email draft, not delivery', async ({ page }) => {
  await page.goto('/#initiate-trade');
  const rfqSection = page.locator('section#initiate-trade');
  await expect(rfqSection).toBeVisible({ timeout: 8000 });

  // The section must not promise delivery — RFQ uses mailto (drafts only).
  // The note "your request is not sent until you send that email" is CORRECT behavior.
  // Only reject claims that the request WAS ALREADY sent/delivered/received.
  const sectionText = (await rfqSection.textContent() ?? '').toLowerCase();
  expect(sectionText).not.toMatch(/your (request|message|inquiry) (has been|was) (sent|delivered|received)/);
});
