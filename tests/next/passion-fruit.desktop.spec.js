// @ts-check
import { test, expect } from '@playwright/test';

/**
 * The golden passion fruit pages at the widths buyers use, in both languages: no horizontal overflow, no heading or
 * button clipped by its container, the segment navigation inside the viewport. Vietnamese is the longer text.
 */
const PATHS = [
  '/products/passion-fruit', '/products/passion-fruit/foodservice', '/products/passion-fruit/retail',
  '/vi/san-pham/chanh-day', '/vi/san-pham/chanh-day/khach-san-nha-hang', '/vi/san-pham/chanh-day/doi-tac-ban-le',
];
const WIDTHS = [360, 390, 768, 1024, 1440];
// Written out, as in passion-fruit.spec.js. The language menu is the desktop header's (a phone has its own menu).
const SEGMENTS = [
  { key: 'export', en: '/products/passion-fruit', vi: '/vi/san-pham/chanh-day', h1: 'Nhà cung ứng chanh dây vàng Việt Nam' },
  { key: 'foodservice', en: '/products/passion-fruit/foodservice', vi: '/vi/san-pham/chanh-day/khach-san-nha-hang', h1: 'Chanh dây vàng cho ẩm thực và đồ uống chuyên nghiệp' },
  { key: 'retail', en: '/products/passion-fruit/retail', vi: '/vi/san-pham/chanh-day/doi-tac-ban-le', h1: 'Chanh dây vàng cho đối tác phân phối và bán lẻ' },
];

for (const { key, en, vi, h1 } of SEGMENTS) {
  test(`${key}: language switching keeps the segment`, async ({ page }) => {
    const switchTo = async label => {
      await page.locator('button.hmv-lang-trigger').first().click();
      await page.locator(`[role="menuitem"]:has-text("${label}")`).first().click();
    };
    await page.goto(en, { waitUntil: 'networkidle' });
    await switchTo('Tiếng Việt');
    await expect(page).toHaveURL(new RegExp(`${vi}$`));
    await expect(page.locator('h1')).toHaveText(h1);
    await switchTo('English');
    await expect(page).toHaveURL(new RegExp(`${en}$`));
  });
}

test('no overflow, nothing clipped, the segment navigation in the viewport, at 360 to 1440 px', async ({ browser, baseURL }) => {
  test.setTimeout(120_000);
  const page = await browser.newPage({ baseURL });
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of PATHS) {
      await page.goto(path, { waitUntil: 'networkidle' });
      const m = await page.evaluate(() => {
        const root = document.documentElement;
        const clipped = [...document.querySelectorAll('main h1, main h2, main h3, main a, main button')]
          .filter(el => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible')
          .map(el => el.textContent?.trim().slice(0, 40));
        const nav = document.querySelector('main nav, nav[aria-label]:not(.site-nav)')?.getBoundingClientRect();
        return { overflow: root.scrollWidth - root.clientWidth, clipped, nav: nav && [Math.round(nav.left), Math.round(nav.right)] };
      });
      expect(m.overflow, `${path} @${width}`).toBeLessThanOrEqual(0);
      expect(m.clipped, `${path} @${width}`).toEqual([]);
      if (m.nav) expect(m.nav[1], `${path} @${width} nav`).toBeLessThanOrEqual(width);
    }
  }
  await page.close();
});

// The header's desk button is in the phone's menu, so this case is the desktop's.
const desk = page => page.getByRole('dialog', { name: 'HMV Trade Desk' });
/** The buyer answers HMV's question in the conversation's field, sent with Enter. */
async function say(page, label, value) {
  const input = desk(page).getByLabel(label, { exact: true });
  await input.fill(value);
  await input.press('Enter');
}

test('a segment conversation keeps the page it started on as its source when the buyer moves to another segment', async ({ page }) => {
  let posted;
  await page.route('**/api/inquiry', async route => {
    posted = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) });
  });
  await page.goto(SEGMENTS[2].en, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Discuss a Retail Partnership', exact: true }).first().click();
  await say(page, 'Delivery destination', 'Hanoi');
  await page.keyboard.press('Escape');
  await expect(desk(page)).toBeHidden();
  await page.getByRole('navigation', { name: 'Buyer segments' }).getByRole('link', { name: 'Foodservice' }).click();
  await expect(page).toHaveURL(/\/foodservice$/);
  // The header's desk button names no segment: the conversation goes on, in the retail words and units.
  await page.getByRole('button', { name: 'HMV Trade Desk', exact: true }).first().click();
  await expect(desk(page).getByRole('combobox')).toHaveValue('kg');
  await say(page, 'Expected volume', '20');
  await desk(page).getByRole('button', { name: 'Request Quotation' }).click();
  await desk(page).getByLabel('Company').fill('Example Foods B.V.');
  await desk(page).getByLabel('Business email').fill('buyer@example.com');
  await desk(page).getByLabel('HMV may contact me about this inquiry.').check();
  await desk(page).getByRole('button', { name: 'Send Request' }).click();
  await expect(desk(page)).toContainText('HMV-2026-7KQ4XM');
  expect(posted.destination).toBe('Hanoi');
  expect(posted.context.page).toBe(SEGMENTS[2].en);
});
