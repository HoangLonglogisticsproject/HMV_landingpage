// @ts-check
import { test, expect } from '@playwright/test';
import { KO_CASSAVA_GUIDES, ZH_CASSAVA_GUIDES } from '../../src/i18n/routes.js';
import { head, tags } from './html.js';

/**
 * The dried cassava chips content wave: the Simplified Chinese guides (/zh-cn/cassava-chips/<slug>), the Korean guides
 * (/ko/tapioca-chips/<slug>) and the EN/VI EcoNews buyer guides. Each leads back to the cassava page and opens the HMV
 * Trade Desk with its own source; the Chinese page shows its commercial support; every cassava page links its guides.
 * Head tags, canonical, hreflang and the sitemap of every URL: next.spec.js.
 */
const dataLayer = page => page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
const SOURCES = {
  '/zh-cn/cassava-chips': { 'procurement-guide': 'zh_procurement_guide', 'quality-guide': 'zh_quality_guide', 'ethanol-guide': 'zh_ethanol_guide' },
  '/ko/tapioca-chips': { 'procurement-guide': 'ko_procurement_guide', 'quality-guide': 'ko_quality_guide', 'ethanol-guide': 'ko_ethanol_guide' },
};
// Per language: the guides, the document language, the button that opens the Trade Desk, and the commercial support block.
const SETS = [
  { base: '/zh-cn/cassava-chips', slugs: ZH_CASSAVA_GUIDES, lang: 'zh-CN', button: '向 HMV 提交采购需求', support: '中文商务支持' },
  { base: '/ko/tapioca-chips', slugs: KO_CASSAVA_GUIDES, lang: 'ko', button: 'HMV에 원료 구매 요구사항 전달', support: null },
];

for (const { base, slugs, lang, button, support } of SETS) {
  for (const slug of slugs) {
    const path = `${base}/${slug}`;
    test(`${path}: a ${lang} document linking the procurement page; no FAQ structured data; the Trade Desk opens with its source`, async ({ page, request }) => {
      const html = await (await request.get(path, { maxRedirects: 0 })).text();
      const hrefs = tags(html, 'a').map(a => a.href);
      expect(head(html).lang).toBe(lang);
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(hrefs).toContain(base);
      if (support) expect(html).toContain(support);
      else expect(html).not.toContain('commercial-support');
      expect(html).not.toContain('FAQPage');
      for (const href of hrefs.filter(h => h.startsWith(`/${base.split('/')[1]}/`))) expect((await request.get(href.split('#')[0], { maxRedirects: 0 })).status(), href).toBe(200);
      await page.goto(path);
      await page.getByRole('button', { name: button }).click();
      const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
      await expect(desk).toBeVisible();
      await expect(desk.locator('.desk-summary')).toContainText('Dried cassava chips');
      expect(await dataLayer(page)).toContainEqual({ event: 'trade_desk_open', source: SOURCES[base][slug], product: 'dried-cassava-chips', locale: 'en' });
    });
  }
}

test('the Korean guides link the market page, never replace it; they are not translations (no hreflang)', async ({ request }) => {
  for (const slug of KO_CASSAVA_GUIDES) {
    const html = await (await request.get(`/ko/tapioca-chips/${slug}`)).text();
    expect(tags(html, 'a').map(a => a.href), slug).toContain('/ko/tapioca-market');
    expect(head(html).hreflang, slug).toEqual({});
  }
  // Every link to a Korean page leads to the procurement page, its guides or the market page.
  const html = await (await request.get('/ko/tapioca-chips/quality-guide')).text();
  const allowed = ['/ko/tapioca-chips', '/ko/tapioca-market', ...KO_CASSAVA_GUIDES.map(slug => `/ko/tapioca-chips/${slug}`)];
  for (const href of tags(html, 'a').map(a => a.href).filter(h => h.startsWith('/ko'))) expect(allowed, href).toContain(href.split('#')[0]);
  // The quality guide leads with the quality section of the page.
  expect(tags(html, 'a').find(a => a.href.startsWith('/ko/tapioca-chips#'))?.href).toBe('/ko/tapioca-chips#quality');
});

const ARTICLES = [
  ['/blog/dried-cassava-chips-ethanol-procurement-guide', 'Send your requirement to HMV', 'en_ethanol_guide', '/products/dried-cassava-chips'],
  ['/vi/tin-tuc/chat-luong-san-lat-kho-huong-dan-thu-mua', 'Gửi yêu cầu thu mua cho HMV', 'vi_quality_guide', '/vi/san-pham/san-lat-kho'],
  ['/blog/importing-dried-cassava-chips-from-vietnam', 'Send your requirement to HMV', 'en_import_guide', '/products/dried-cassava-chips'],
  ['/vi/tin-tuc/huong-dan-nhap-khau-san-lat-kho-tu-viet-nam', 'Gửi yêu cầu thu mua cho HMV', 'vi_import_guide', '/vi/san-pham/san-lat-kho'],
];
for (const [path, label, source, product] of ARTICLES) {
  test(`${path}: links to the cassava page in its language; the call to action opens the Trade Desk with ${source}`, async ({ page, request }) => {
    const html = await (await request.get(path, { maxRedirects: 0 })).text();
    expect(tags(html, 'a').map(a => a.href)).toContain(product);
    expect(html).not.toContain('FAQPage');
    await page.goto(path);
    await page.locator('.article-cta').getByRole('button', { name: label }).click();
    await expect(page.getByRole('dialog', { name: 'HMV Trade Desk' })).toBeVisible();
    expect(await dataLayer(page)).toContainEqual(expect.objectContaining({ event: 'trade_desk_open', source, product: 'dried-cassava-chips' }));
  });
}

test('the import guide: an Article with one h1, a reciprocal EN/VI pair, and the title that is not a supplier page', async ({ request }) => {
  const en = head(await (await request.get('/blog/importing-dried-cassava-chips-from-vietnam')).text());
  const vi = head(await (await request.get('/vi/tin-tuc/huong-dan-nhap-khau-san-lat-kho-tu-viet-nam')).text());
  expect(en.h1).toBe('Importing Dried Cassava Chips from Vietnam: A Buyer’s Procurement Guide');
  expect(vi.h1).toBe('Hướng dẫn buyer nhập sắn lát khô từ Việt Nam');
  expect(en.canonical).toBe('https://www.hmv-global.com/blog/importing-dried-cassava-chips-from-vietnam');
  expect(vi.canonical).toBe('https://www.hmv-global.com/vi/tin-tuc/huong-dan-nhap-khau-san-lat-kho-tu-viet-nam');
  for (const h of [en, vi]) {
    expect(h.hreflang).toEqual({ en: en.canonical, vi: vi.canonical, 'x-default': en.canonical });
    expect(h.title).not.toMatch(/supplier|nhà cung cấp/i);
    expect(JSON.stringify(h.jsonLd)).toContain('"Article"');
  }
});

test('the cassava pages link their guides: the Chinese and Korean pages their three, the EN and VI pages their articles', async ({ request }) => {
  const guides = async path => {
    const html = await (await request.get(path)).text();
    const section = html.slice(html.indexOf('<section id="guides"'), html.indexOf('</section>', html.indexOf('<section id="guides"')));
    return tags(section, 'a').map(a => a.href);
  };
  expect(await guides('/zh-cn/cassava-chips')).toEqual(ZH_CASSAVA_GUIDES.map(slug => `/zh-cn/cassava-chips/${slug}`));
  expect(await guides('/ko/tapioca-chips')).toEqual(KO_CASSAVA_GUIDES.map(slug => `/ko/tapioca-chips/${slug}`));
  expect(await guides('/products/dried-cassava-chips')).toEqual([
    '/blog/importing-dried-cassava-chips-from-vietnam',
    '/blog/dried-cassava-chips-ethanol-procurement-guide',
    '/blog/dried-cassava-chips-quality-procurement-guide',
  ]);
  expect(await guides('/vi/san-pham/san-lat-kho')).toEqual([
    '/vi/tin-tuc/huong-dan-nhap-khau-san-lat-kho-tu-viet-nam',
    '/vi/tin-tuc/san-lat-kho-cho-san-xuat-ethanol',
    '/vi/tin-tuc/chat-luong-san-lat-kho-huong-dan-thu-mua',
  ]);
});

test('the guides fit a 320 px screen: no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const { base, slugs } of SETS) {
    for (const slug of slugs) {
      await page.goto(`${base}/${slug}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${base}/${slug}`).toBeLessThanOrEqual(320);
    }
  }
});
