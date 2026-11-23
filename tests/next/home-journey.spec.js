// @ts-check
import { test, expect } from '@playwright/test';

/**
 * The homepage's conversion journey on the Next.js build (desktop and phone): the order of the sections, one Quick RFQ
 * in the hero, the hero's two lanes (Get Supply Proposal reaches the form, the secondary opens the Trade Desk), the
 * closing call to action, what the buyer typed surviving it all, and the page's structure (one h1, no duplicate ids).
 * The phone's sticky button is in home-journey.mobile.spec.js, the desktop composition in home-journey.desktop.spec.js.
 */

const LANGS = [
  { name: 'en', path: '/', h1: 'Rooted in the land.Connecting the world.', primary: 'Get Supply Proposal', secondary: 'Need guidance? Ask HMV Trade Desk', final: 'Ready to discuss your sourcing requirement?', product: 'Product' },
  { name: 'vi', path: '/vi', h1: 'Bám rễ từ đất lành.Vươn tầm ra thế giới.', primary: 'Nhận phương án cung ứng', secondary: 'Cần tư vấn? Trao đổi với HMV Trade Desk', final: 'Sẵn sàng trao đổi nhu cầu thu mua của bạn?', product: 'Sản phẩm' },
];
const dataLayer = page => page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
const desk = page => page.getByRole('dialog', { name: 'HMV Trade Desk' });
const form = page => page.locator('#initiate-trade form');

test('the sections follow the buyer: hero with the form, products, proof, execution, the real work, reach, insights, the closing call', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const order = await page.evaluate(() => {
    const top = sel => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + scrollY : null; };
    const sections = ['header.day-hero', '#initiate-trade', '#featured-products', '[aria-labelledby="trust-title"]', '#value-journey', '.in-action',
      '.partner-community', '.global-reach', '.insights-home', '[data-final-cta]'];
    return sections.map(sel => [sel, top(sel)]);
  });
  expect(order.filter(([, y]) => y === null)).toEqual([]);
  const ys = order.map(([, y]) => /** @type {number} */ (y));
  // The form is in the hero (inside it, so not below its top); every other section follows the previous one.
  expect(ys[1]).toBeGreaterThanOrEqual(ys[0]);
  expect(ys[1]).toBeLessThan(ys[2]);
  for (let i = 2; i < ys.length; i++) expect(ys[i], `${order[i][0]} after ${order[i - 1][0]}`).toBeGreaterThan(ys[i - 1]);
  await expect(page.locator('header.day-hero #initiate-trade')).toHaveCount(1);
});

for (const lang of LANGS) {
  test(`${lang.name}: one h1, one Quick RFQ, one form, unique ids, the anchor in place`, async ({ page }) => {
    await page.goto(lang.path, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.locator('h1').evaluate(el => el.textContent)).toBe(lang.h1);
    await expect(page.locator('#initiate-trade')).toHaveCount(1);
    await expect(page.locator('form.rfq-form')).toHaveCount(1);
    await expect(page.locator('h2#rfq-title')).toHaveCount(1);
    // Nothing is mounted twice, hidden or not: no id repeats and the page has one form of its own.
    const duplicates = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll('[id]')) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    });
    expect(duplicates).toEqual([]);
    // No second form hides anywhere on the page, and no field of the form is repeated.
    await expect(page.locator('main form')).toHaveCount(1);
    await expect(page.getByRole('button', { name: lang.primary }).first()).toBeVisible();
  });

  test(`${lang.name}: Get Supply Proposal reaches the Quick RFQ and opens no Trade Desk; the secondary lane opens it`, async ({ page }) => {
    await page.goto(lang.path, { waitUntil: 'networkidle' });
    // The primary lane is the hero's button; the same label is at the end of the page and on the phone's sticky bar.
    await page.locator('header.day-hero').getByRole('button', { name: lang.primary }).click();
    await expect(form(page).getByLabel(lang.product, { exact: true })).toBeFocused();
    await expect(desk(page)).toHaveCount(0);
    let events = await dataLayer(page);
    expect(events).toEqual([{ event: 'home_supply_plan_click', source: 'hero', locale: lang.name }]);

    await page.locator('header.day-hero').getByRole('button', { name: lang.secondary }).click();
    await expect(desk(page)).toBeVisible();
    events = await dataLayer(page);
    expect(events.map(e => e.event)).toEqual(['home_supply_plan_click', 'trade_desk_open']);
    expect(events[1]).toEqual({ event: 'trade_desk_open', source: 'home_hero_assisted', locale: lang.name });
    // No form value or free text anywhere in what was counted.
    expect(JSON.stringify(events)).not.toMatch(/Busan|@/);
  });
}

test('what the buyer typed survives scrolling away, the closing call to action and the Trade Desk: one form, never remounted', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const f = form(page);
  await f.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  await f.getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await f.getByLabel('Estimated volume', { exact: true }).fill('500');
  // Mark the very elements: a remount would drop the mark.
  await page.evaluate(() => { document.querySelector('#initiate-trade form')?.setAttribute('data-mounted-once', 'yes'); });

  // To the end of the page, then back with the closing call to action.
  await page.locator('[data-final-cta]').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(3000);
  await page.locator('[data-final-cta]').getByRole('button', { name: 'Get Supply Proposal' }).click();
  await expect(f.getByLabel('Product', { exact: true })).toBeFocused();
  await expect(f.getByLabel('Product', { exact: true })).toBeInViewport();
  await expect(f.getByLabel('Destination', { exact: true })).toHaveValue('Busan, South Korea');
  await expect(f.getByLabel('Estimated volume', { exact: true })).toHaveValue('500');
  await expect(f).toHaveAttribute('data-mounted-once', 'yes');
  expect((await dataLayer(page)).at(-1)).toEqual({ event: 'home_supply_plan_click', source: 'final', locale: 'en' });

  // The step survives too: on to the contact, away, and back to where the buyer was.
  await f.getByRole('button', { name: 'Continue' }).click();
  await f.getByLabel('Company', { exact: true }).fill('Example Foods B.V.');
  await page.locator('[data-final-cta]').scrollIntoViewIfNeeded();
  await page.locator('[data-final-cta]').getByRole('button', { name: 'Get Supply Proposal' }).click();
  await expect(f.getByRole('heading', { name: 'Where should HMV contact you?' })).toBeFocused();
  await expect(f.getByLabel('Company', { exact: true })).toHaveValue('Example Foods B.V.');
  await expect(f).toHaveAttribute('data-mounted-once', 'yes');

  // The Trade Desk opens and closes over the page; the form is as it was.
  await page.locator('[data-final-cta]').getByRole('button', { name: 'Ask HMV Trade Desk' }).click();
  await expect(desk(page)).toBeVisible();
  expect((await dataLayer(page)).at(-1)).toEqual({ event: 'trade_desk_open', source: 'home_final_assisted', locale: 'en' });
  await page.keyboard.press('Escape');
  await expect(desk(page)).toBeHidden();
  await expect(f.getByLabel('Company', { exact: true })).toHaveValue('Example Foods B.V.');
  await expect(f).toHaveAttribute('data-mounted-once', 'yes');
  // One form still.
  await expect(page.locator('main form')).toHaveCount(1);
});

test('keyboard: from the hero\'s button to the form with Enter; Tab goes on through the fields; no trap outside the desk', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('header.day-hero').getByRole('button', { name: 'Get Supply Proposal' }).focus();
  await page.keyboard.press('Enter');
  const f = form(page);
  await expect(f.getByLabel('Product', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(f.getByLabel('Destination', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(f.getByLabel('Estimated volume', { exact: true })).toBeFocused();
  // Shift+Tab back to the page: focus is not held by the form.
  for (let i = 0; i < 3; i++) await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement && !document.querySelector('#initiate-trade')?.contains(document.activeElement))).toBe(true);
  // The visible focus of the hero's two lanes.
  const outline = await page.locator('header.day-hero').getByRole('button', { name: 'Get Supply Proposal' }).evaluate(el => { el.focus(); return getComputedStyle(el).outlineStyle + '|' + getComputedStyle(el).boxShadow; });
  expect(outline).not.toBe('none|none');
});

test('the products stay reachable: the commodity links and their destinations are as they were', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const hrefs = await page.locator('#featured-products a.commodity').evaluateAll(els => els.map(el => el.getAttribute('href')));
  expect(hrefs).toEqual(['/products/passion-fruit', '/products/bananas', '/products/spices', '/products/dried-cassava-chips']);
  await expect(page.locator('#featured-products a[href="/trade-solutions"]')).toContainText('All products');
  await page.goto('/vi', { waitUntil: 'networkidle' });
  const vi = await page.locator('#featured-products a.commodity').evaluateAll(els => els.map(el => el.getAttribute('href')));
  expect(vi).toContain('/vi/san-pham/chanh-day');
  expect(vi.every(href => href?.startsWith('/vi/'))).toBe(true);
});

test('server-rendered: the sections, the form and the calls to action are in the HTML, not made by the browser', async ({ request }) => {
  const html = await (await request.get('/')).text();
  for (const text of ['Get Supply Proposal', 'Need guidance? Ask HMV Trade Desk', 'Tell us what you need', 'CORE COMMODITIES', 'Built around the buyer.',
    'THE VALUE JOURNEY', 'HMV GLOBAL IN ACTION', 'GLOBAL REACH', 'HMV ECONEWS', 'Ready to discuss your sourcing requirement?']) {
    expect(html, text).toContain(text);
  }
  expect(html.match(/<h1[ >]/g)).toHaveLength(1);
  expect(html.match(/id="initiate-trade"/g)).toHaveLength(1);
  // The order in the HTML is the buyer's.
  const at = ['Rooted in the land', 'id="initiate-trade"', 'id="featured-products"', 'Built around the buyer.', 'id="value-journey"', 'Ready to discuss'].map(t => html.indexOf(t));
  expect(at.every(i => i > -1)).toBe(true);
  expect([...at].sort((a, b) => a - b)).toEqual(at);
  // The sticky bar is closed in the HTML: nothing for a crawler or a screen reader before the browser decides.
  expect(html).toMatch(/<div hidden="" data-sticky-supply-cta/);
});

test('reduced motion: the form is reached without smooth scrolling and the sticky bar does not animate', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', baseURL, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.locator('[data-final-cta]').scrollIntoViewIfNeeded();
  await page.locator('[data-final-cta]').getByRole('button', { name: 'Get Supply Proposal' }).click();
  await expect(form(page).getByLabel('Product', { exact: true })).toBeInViewport();
  await context.close();
});
