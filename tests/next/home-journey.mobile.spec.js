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

/** The hero, its photograph and the Quick RFQ card, from the top of the page. */
const stack = page => page.evaluate(() => {
  const r = sel => { const b = document.querySelector(sel)?.getBoundingClientRect(); return b ? { top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY), left: Math.round(b.left), right: Math.round(b.right) } : null; };
  const first = document.querySelector('#initiate-trade select');
  return { copy: r('.day-copy'), actions: r('.day-actions'), stage: r('.day-visual'), ocean: r('.day-ocean'), hero: r('header.day-hero'), card: r('#initiate-trade form'), first: first ? Math.round(first.getBoundingClientRect().top + scrollY) : null, vw: innerWidth };
});

test('mobile first screen: the hero\'s proposition, its two lanes and its photograph; the Quick RFQ is its own card right after the photograph', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const hero = page.locator('header.day-hero');
  await expect(hero.locator('h1')).toBeInViewport();
  await expect(hero.getByRole('button', { name: 'Get Supply Proposal' })).toBeInViewport({ ratio: 1 });
  await expect(hero.getByRole('button', { name: 'Need guidance? Ask HMV Trade Desk' })).toBeInViewport({ ratio: 1 });
  // The photograph begins on the first screen: the buyer sees the company, not a form over it.
  await expect(hero.locator('img.day-farm')).toBeInViewport();
  expect(await noSidewaysScroll(page)).toBe(true);
  await expect(sticky(page)).toBeHidden();

  // Hero copy, its lanes, the photograph, then the card: in that order, the card clear of the photograph and of the ship
  // that overhangs it, a small step below it, and the first control directly under the card's heading.
  const s = await stack(page);
  expect(s.actions.bottom).toBeLessThanOrEqual(s.stage.top);
  expect(s.card.top).toBeGreaterThanOrEqual(s.stage.bottom);
  expect(s.card.top).toBeGreaterThanOrEqual(s.ocean.bottom);
  expect(s.card.top - s.stage.bottom).toBeLessThanOrEqual(80);
  expect(s.card.top).toBeGreaterThanOrEqual(s.hero.bottom - 24);
  expect(s.first - s.card.top).toBeLessThanOrEqual(240);
  // The card is a card: inside the page's width, with its heading shown (it is not over a picture to hide behind).
  expect(s.card.left).toBeGreaterThanOrEqual(0);
  expect(s.card.right).toBeLessThanOrEqual(s.vw);
  await expect(page.locator('h2#rfq-title')).toBeVisible();
  expect(await page.locator('h2#rfq-title').evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan(100);
});

test('mobile, other phones: 360, 390 and 430 wide: no overflow, the card follows the photograph, nothing over it', async ({ page }) => {
  for (const [width, height] of [[360, 640], [390, 844], [430, 932]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/', { waitUntil: 'networkidle' });
    const s = await stack(page);
    expect(await noSidewaysScroll(page), `no overflow at ${width}`).toBe(true);
    expect(s.card.top, `card after the photograph at ${width}`).toBeGreaterThanOrEqual(s.stage.bottom);
    expect(s.card.top, `card after the ship at ${width}`).toBeGreaterThanOrEqual(s.ocean.bottom);
    expect(s.card.right).toBeLessThanOrEqual(width);
    await expect(page.locator('header.day-hero').getByRole('button', { name: 'Get Supply Proposal' })).toBeInViewport({ ratio: 1 });
  }
});

test('mobile, Vietnamese: the same order, the card right after the photograph', async ({ page }) => {
  await page.goto('/vi', { waitUntil: 'networkidle' });
  const s = await stack(page);
  expect(s.card.top).toBeGreaterThanOrEqual(s.stage.bottom);
  expect(s.card.top - s.stage.bottom).toBeLessThanOrEqual(80);
  expect(s.first - s.card.top).toBeLessThanOrEqual(280);
  await expect(page.getByRole('heading', { level: 2, name: 'Cho HMV biết nhu cầu của bạn' })).toBeVisible();
  expect(await noSidewaysScroll(page)).toBe(true);
});

test('mobile: Get Supply Proposal takes the buyer down to the card: the first question is on screen and focused', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('header.day-hero').getByRole('button', { name: 'Get Supply Proposal' }).click();
  const first = form(page).getByLabel('Product', { exact: true });
  await expect(first).toBeFocused();
  await expect(first).toBeInViewport({ ratio: 1 });
  expect(await noSidewaysScroll(page)).toBe(true);
});

test('mobile: the controls are still comfortable: nothing under 44 px to touch, fields at 16 px (no zoom on focus)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const found = await form(page).evaluate(el => [...el.querySelectorAll('input:not(.desk-hp), select, button')]
    .filter(c => c.getClientRects().length)
    .map(c => ({
      name: c.id || c.textContent?.trim() || c.tagName,
      height: Math.round(c.getBoundingClientRect().height),
      field: !(c instanceof HTMLButtonElement),
      font: Number.parseFloat(getComputedStyle(c).fontSize),
    })));
  expect(found.length).toBeGreaterThanOrEqual(5);
  expect(found.filter(c => c.height < 44)).toEqual([]);
  expect(found.filter(c => c.field && c.font < 16)).toEqual([]);
});

test('sticky: absent at the top, there once the form is behind the buyer, gone while the form is in view', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(sticky(page)).toBeHidden();
  // Still at the top, part of the form below the fold: nothing to return to yet.
  await scrollTo(page, '#initiate-trade', 400);
  await expect(sticky(page)).toBeHidden();

  // Past the form (the products): the button shows, at the bottom edge, a real touch target, clear of the screen's edge.
  await scrollTo(page, '#featured-products', 0);
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

test('sticky: a jump past a form that started below the fold (a small phone) still shows it', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 480 });
  await page.goto('/', { waitUntil: 'networkidle' });
  // The form is below the fold here: it is never in view before or after the jump.
  expect(await page.evaluate(() => document.querySelector('#initiate-trade')?.getBoundingClientRect().top)).toBeGreaterThan(480);
  await expect(sticky(page)).toBeHidden();
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 3500); });
  await expect(sticky(page)).toBeVisible();
  await stickyButton(page).click();
  await expect(form(page).getByLabel('Product', { exact: true })).toBeFocused();
  await expect(sticky(page)).toBeHidden();
});

test('sticky: on a phone only: at 600 px it shows, from 601 px (a tablet) never, however far the buyer has scrolled', async ({ page }) => {
  for (const [width, phone] of [[600, true], [601, false], [768, false], [900, false]]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await scrollTo(page, '#featured-products', 0);
    // Past the form and short of the closing call to action: the button's state is "shown" at every width...
    await expect.poll(() => sticky(page).evaluate(el => el.hidden), { message: `state at ${width}px` }).toBe(false);
    // ...and the stylesheet decides whether a phone sees it.
    expect(await sticky(page).evaluate(el => getComputedStyle(el).display !== 'none'), `visible at ${width}px`).toBe(phone);
    await expect(sticky(page)).toBeVisible({ visible: phone });
  }
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
  await scrollTo(page, '#featured-products', 0);
  await expect(sticky(page)).toBeVisible();
  expect(await sticky(page).evaluate(el => getComputedStyle(el).animationName)).not.toBe('none');

  const context = await browser.newContext({ reducedMotion: 'reduce', baseURL, viewport: { width: 375, height: 667 } });
  const calm = await context.newPage();
  await calm.goto('/', { waitUntil: 'networkidle' });
  await scrollTo(calm, '#featured-products', 0);
  await expect(sticky(calm)).toBeVisible();
  expect(await sticky(calm).evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await context.close();
});

test('the Trade Desk is not blocked by the bar: it opens over it and closes back to the page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await scrollTo(page, '#featured-products', 0);
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
