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
 *  - Support chat launcher: <button id="chat-launcher-btn"
 *                              aria-label="Open 24/7 Support Chat"> (en)
 *                           only rendered when !isOpen
 *  - After clicking the launcher, the chat panel renders class="hmv-chat-panel"
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

test('ProductDetailPage inquiry button navigates to /contact with correct product preselected (EN)', async ({ page }) => {
  // Start in English so product.en labels are rendered
  await page.goto('/products/passion-fruit?lang=en');
  await expect(page).toHaveURL(/\/products\/passion-fruit/, { timeout: 5000 });
  await page.waitForLoadState('networkidle');

  // The inquiry button: <Link to="/contact?product=Passion%20fruit">
  // Rendered text = copy[lang].ask = "Discuss this product"
  const inquiryBtn = page.locator('a[href*="/contact?product="]').first();
  await expect(inquiryBtn).toBeVisible({ timeout: 5000 });

  // Click and follow the navigation
  await Promise.all([
    page.waitForURL(/\/contact/, { timeout: 5000 }),
    inquiryBtn.click(),
  ]);

  // 1. URL must contain ?product=Passion%20fruit (or decoded equivalent)
  const url = page.url();
  const params = new URL(url).searchParams;
  expect(params.get('product')).toBe('Passion fruit');

  // 2. The select must be preselected to 'Passion fruit'
  await page.waitForLoadState('networkidle');
  const select = page.locator('form.inquiry-form select[name="product"]');
  await expect(select).toBeAttached({ timeout: 5000 });
  const selectedValue = await select.evaluate((el) => el.value);
  expect(selectedValue).toBe('Passion fruit');
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

// ─── Support chat ────────────────────────────────────────────────────

test('support chat launcher button is visible and opens the chat panel', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // The launcher button: id="chat-launcher-btn", aria-label="Open 24/7 Support Chat"
  const launcher = page.locator('#chat-launcher-btn');
  await expect(launcher).toBeVisible({ timeout: 5000 });
  await expect(launcher).toHaveAttribute('aria-label', /support chat|hỗ trợ/i);

  // Clicking it must open the chat panel
  await launcher.click();
  await page.waitForTimeout(400);

  // Launcher must now be hidden (replaced by the open chat panel)
  await expect(launcher).not.toBeVisible();

  // Chat panel: <div class="hmv-apple-chat-modal" role="dialog">
  const chatPanel = page.locator('.hmv-apple-chat-modal');
  await expect(chatPanel).toBeVisible({ timeout: 3000 });
});

test('support chat is accessible via the openSupportChat() event', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Dispatch the custom event that the nav "24/7 Support" button uses
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent('open-hmv-support-chat'))
  );
  await page.waitForTimeout(400);

  // Chat panel: <div class="hmv-apple-chat-modal" role="dialog">
  const chatPanel = page.locator('.hmv-apple-chat-modal');
  await expect(chatPanel).toBeVisible({ timeout: 3000 });
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
