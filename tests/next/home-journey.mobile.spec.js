// @ts-check
import { test, expect } from '@playwright/test';

/**
 * The homepage journey on a phone (375×667; collected only by the chromium-mobile project): the first screen leads to the
 * form, and the sticky "Get Supply Proposal" shows only after the buyer has scrolled past it, goes while the form is
 * in view and at the closing call to action, and brings the buyer back to the same form.
 */

const form = page => page.locator('#initiate-trade form');
const sticky = page => page.locator('[data-sticky-supply-cta]');
const stickyButton = page => sticky(page).getByRole('button', { name: 'Get Supply Proposal' });
const noSidewaysScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
/** Scrolls so that `selector`'s top is `offset` px below the viewport's top, instantly. */
const scrollTo = (page, selector, offset = 0) => page.evaluate(([sel, off]) => {
  document.documentElement.style.scrollBehavior = 'auto';
  scrollTo(0, /** @type {HTMLElement} */ (document.querySelector(sel)).getBoundingClientRect().top + scrollY - off);
}, [selector, offset]);

test('mobile first screen: the proposition, the primary lane, the assisted link and the start of the form; the photograph is after the form', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const hero = page.locator('header.day-hero');
  await expect(hero.locator('h1')).toBeInViewport();
  await expect(hero.getByRole('button', { name: 'Get Supply Proposal' })).toBeInViewport({ ratio: 1 });
  await expect(hero.getByRole('button', { name: 'Need guidance? Ask HMV Trade Desk' })).toBeInViewport({ ratio: 1 });
  // The form's own heading is on the first screen: the buyer sees where to start without scrolling.
  await expect(page.locator('h2#rfq-title')).toBeInViewport({ ratio: 1 });
  expect(await noSidewaysScroll(page)).toBe(true);
  await expect(sticky(page)).toBeHidden();

  // Nothing large sits between the hero's calls to action and the form; the photograph follows the form.
  const boxes = await page.evaluate(() => {
    const r = sel => { const b = document.querySelector(sel)?.getBoundingClientRect(); return b ? { top: b.top + scrollY, bottom: b.bottom + scrollY } : null; };
    return { actions: r('.day-actions'), form: r('#initiate-trade'), visual: r('.day-visual') };
  });
  expect(boxes.form.top - boxes.actions.bottom).toBeLessThan(60);
  expect(boxes.visual.top).toBeGreaterThanOrEqual(boxes.form.bottom);
});

test('mobile, a taller phone: the first question of the form is on the first screen too', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(form(page).getByLabel('Product', { exact: true })).toBeInViewport({ ratio: 1 });
  expect(await noSidewaysScroll(page)).toBe(true);
});

test('sticky: absent at the top, there once the form is behind the buyer, gone while the form is in view', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(sticky(page)).toBeHidden();
  // Still at the top, part of the form below the fold: nothing to return to yet.
  await scrollTo(page, '#initiate-trade', 400);
  await expect(sticky(page)).toBeHidden();

  // Past the form (the products): the button shows, at the bottom edge, a real touch target, clear of the screen's edge.
  await scrollTo(page, '#featured-products', 100);
  await expect(sticky(page)).toBeVisible();
  // Measured at rest: with normal motion it eases in over a few hundred milliseconds.
  await sticky(page).evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
  const box = /** @type {{ x: number, y: number, width: number, height: number }} */ (await stickyButton(page).boundingBox());
  const viewport = /** @type {{ width: number, height: number }} */ (page.viewportSize());
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(viewport.height - (box.y + box.height)).toBeGreaterThanOrEqual(12);
  expect(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-sticky-supply-cta]')).paddingBottom))).toBeGreaterThanOrEqual(12);
  expect(await noSidewaysScroll(page)).toBe(true);

  // Back up to the form: it goes.
  await scrollTo(page, '#initiate-trade', 120);
  await expect(sticky(page)).toBeHidden();
  // Down again, further: it comes back.
  await scrollTo(page, '#value-journey', 0);
  await expect(sticky(page)).toBeVisible();
});

test('sticky: a jump past a form that started below the fold (a landscape phone) still shows it', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('/', { waitUntil: 'networkidle' });
  // The form is below the fold here: it is never in view before or after the jump.
  expect(await page.evaluate(() => document.querySelector('#initiate-trade')?.getBoundingClientRect().top)).toBeGreaterThan(375);
  await expect(sticky(page)).toBeHidden();
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 3500); });
  await expect(sticky(page)).toBeVisible();
  await stickyButton(page).click();
  await expect(form(page).getByLabel('Product', { exact: true })).toBeFocused();
  await expect(sticky(page)).toBeHidden();
});

test('sticky: it takes the buyer back to the same form, with what they typed, focused; no popup, no history entry', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const f = form(page);
  await f.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  await f.getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await f.getByLabel('Estimated volume', { exact: true }).fill('500');
  await page.evaluate(() => { document.querySelector('#initiate-trade form')?.setAttribute('data-mounted-once', 'yes'); });
  const history = await page.evaluate(() => window.history.length);

  await scrollTo(page, '#value-journey', 0);
  await expect(sticky(page)).toBeVisible();
  await stickyButton(page).click();

  await expect(f.getByLabel('Product', { exact: true })).toBeFocused();
  await expect(f.getByLabel('Product', { exact: true })).toBeInViewport();
  await expect(f.getByLabel('Destination', { exact: true })).toHaveValue('Busan, South Korea');
  await expect(f.getByLabel('Estimated volume', { exact: true })).toHaveValue('500');
  await expect(f).toHaveAttribute('data-mounted-once', 'yes');
  // The form is in view again: the bar is gone. No dialog, no new history entry, the address unchanged.
  await expect(sticky(page)).toBeHidden();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => window.history.length)).toBe(history);
  expect(new URL(page.url()).hash).toBe('');
  expect((await page.evaluate(() => /** @type {any} */ (window).dataLayer ?? [])).at(-1)).toEqual({ event: 'home_supply_plan_click', source: 'sticky', locale: 'en' });

  // On the contact step the button returns the buyer to that step.
  await f.getByRole('button', { name: 'Continue' }).click();
  await f.getByLabel('Company', { exact: true }).fill('Example Foods B.V.');
  await scrollTo(page, '#value-journey', 0);
  await expect(sticky(page)).toBeVisible();
  await stickyButton(page).click();
  await expect(f.getByRole('heading', { name: 'Where should HMV contact you?' })).toBeFocused();
  await expect(f.getByLabel('Company', { exact: true })).toHaveValue('Example Foods B.V.');
});

test('sticky: gone from the closing call to action on, so it never covers the end of the page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await scrollTo(page, '#value-journey', 0);
  await expect(sticky(page)).toBeVisible();
  await scrollTo(page, '[data-final-cta]', 300);
  await expect(sticky(page)).toBeHidden();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect(sticky(page)).toBeHidden();
  // The footer is whole: its last line is not under anything.
  const covered = await page.evaluate(() => {
    const last = document.querySelector('footer')?.lastElementChild?.getBoundingClientRect();
    if (!last) return null;
    const el = document.elementFromPoint(last.left + 4, Math.min(last.bottom - 2, innerHeight - 2));
    return !!el?.closest('[data-sticky-supply-cta]');
  });
  expect(covered).toBe(false);
});

test('sticky, normal motion: it eases in; with reduced motion it does not animate', async ({ page, browser, baseURL }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await scrollTo(page, '#featured-products', 100);
  await expect(sticky(page)).toBeVisible();
  expect(await sticky(page).evaluate(el => getComputedStyle(el).animationName)).not.toBe('none');

  const context = await browser.newContext({ reducedMotion: 'reduce', baseURL, viewport: { width: 375, height: 667 } });
  const calm = await context.newPage();
  await calm.goto('/', { waitUntil: 'networkidle' });
  await scrollTo(calm, '#featured-products', 100);
  await expect(sticky(calm)).toBeVisible();
  expect(await sticky(calm).evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await context.close();
});

test('the Trade Desk is not blocked by the bar: it opens over it and closes back to the page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await scrollTo(page, '#featured-products', 100);
  await expect(sticky(page)).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-hmv-trade-desk', { detail: { source: 'test' } })));
  const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
  await expect(desk).toBeVisible();
  const top = await page.evaluate(() => {
    const bar = /** @type {HTMLElement} */ (document.querySelector('[data-sticky-supply-cta]')).getBoundingClientRect();
    const hit = document.elementFromPoint(bar.left + bar.width / 2, bar.top + bar.height / 2);
    return !!hit?.closest('[role="dialog"], .desk-overlay');
  });
  expect(top).toBe(true);
  await page.keyboard.press('Escape');
  await expect(desk).toBeHidden();
});
