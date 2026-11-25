// @ts-check
import { test, expect } from '@playwright/test';

/**
 * The homepage hero and the Quick RFQ strip on a desktop (1280×720, collected only by the chromium-desktop project): the
 * hero is the company's story and photography, whole and uncovered; the Quick RFQ is a compact horizontal strip attached
 * directly below it; the photograph's stage (the LCP image's box) and its request are as they always were; there is no
 * phone button; nothing overflows at the widths of the layout.
 */

const form = page => page.locator('#initiate-trade form');
const box = (page, selector) => page.locator(selector).first().evaluate(el => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y + scrollY, width: b.width, height: b.height, right: b.right, bottom: b.bottom + scrollY }; });
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test('desktop first screen: the whole hero is in view, photography and both lanes; the strip follows directly below', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const hero = page.locator('header.day-hero');
  await expect(hero.locator('h1')).toBeInViewport({ ratio: 1 });
  await expect(hero.getByRole('button', { name: 'Get Supply Proposal' })).toBeInViewport({ ratio: 1 });
  await expect(hero.getByRole('button', { name: 'Need guidance? Ask HMV Trade Desk' })).toBeInViewport({ ratio: 1 });
  // The photography is whole on the first screen: the photograph, the ship, the chip.
  await expect(hero.locator('img.day-farm')).toBeInViewport({ ratio: 1 });
  await expect(hero.locator('.day-ocean')).toBeInViewport({ ratio: 1 });
  await expect(hero.locator('.day-chip')).toBeInViewport({ ratio: 1 });
  expect(await noOverflow(page)).toBe(true);

  // The strip is attached to the hero: it begins within a few pixels of the hero's bottom edge, a little below the first screen.
  const h = await box(page, 'header.day-hero');
  const strip = await box(page, '#initiate-trade form');
  expect(strip.y).toBeGreaterThanOrEqual(h.bottom - 40);
  expect(strip.y).toBeLessThanOrEqual(h.bottom);
  // The first screen is the hero's: the strip may begin below it, and the primary lane leads to it (home-journey.spec.js).
  expect(strip.y).toBeLessThan(720 + 120);
});

test('desktop: nothing covers the hero: the form is clear of the photograph, the ship and the chip, and the topmost element over each is the photography', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const stage = await box(page, '.day-visual');
  const strip = await box(page, '#initiate-trade form');
  // Geometry: the strip begins below the photograph's stage, never over it.
  expect(strip.y).toBeGreaterThanOrEqual(stage.bottom);
  // What is painted: sampled over the whole stage (a 5 × 5 grid), the element on top belongs to the hero's photography.
  const covered = await page.evaluate(() => {
    const stageEl = /** @type {HTMLElement} */ (document.querySelector('.day-visual'));
    const b = stageEl.getBoundingClientRect();
    const hits = [];
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const x = b.left + (b.width * (i + 0.5)) / 5;
      const y = b.top + (b.height * (j + 0.5)) / 5;
      const top = document.elementFromPoint(x, y);
      if (!top?.closest('.day-visual')) hits.push(`${Math.round(x)},${Math.round(y)}: ${top?.tagName}.${top?.className}`);
    }
    return hits;
  });
  expect(covered).toEqual([]);
  // And the form is not part of the hero at all.
  await expect(page.locator('header.day-hero form, header.day-hero #initiate-trade')).toHaveCount(0);
});

test('desktop: the photograph keeps its size and its place: the stage is as it was, the copy on its left', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const copy = await box(page, '.day-copy');
  const stage = await box(page, '.day-visual');
  expect(copy.right).toBeLessThanOrEqual(stage.x + 1);
  // min(68svh, 620px): the box the measured LCP image fills.
  expect(Math.abs(stage.height - Math.min(0.68 * 720, 620))).toBeLessThanOrEqual(1);
  expect(Math.round(stage.width)).toBe(576);
  // The photograph itself fills the stage: a visible part of the hero, not a thumbnail.
  const farm = await box(page, 'img.day-farm');
  expect(farm.width).toBeGreaterThanOrEqual(stage.width - 1);
  expect(farm.height).toBeGreaterThanOrEqual(stage.height - 1);
  // The hero is not crushed at 1280×720: its copy, its photograph and the space around them.
  const hero = await box(page, 'header.day-hero');
  expect(hero.height).toBeGreaterThanOrEqual(640);
});

test('desktop 1280: the strip is one compact horizontal row: the intro, then product, destination, volume and its unit, Continue', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const f = form(page);
  const strip = await box(page, '#initiate-trade form');
  expect(strip.height).toBeLessThanOrEqual(170);
  expect(strip.width).toBeGreaterThanOrEqual(1100);
  const rows = await page.evaluate(() => {
    const centre = el => { const b = el.getBoundingClientRect(); return { x: b.left, right: b.right, y: b.top + b.height / 2 }; };
    const form = document.querySelector('#initiate-trade form');
    const labelled = text => form.querySelector(`[id="${[...form.querySelectorAll('label')].find(l => l.textContent.trim() === text)?.htmlFor}"]`);
    return {
      intro: centre(form.querySelector('h2')),
      product: centre(labelled('Product')), destination: centre(labelled('Destination')), amount: centre(labelled('Estimated volume')),
      unit: centre(form.querySelector('select[aria-label="Unit"]')), button: centre(form.querySelector('button[type="submit"]')),
    };
  });
  const { intro, product, destination, amount, unit, button } = rows;
  // One row: the controls' middles within a few pixels of each other.
  for (const c of [destination, amount, unit, button]) expect(Math.abs(c.y - product.y)).toBeLessThanOrEqual(12);
  // In reading order from the left: intro, product, destination, amount, unit, Continue.
  const lefts = [intro, product, destination, amount, unit, button].map(c => c.x);
  expect(lefts).toEqual([...lefts].sort((a, b) => a - b));
  // Nothing is clipped: the longest product name fits its select, the placeholder its field.
  await f.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  const clipped = await f.evaluate(el => [...el.querySelectorAll('select, input:not(.desk-hp)')].filter(c => c.scrollWidth > c.clientWidth + 1).map(c => c.id));
  expect(clipped).toEqual([]);
  await expect(f.getByRole('button', { name: 'Continue' })).toBeVisible();
});

for (const [width, layout] of [[1440, 'one row'], [1920, 'one row'], [1240, 'one row']]) {
  test(`desktop ${width}: the strip stays ${layout}, inside the page, directly below the hero`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const strip = await box(page, '#initiate-trade form');
    const hero = await box(page, 'header.day-hero');
    const stage = await box(page, '.day-visual');
    expect(strip.right).toBeLessThanOrEqual(width);
    expect(strip.height).toBeLessThanOrEqual(170);
    expect(strip.y).toBeGreaterThanOrEqual(stage.bottom);
    expect(strip.y).toBeGreaterThanOrEqual(hero.bottom - 40);
    expect(await noOverflow(page)).toBe(true);
    const ys = await page.evaluate(() => [...document.querySelectorAll('#initiate-trade select, #initiate-trade input:not(.desk-hp), #initiate-trade button[type="submit"]')].map(el => Math.round(el.getBoundingClientRect().top)));
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThanOrEqual(12);
  });
}

test('desktop, under 1240: the intro on its own row with the four controls in one row below from 1000 px; two columns below that', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const rowOf = () => page.evaluate(() => {
    const top = sel => Math.round(document.querySelector(sel).getBoundingClientRect().top);
    const form = document.querySelector('#initiate-trade form');
    const field = text => form.querySelector(`[id="${[...form.querySelectorAll('label')].find(l => l.textContent.trim() === text)?.htmlFor}"]`);
    return { intro: top('#initiate-trade h2'), product: Math.round(field('Product').getBoundingClientRect().top), destination: Math.round(field('Destination').getBoundingClientRect().top), amount: Math.round(field('Estimated volume').getBoundingClientRect().top), button: Math.round(form.querySelector('button[type="submit"]').getBoundingClientRect().top) };
  });
  const wide = await rowOf();
  expect(wide.product).toBeGreaterThan(wide.intro + 30);
  expect(Math.abs(wide.destination - wide.product)).toBeLessThanOrEqual(4);
  expect(Math.abs(wide.amount - wide.product)).toBeLessThanOrEqual(4);
  expect(await noOverflow(page)).toBe(true);

  await page.setViewportSize({ width: 800, height: 900 });
  const narrow = await rowOf();
  // Two columns: product and destination share a row, the volume and Continue the next.
  expect(Math.abs(narrow.destination - narrow.product)).toBeLessThanOrEqual(4);
  expect(narrow.amount).toBeGreaterThan(narrow.product + 40);
  expect(Math.abs(narrow.button - narrow.amount)).toBeLessThanOrEqual(30);
  expect(await noOverflow(page)).toBe(true);
});

test('desktop: the LCP image is the same request as before: eager, high priority, its sizes, one eager image', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const hero = page.locator('header.day-hero');
  const farm = hero.locator('img.day-farm');
  await expect(farm).toHaveAttribute('loading', 'eager');
  await expect(farm).toHaveAttribute('fetchpriority', 'high');
  await expect(farm).toHaveAttribute('sizes', '(max-width: 430px) 365px, (max-width: 900px) calc(100vw - 40px), 820px');
  await expect(hero.locator('img[loading="eager"]')).toHaveCount(1);
  // The page asks for one hero photograph, once (React preloads the eager one; no second request for it).
  expect(await page.evaluate(() => performance.getEntriesByType('resource').filter(e => /fruitFarm|fruit-farm/i.test(e.name) || /url=%2F_next%2Fstatic%2Fmedia%2FfruitFarm/.test(e.name)).length)).toBeLessThanOrEqual(2);
  // The browser's LCP element is the photograph, as before.
  const lcp = await page.evaluate(() => new Promise(resolve => {
    new PerformanceObserver(list => { const last = list.getEntries().at(-1); resolve(/** @type {any} */ (last).element?.className ?? ''); }).observe({ type: 'largest-contentful-paint', buffered: true });
  }));
  expect(String(lcp)).toContain('day-farm');
});

// The candidate each kind of phone downloads for the hero photograph. 412 at DPR 1.75 is Lighthouse's phone: 640w (67 kB)
// instead of 750w (78 kB) is the difference between a lab LCP of 2.3 s and 2.7 s, for 2% fewer pixels than painted; every
// sharper phone gets at least the pixels it paints (the fidelity bar of images.desktop.spec.js is 95%), and none gets the
// 1920w the old 420px slot gave a DPR 3 phone.
for (const [width, height, dpr, expected] of [[412, 823, 1.75, 640], [360, 640, 2, 750], [375, 667, 2, 750], [390, 844, 3, 1200], [430, 932, 2.6, 1080]]) {
  test(`phone ${width}×${height} at DPR ${dpr}: the hero photograph is the ${expected}w candidate and has the pixels it paints`, async ({ browser, baseURL }) => {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr, baseURL });
    await page.goto('/', { waitUntil: 'networkidle' });
    const farm = await page.locator('img.day-farm').evaluate(img => {
      const el = /** @type {HTMLImageElement} */ (img);
      const b = el.getBoundingClientRect();
      return { w: Number(new URL(el.currentSrc).searchParams.get('w')), boxW: b.width, boxH: b.height };
    });
    expect(farm.w).toBe(expected);
    // The cover crop of the 4:3 source paints its larger side.
    const painted = Math.max(farm.boxW, farm.boxH * (1280 / 960));
    expect(farm.w).toBeGreaterThanOrEqual(Math.ceil(painted * dpr * 0.95));
    await page.close();
  });
}

test('desktop: no phone button, however far the buyer scrolls', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const bar = page.locator('[data-sticky-supply-cta]');
  await expect(bar).toBeHidden();
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 2500); });
  await expect(bar).toBeHidden();
  expect(await bar.evaluate(el => getComputedStyle(el).display)).toBe('none');
});

for (const width of [901, 1100, 1280, 1920]) {
  test(`desktop layout at ${width}px: the hero's two columns, the strip below them, nothing scrolls sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const copy = await box(page, '.day-copy');
    const stage = await box(page, '.day-visual');
    const strip = await box(page, '#initiate-trade form');
    expect(copy.right).toBeLessThanOrEqual(stage.x + 1);
    expect(stage.right).toBeLessThanOrEqual(width);
    expect(strip.right).toBeLessThanOrEqual(width);
    expect(strip.y).toBeGreaterThanOrEqual(stage.bottom);
    expect(await noOverflow(page)).toBe(true);
  });
}

test('the single-column layout begins at 900px: copy, photograph, then the strip; a tablet has no sticky bar', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const copy = await box(page, '.day-copy');
  const stage = await box(page, '.day-visual');
  const strip = await box(page, '#initiate-trade form');
  expect(stage.y).toBeGreaterThanOrEqual(copy.bottom);
  expect(strip.y).toBeGreaterThanOrEqual(stage.bottom);
  expect(await noOverflow(page)).toBe(true);
  // Past the form: the bar's state says "shown", the stylesheet says a tablet does not get it.
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 2600); });
  const bar = page.locator('[data-sticky-supply-cta]');
  await expect.poll(() => bar.evaluate(el => el.hidden)).toBe(false);
  await expect(bar).toBeHidden();
  expect(await bar.evaluate(el => getComputedStyle(el).display)).toBe('none');
});

test('desktop: the second Trade Desk row appears with the first answer, below the strip, and the hero does not move', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const row = page.locator('#initiate-trade').getByRole('button', { name: 'Open HMV Trade Desk' });
  await expect(row).toHaveCount(0);
  const before = { stage: await box(page, '.day-visual'), strip: await box(page, '#initiate-trade form'), hero: await box(page, 'header.day-hero') };
  await form(page).getByLabel('Product', { exact: true }).selectOption('bananas');
  await expect(row).toBeVisible();
  const after = { stage: await box(page, '.day-visual'), strip: await box(page, '#initiate-trade form'), hero: await box(page, 'header.day-hero') };
  // The hero and the strip stay where they were; the row is under the strip; only what is below it moves.
  expect(after.stage).toEqual(before.stage);
  expect(after.hero).toEqual(before.hero);
  expect(after.strip).toEqual(before.strip);
  expect((await box(page, '#initiate-trade aside')).y).toBeGreaterThanOrEqual(after.strip.bottom);
});

test('desktop: the second step and the received state stay in the same card, compact, inside the page', async ({ page }) => {
  await page.route('**/api/inquiry', route => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-STRIP1' }) }));
  await page.goto('/', { waitUntil: 'networkidle' });
  const f = form(page);
  await f.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  await f.getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await f.getByLabel('Estimated volume', { exact: true }).fill('500');
  const hero = await box(page, 'header.day-hero');
  await f.getByRole('button', { name: 'Continue' }).click();
  await expect(f.getByRole('heading', { name: 'Where should HMV contact you?' })).toBeFocused();
  // Company and work email side by side; the same instance, the same hero above it.
  const pair = await page.evaluate(() => { const y = id => Math.round(document.querySelector(`#initiate-trade [id$="${id}"]`).getBoundingClientRect().top); return [y('contact.company'), y('contact.email')]; });
  expect(Math.abs(pair[0] - pair[1])).toBeLessThanOrEqual(2);
  expect((await box(page, 'header.day-hero')).height).toBe(hero.height);
  expect(await noOverflow(page)).toBe(true);
  await f.getByLabel('Company', { exact: true }).fill('Example Foods B.V.');
  await f.getByLabel('Work email', { exact: true }).fill('buyer@example.com');
  await f.getByLabel('HMV may contact me about this inquiry.').check();
  await f.getByRole('button', { name: 'Send Request' }).click();
  const done = page.locator('#initiate-trade').getByRole('region', { name: 'Request received' });
  await expect(done).toContainText('HMV-2026-STRIP1');
  // The received state is one short row, the reference visible and copyable, not a panel.
  expect((await box(page, '#initiate-trade section')).height).toBeLessThanOrEqual(200);
  await expect(done.getByRole('button', { name: 'Submit another request' })).toBeVisible();
  expect(await noOverflow(page)).toBe(true);
});
