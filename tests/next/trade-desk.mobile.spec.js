// @ts-check
import { test, expect } from '@playwright/test';

/**
 * HMV Trade Desk, phone layout. Collected only by the chromium-mobile project (playwright.next.config.js), so it never
 * needs a run-time skip.
 */

const desk = page => page.getByRole('dialog', { name: 'HMV Trade Desk' });

test('mobile: the desk is a full-screen sheet', async ({ page }) => {
  await page.goto('/products/passion-fruit');
  await page.getByRole('button', { name: 'Discuss Your Passion Fruit Requirements' }).click();
  const box = await desk(page).boundingBox();
  const viewport = page.viewportSize();
  expect(box).toMatchObject({ x: 0, y: 0, width: viewport?.width, height: viewport?.height });
  await expect(desk(page).getByRole('button', { name: 'Review requirement' })).toBeInViewport();
});
