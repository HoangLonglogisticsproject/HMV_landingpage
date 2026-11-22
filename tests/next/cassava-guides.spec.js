// @ts-check
import { test, expect } from '@playwright/test';
import { ZH_CASSAVA_GUIDES } from '../../src/i18n/routes.js';
import { tags } from './html.js';

/**
 * The dried cassava chips content wave: the Simplified Chinese guides (/zh-cn/cassava-chips/<slug>) and the EN/VI
 * EcoNews buyer guides. Each leads back to the cassava page and opens the HMV Trade Desk with its own source; the
 * Chinese page shows its commercial support and links every guide. Head tags, canonical, hreflang and the sitemap of
 * every URL: next.spec.js.
 */
const dataLayer = page => page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
const SOURCES = { 'procurement-guide': 'zh_procurement_guide', 'quality-guide': 'zh_quality_guide', 'ethanol-guide': 'zh_ethanol_guide' };

for (const slug of ZH_CASSAVA_GUIDES) {
  const path = `/zh-cn/cassava-chips/${slug}`;
  test(`${path}: server HTML links to the procurement page; no FAQ structured data; the Trade Desk opens with its source`, async ({ page, request }) => {
    const html = await (await request.get(path, { maxRedirects: 0 })).text();
    const hrefs = tags(html, 'a').map(a => a.href);
    expect(hrefs).toContain('/zh-cn/cassava-chips');
    expect(html).toContain('中文商务支持');
    expect(html).not.toContain('FAQPage');
    for (const href of hrefs.filter(h => h.startsWith('/zh-cn/'))) expect((await request.get(href.split('#')[0], { maxRedirects: 0 })).status(), href).toBe(200);
    await page.goto(path);
    await page.getByRole('button', { name: '向 HMV 提交采购需求' }).click();
    const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
    await expect(desk).toBeVisible();
    await expect(desk.locator('.desk-summary')).toContainText('Dried cassava chips');
    expect(await dataLayer(page)).toContainEqual({ event: 'trade_desk_open', source: SOURCES[slug], product: 'dried-cassava-chips', locale: 'en' });
  });
}

const ARTICLES = [
  ['/blog/dried-cassava-chips-ethanol-procurement-guide', 'Send your requirement to HMV', 'en_ethanol_guide', '/products/dried-cassava-chips'],
  ['/vi/tin-tuc/chat-luong-san-lat-kho-huong-dan-thu-mua', 'Gửi yêu cầu thu mua cho HMV', 'vi_quality_guide', '/vi/san-pham/san-lat-kho'],
];
for (const [path, label, source, product] of ARTICLES) {
  test(`${path}: links to the cassava page in its language; the call to action opens the Trade Desk with ${source}`, async ({ page, request }) => {
    const html = await (await request.get(path, { maxRedirects: 0 })).text();
    expect(tags(html, 'a').map(a => a.href)).toContain(product);
    await page.goto(path);
    await page.locator('.article-cta').getByRole('button', { name: label }).click();
    await expect(page.getByRole('dialog', { name: 'HMV Trade Desk' })).toBeVisible();
    expect(await dataLayer(page)).toContainEqual(expect.objectContaining({ event: 'trade_desk_open', source, product: 'dried-cassava-chips' }));
  });
}

test('the cassava pages link their guides: the Chinese page its three, the EN and VI pages their articles', async ({ request }) => {
  const guides = async path => {
    const html = await (await request.get(path)).text();
    const section = html.slice(html.indexOf('<section id="guides"'), html.indexOf('</section>', html.indexOf('<section id="guides"')));
    return tags(section, 'a').map(a => a.href);
  };
  expect(await guides('/zh-cn/cassava-chips')).toEqual(ZH_CASSAVA_GUIDES.map(slug => `/zh-cn/cassava-chips/${slug}`));
  expect(await guides('/products/dried-cassava-chips')).toEqual(['/blog/dried-cassava-chips-ethanol-procurement-guide', '/blog/dried-cassava-chips-quality-procurement-guide']);
  expect(await guides('/vi/san-pham/san-lat-kho')).toEqual(['/vi/tin-tuc/san-lat-kho-cho-san-xuat-ethanol', '/vi/tin-tuc/chat-luong-san-lat-kho-huong-dan-thu-mua']);
  // The Korean page has no guides.
  expect(await (await request.get('/ko/tapioca-chips')).text()).not.toContain('id="guides"');
});

test('the Chinese guides fit a 320 px screen: no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const slug of ZH_CASSAVA_GUIDES) {
    await page.goto(`/zh-cn/cassava-chips/${slug}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), slug).toBeLessThanOrEqual(320);
  }
});
