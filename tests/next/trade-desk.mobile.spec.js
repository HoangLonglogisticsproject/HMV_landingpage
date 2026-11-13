// @ts-check
import { test, expect } from '@playwright/test';

/**
 * HMV Trade Desk, phone layout. Collected only by the chromium-mobile project (playwright.next.config.js), so it never
 * needs a run-time skip.
 */

const desk = page => page.getByRole('dialog', { name: 'HMV Trade Desk' });

test('mobile: a full-screen sheet, chat first, one scroll, the requirement folded and the next step near the conversation', async ({ page }) => {
  await page.goto('/products/passion-fruit');
  await page.getByRole('button', { name: 'Discuss Your Passion Fruit Requirements' }).click();
  const box = await desk(page).boundingBox();
  const viewport = page.viewportSize();
  expect(box).toMatchObject({ x: 0, y: 0, width: viewport?.width, height: viewport?.height });

  // The requirement is one line above the conversation, folded until the buyer opens it.
  const toggle = desk(page).getByRole('button', { name: /Your requirement/ });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(desk(page).locator('.desk-summary')).toBeHidden();
  // One vertical scroll: the conversation and the requirement do not scroll on their own.
  const overflow = await desk(page).evaluate(el => ['.desk-main', '.desk-panel'].map(s => getComputedStyle(el.querySelector(s)).overflowY));
  expect(overflow).toEqual(['visible', 'visible']);
  expect(await desk(page).evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);

  await expect(desk(page).getByLabel('Delivery destination', { exact: true })).toBeInViewport();
  await desk(page).getByLabel('Delivery destination', { exact: true }).fill('Rotterdam, Netherlands');
  await desk(page).getByLabel('Delivery destination', { exact: true }).press('Enter');
  await desk(page).getByLabel('Expected volume', { exact: true }).fill('2');
  await desk(page).getByLabel('Expected volume', { exact: true }).press('Enter');
  await expect(desk(page).getByRole('button', { name: 'Request Quotation' })).toBeInViewport();
  await expect(toggle).toContainText('Ready for quotation');
  await toggle.click();
  await expect(desk(page).locator('.desk-summary')).toContainText('Rotterdam, Netherlands');

  // The contact card is inline in the conversation, not another page.
  await desk(page).getByRole('button', { name: 'Request Quotation' }).click();
  await expect(desk(page).getByLabel('Company')).toBeInViewport();
  await expect(desk(page).getByRole('log')).toContainText('Rotterdam, Netherlands');
});
