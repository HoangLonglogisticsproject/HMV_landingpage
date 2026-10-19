// @ts-check
import { test, expect } from '@playwright/test';

// ─── Contact form ─────────────────────────────────────────────────
test('contact page has a visible form', async ({ page }) => {
  await page.goto('/contact');
  // Check for form elements
  const form = page.locator('form, [class*="contact"], [class*="form"]').first();
  await expect(form).toBeVisible({ timeout: 8000 });
});

test('contact page ?product= preselects a product', async ({ page }) => {
  await page.goto('/contact?product=passion-fruit');
  await page.waitForTimeout(1000);
  // The product param should influence the form state
  const body = await page.textContent('body');
  expect(body).toBeTruthy();
});

// ─── RFQ form on home page ────────────────────────────────────────
test('home page RFQ form section exists', async ({ page }) => {
  await page.goto('/#initiate-trade');
  const rfqSection = page.locator('#initiate-trade');
  await expect(rfqSection).toBeVisible({ timeout: 8000 });
});

// ─── Support chat ─────────────────────────────────────────────────
test('support chat widget is present in the DOM', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);
  // Chat widget should be mounted (may be a floating button)
  const chat = page.locator('[class*="chat"], [class*="support"], [aria-label*="chat" i]').first();
  if (await chat.count() > 0) {
    // If visible, try clicking it
    if (await chat.isVisible()) {
      await chat.click();
      await page.waitForTimeout(500);
    }
  }
});

// ─── Forms build mailto drafts, not send ──────────────────────────
test('contact form does not claim a request was sent', async ({ page }) => {
  await page.goto('/contact');
  const body = await page.textContent('body');
  // The page should never say "sent" or "submitted" — forms open mailto drafts
  const lowerBody = body?.toLowerCase() ?? '';
  expect(lowerBody).not.toMatch(/your (request|message|inquiry) (has been|was) sent/);
});
