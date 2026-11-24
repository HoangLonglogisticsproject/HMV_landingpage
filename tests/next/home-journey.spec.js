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

test('the sections follow the buyer: hero, the Quick RFQ strip, products, proof, execution, the real work, reach, insights, the closing call', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const order = await page.evaluate(() => {
    const top = sel => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + scrollY : null; };
    const sections = ['header.day-hero', '#initiate-trade', '#featured-products', '[aria-labelledby="trust-title"]', '#value-journey', '.in-action',
      '.global-reach', '.insights-home', '[data-final-cta]'];
    return sections.map(sel => [sel, top(sel)]);
  });
  expect(order.filter(([, y]) => y === null)).toEqual([]);
  const ys = order.map(([, y]) => /** @type {number} */ (y));
  // The Quick RFQ is attached to the hero's bottom edge (a few pixels over its padding) and every section follows the previous one.
  for (let i = 1; i < ys.length; i++) expect(ys[i], `${order[i][0]} after ${order[i - 1][0]}`).toBeGreaterThan(ys[i - 1]);
  // In the DOM the Quick RFQ is the hero's next sibling and the products' previous one; the hero holds no form.
  const siblings = await page.evaluate(() => ({
    next: document.querySelector('header.day-hero')?.nextElementSibling?.id,
    products: document.querySelector('#initiate-trade')?.nextElementSibling?.id,
    inHero: document.querySelectorAll('header.day-hero form, header.day-hero #initiate-trade').length,
  }));
  expect(siblings).toEqual({ next: 'initiate-trade', products: 'featured-products', inHero: 0 });
});

// What HMV has not got: reviews. The people and companies below were placeholders (PartnerCommunity, removed): none of
// them, nor the badge that said so, nor the card markup, may be on the page.
const SAMPLE_REVIEWS = /John D\.|Sarah W\.|Marc L\.|Emma K\.|Agri-produce importer|Supermarket chain \(USA\)|Fruit distributor \(France\)|Food manufacturer \(Netherlands\)|Sample placeholder|Nội dung mẫu|PARTNER COMMUNITY|CỘNG ĐỒNG ĐỐI TÁC|Partner Community|Cộng đồng Đối tác|real partner reviews/;

for (const lang of LANGS) {
  test(`${lang.name}: no sample testimonials, in the browser or in the HTML`, async ({ page, request }) => {
    const html = await (await request.get(lang.path)).text();
    expect(html).not.toMatch(SAMPLE_REVIEWS);
    expect(html).not.toMatch(/review-card|class="marquee|sample-badge|partner-community/);
    await page.goto(lang.path, { waitUntil: 'networkidle' });
    await expect(page.locator('.partner-community, .marquee, .review-card, .sample-badge')).toHaveCount(0);
    expect(await page.locator('main').innerText()).not.toMatch(SAMPLE_REVIEWS);
    await expect(page.locator('main blockquote')).toHaveCount(0);
  });

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

test('exactly one Quick RFQ: one instance, one anchor, one set of ids, the same after a resize', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const count = () => page.evaluate(() => ({
    anchors: document.querySelectorAll('#initiate-trade').length,
    forms: document.querySelectorAll('form').length,
    products: document.querySelectorAll('#initiate-trade select[id$="-product"]').length,
    h2: document.querySelectorAll('h2#rfq-title').length,
  }));
  expect(await count()).toEqual({ anchors: 1, forms: 1, products: 1, h2: 1 });
  await form(page).getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await page.evaluate(() => { document.querySelector('#initiate-trade form')?.setAttribute('data-mounted-once', 'yes'); });
  // Phone, tablet, desktop: the layout changes, the instance and what was typed in it do not.
  for (const [width, height] of [[390, 844], [768, 1024], [1280, 720], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    expect(await count(), `at ${width}`).toEqual({ anchors: 1, forms: 1, products: 1, h2: 1 });
    await expect(form(page)).toHaveAttribute('data-mounted-once', 'yes');
    await expect(form(page).getByLabel('Destination', { exact: true })).toHaveValue('Busan, South Korea');
  }
});

test('the form has no second Trade Desk call to action until the buyer has started; then it hands over what they typed', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const f = form(page);
  const row = page.locator('#initiate-trade').getByRole('button', { name: 'Open HMV Trade Desk' });
  // The hero's own link is the assisted lane from the start: the form has no second Trade Desk call to action.
  await expect(page.locator('header.day-hero').getByRole('button', { name: 'Need guidance? Ask HMV Trade Desk' })).toBeVisible();
  await expect(row).toHaveCount(0);
  await expect(page.locator('#initiate-trade')).not.toContainText('Need guidance?');
  // Focusing it, pressing Continue empty: still not started.
  await f.getByLabel('Product', { exact: true }).focus();
  await f.getByRole('button', { name: 'Continue' }).click();
  await expect(row).toHaveCount(0);

  // The first answer: the row is there and carries it.
  await f.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  await expect(row).toBeVisible();
  await f.getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await f.getByLabel('Estimated volume', { exact: true }).fill('500');
  await row.click();
  await expect(desk(page)).toBeVisible();
  await expect(desk(page).getByRole('log').locator('.desk-msg')).toHaveText([
    'HMVWhere would you like the goods delivered?',
    'YouBusan, South Korea',
    'HMVWhat volume are you planning to purchase?',
    'You500 MT / month',
    /^HMVThank you\. I have enough information to open a commercial inquiry/,
  ]);
  const events = await dataLayer(page);
  expect(events.at(-2)).toEqual({ event: 'trade_desk_open', source: 'quick_rfq', product: 'dried-cassava-chips', locale: 'en' });
  expect(JSON.stringify(events)).not.toMatch(/Busan|500/);
});

test('the hero\'s assisted lane still opens the desk empty, whatever the form holds', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await form(page).getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await page.locator('header.day-hero').getByRole('button', { name: 'Need guidance? Ask HMV Trade Desk' }).click();
  await expect(desk(page)).toBeVisible();
  await expect(desk(page).getByRole('log').locator('.desk-msg')).toHaveText(['HMVWhat product are you looking for?']);
});

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
  expect(html).not.toMatch(SAMPLE_REVIEWS);
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
