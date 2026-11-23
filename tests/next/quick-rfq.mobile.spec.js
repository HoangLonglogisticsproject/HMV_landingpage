// @ts-check
import { test, expect } from '@playwright/test';

/**
 * The Quick RFQ on a phone (375×667). Collected only by the chromium-mobile project (playwright.next.config.js), so it
 * never needs a run-time skip. The fast lane is two short steps: each fits the screen with its button, nothing scrolls
 * sideways, and every control is a comfortable touch target.
 */

const rfq = page => page.locator('section#initiate-trade');
const form = page => rfq(page).locator('form.rfq-form');
const MIN_TOUCH = 44;

/** The controls of the form on screen that a thumb has to hit, each at least 44 px high. */
async function assertTouchTargets(page) {
  const small = await form(page).evaluate((el, min) => [...el.querySelectorAll('input:not(.desk-hp):not([type="hidden"]), select, textarea, button')]
    .filter(c => c.getClientRects().length)
    // A checkbox is hit through its label row.
    .map(c => (c instanceof HTMLInputElement && c.type === 'checkbox' ? c.closest('label') : c))
    .map(c => ({ name: c.getAttribute('aria-label') || c.textContent?.trim().slice(0, 30) || c.id, height: Math.round(c.getBoundingClientRect().height) }))
    .filter(c => c.height < min), MIN_TOUCH);
  expect(small).toEqual([]);
}

const noSidewaysScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test('mobile: step 1 fits the screen with its button, no sideways scroll, touch targets of 44 px', async ({ page }) => {
  await page.goto('/#initiate-trade', { waitUntil: 'networkidle' });
  const f = form(page);
  await f.scrollIntoViewIfNeeded();
  expect(await noSidewaysScroll(page)).toBe(true);
  const viewport = /** @type {{ width: number, height: number }} */ (page.viewportSize());
  const box = /** @type {{ x: number, y: number, width: number, height: number }} */ (await f.boundingBox());
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  // The card, with the Continue button, is shorter than the screen: nothing to scroll inside the step.
  expect(box.height).toBeLessThan(viewport.height);
  await assertTouchTargets(page);
  await f.getByRole('button', { name: 'Continue' }).scrollIntoViewIfNeeded();
  await expect(f.getByRole('button', { name: 'Continue' })).toBeInViewport({ ratio: 1 });
});

test('mobile: step 2 fits the screen with its button; the optional details are folded away', async ({ page }) => {
  await page.goto('/#initiate-trade', { waitUntil: 'networkidle' });
  const f = form(page);
  await f.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  await f.getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await f.getByLabel('Estimated volume', { exact: true }).fill('500');
  await f.getByRole('button', { name: 'Continue' }).click();
  await expect(f.getByRole('heading', { name: 'Where should HMV contact you?' })).toBeFocused();
  await expect(f.getByLabel('Name optional', { exact: true })).toBeHidden();
  await expect(f.locator('textarea')).toBeHidden();
  const viewport = /** @type {{ width: number, height: number }} */ (page.viewportSize());
  const box = /** @type {{ height: number }} */ (await f.boundingBox());
  expect(box.height).toBeLessThan(viewport.height);
  expect(await noSidewaysScroll(page)).toBe(true);
  await assertTouchTargets(page);

  // Opened, the optional fields stay inside the screen's width and are touch targets too.
  await f.getByRole('button', { name: 'Add more details' }).click();
  await expect(f.getByLabel('Name optional', { exact: true })).toBeVisible();
  await expect(f.getByLabel('Additional information')).toBeVisible();
  expect(await noSidewaysScroll(page)).toBe(true);
  await assertTouchTargets(page);
});

test('mobile: the success state and the failure state stay inside the screen', async ({ page }) => {
  let accept = false;
  await page.route('**/api/inquiry', route => (accept
    ? route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) })
    : route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' })));
  await page.goto('/#initiate-trade', { waitUntil: 'networkidle' });
  const f = form(page);
  await f.getByLabel('Product', { exact: true }).selectOption('bananas');
  await f.getByLabel('Destination', { exact: true }).fill('Rotterdam, Netherlands');
  await f.getByLabel('Estimated volume', { exact: true }).fill('2');
  await f.getByRole('button', { name: 'Continue' }).click();
  await f.getByLabel('Company', { exact: true }).fill('Example Foods B.V.');
  await f.getByLabel('Work email', { exact: true }).fill('buyer@example.com');
  await f.getByLabel('HMV may contact me about this inquiry.').check();
  await f.getByRole('button', { name: 'Send Request' }).click();
  await expect(f.getByRole('alert')).toBeVisible();
  expect(await noSidewaysScroll(page)).toBe(true);
  await assertTouchTargets(page);

  accept = true;
  await f.getByRole('button', { name: 'Try again' }).click();
  await expect(rfq(page)).toContainText('HMV-2026-7KQ4XM');
  expect(await noSidewaysScroll(page)).toBe(true);
  const done = rfq(page).getByRole('region', { name: 'Request received' });
  const box = /** @type {{ x: number, width: number }} */ (await done.boundingBox());
  expect(box.x + box.width).toBeLessThanOrEqual(/** @type {{ width: number }} */ (page.viewportSize()).width);
});
