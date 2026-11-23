// @ts-check
import { test, expect } from '@playwright/test';

/**
 * The homepage hero on a desktop (1280×720, collected only by the chromium-desktop project): the Quick RFQ is in the
 * first screen beside the proposition, over the photograph; the photograph's stage (the LCP image's box) and its
 * request are as they were; there is no phone button; nothing overflows at the widths of the layout.
 */

const form = page => page.locator('#initiate-trade form');
const box = (page, selector) => page.locator(selector).first().evaluate(el => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y + scrollY, width: b.width, height: b.height, right: b.right, bottom: b.bottom + scrollY }; });

test('desktop first screen: the proposition, both lanes and the whole first step of the form are in view', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const hero = page.locator('header.day-hero');
  await expect(hero.locator('h1')).toBeInViewport();
  await expect(hero.getByRole('button', { name: 'Get Supply Proposal' })).toBeInViewport({ ratio: 1 });
  await expect(hero.getByRole('button', { name: 'Need guidance? Ask HMV Trade Desk' })).toBeInViewport({ ratio: 1 });
  for (const label of ['Product', 'Destination', 'Estimated volume']) await expect(form(page).getByLabel(label, { exact: true })).toBeInViewport({ ratio: 1 });
  await expect(form(page).getByRole('button', { name: 'Continue' })).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('desktop: the form shares the photograph\'s place; the copy and the form start together; the photograph\'s stage is unchanged', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const copy = await box(page, '.day-copy');
  const card = await box(page, '#initiate-trade form');
  const stage = await box(page, '.day-visual');
  // Side by side: the copy left of the form, tops aligned.
  expect(copy.right).toBeLessThanOrEqual(card.x + 1);
  expect(Math.abs(copy.y - card.y)).toBeLessThanOrEqual(2);
  // Over the photograph: the form is within its row and overlaps the stage; and the stage keeps its size (height
  // min(68svh, 620px), the box the measured LCP image fills).
  expect(card.x).toBeGreaterThan(stage.x);
  expect(card.right).toBeGreaterThan(stage.x + stage.width * 0.5);
  expect(Math.abs(stage.height - Math.min(0.68 * 720, 620))).toBeLessThanOrEqual(1);
  // The form reads over the photograph: its card is (nearly) opaque.
  const alpha = await form(page).evaluate(el => { const m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(el).backgroundColor); return m ? Number(m[1].split(/[ ,/]+/)[3] ?? 1) : 1; });
  expect(alpha).toBeGreaterThanOrEqual(0.9);
});

test('desktop: the LCP image is the same request as before: eager, high priority, its sizes, one eager image', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const hero = page.locator('header.day-hero');
  const farm = hero.locator('img.day-farm');
  await expect(farm).toHaveAttribute('loading', 'eager');
  await expect(farm).toHaveAttribute('fetchpriority', 'high');
  await expect(farm).toHaveAttribute('sizes', '(max-width: 540px) 420px, (max-width: 900px) calc(100vw - 40px), 820px');
  await expect(hero.locator('img[loading="eager"]')).toHaveCount(1);
  // The page asks for one hero photograph, once (React preloads the eager one; no second request for it).
  expect(await page.evaluate(() => performance.getEntriesByType('resource').filter(e => /fruitFarm|fruit-farm/i.test(e.name) || /url=%2F_next%2Fstatic%2Fmedia%2FfruitFarm/.test(e.name)).length)).toBeLessThanOrEqual(2);
  // The browser's LCP element is the photograph, as before.
  const lcp = await page.evaluate(() => new Promise(resolve => {
    new PerformanceObserver(list => { const last = list.getEntries().at(-1); resolve(/** @type {any} */ (last).element?.className ?? ''); }).observe({ type: 'largest-contentful-paint', buffered: true });
  }));
  expect(String(lcp)).toContain('day-farm');
});

test('desktop: no phone button, however far the buyer scrolls', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const bar = page.locator('[data-sticky-supply-cta]');
  await expect(bar).toBeHidden();
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 2500); });
  await expect(bar).toBeHidden();
  expect(await bar.evaluate(el => getComputedStyle(el).display)).toBe('none');
});

for (const width of [901, 1024, 1280, 1440, 1920]) {
  test(`desktop layout at ${width}px: the form and the photograph stay inside the page, nothing scrolls sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const card = await box(page, '#initiate-trade form');
    const copy = await box(page, '.day-copy');
    expect(card.right).toBeLessThanOrEqual(width);
    expect(card.x).toBeGreaterThanOrEqual(copy.right - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    // From 901 the two columns start together (900 and below is the single column: the next test).
    expect(Math.abs(copy.y - card.y)).toBeLessThanOrEqual(2);
  });
}

test('the single-column layout begins at 900px: copy, form, photograph in that order, and the bar is allowed', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const copy = await box(page, '.day-copy');
  const card = await box(page, '#initiate-trade form');
  const stage = await box(page, '.day-visual');
  expect(card.y).toBeGreaterThanOrEqual(copy.bottom);
  expect(stage.y).toBeGreaterThanOrEqual(card.bottom);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
