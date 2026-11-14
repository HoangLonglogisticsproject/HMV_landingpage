// @ts-check
import { test, expect } from '@playwright/test';
import { tags } from './html.js';

/**
 * The cassava supply evidence (data/cassavaEvidence.js) in the server HTML of the EN, VI and Chinese cassava pages:
 * the same photographs, each language's copy, alt text and captions, between the buyer section and the quality
 * results, lazy and sized. The copy is written out here: these are the exact strings the pages must serve.
 */
const PAGES = { en: '/products/dried-cassava-chips', vi: '/vi/san-pham/san-lat-kho', zh: '/zh-cn/cassava-chips' };
const COPY = {
  en: {
    title: "Product, bulk supply and shipment evidence from HMV's supply operations",
    alt: [
      'A large pile of dried cassava chips under a steel roof, a handful of chips held in the foreground',
      'An open shipping container loaded with dried cassava chips, sacks stacked at the door',
      'Close-up of dried cassava chips, white flesh and brown peel',
    ],
    captions: ['Bulk dried cassava chips — real supply evidence', 'Container loading and shipment preparation', 'Dried cassava chips — product detail'],
    zoom: 'View larger image',
    close: 'Close image preview',
  },
  vi: {
    title: 'Sản phẩm, nguồn hàng và hoạt động chuẩn bị giao hàng trong mạng lưới HMV',
    alt: [
      'Đống sắn lát khô lớn dưới mái kèo thép, phía trước là một nắm sắn lát cầm trên tay',
      'Container mở cửa đã đóng sắn lát khô, các bao xếp ở cửa container',
      'Cận cảnh sắn lát khô, phần thịt trắng và vỏ nâu',
    ],
    captions: ['Sắn lát khô số lượng lớn — hình ảnh nguồn hàng thực tế', 'Đóng hàng và chuẩn bị container', 'Cận cảnh sắn lát khô'],
    zoom: 'Phóng to ảnh',
    close: 'Đóng ảnh phóng to',
  },
  zh: {
    title: 'HMV 供应网络中的产品、集货与出运实景',
    alt: ['钢结构屋顶下的大堆木薯干片，前景是手中的一把木薯干片', '已装入木薯干片的敞开集装箱，箱门处码放编织袋', '木薯干片特写，白色切面与褐色外皮'],
    captions: ['大宗木薯干片供应实景', '装柜及出运准备', '木薯干片产品实拍'],
    zoom: '查看大图',
    close: '关闭大图',
  },
};
const get = async (request, path) => {
  const res = await request.get(path, { maxRedirects: 0 });
  expect(res.status(), path).toBe(200);
  return res.text();
};
const FILES = ['cassava-bulk-stock.webp', 'cassava-container-loading.webp', 'dried-cassava-chips-detail.webp'];
// The file behind a next/image URL, without its build hash.
const asset = src => new URL(src, 'http://x').searchParams.get('url')?.split('/').pop()?.replace(/\.[\w-]{8,}\./, '.');
// The buyer section before the evidence: its eyebrow, or its id on the Chinese page.
const BUYER_SECTION = { en: 'WHY BUYERS WORK WITH HMV', vi: 'VÌ SAO NGƯỜI MUA CHỌN HMV', zh: 'id="capability"' };

test('EN, VI and Chinese cassava pages: the same photographs, with their language\'s copy, alt text and captions', async ({ request }) => {
  const files = {};
  for (const [lang, path] of Object.entries(PAGES)) {
    const html = await get(request, path);
    // What HMV organizes (the buyer section), the photographs, then the quality results.
    const [buyer, start, quality] = [BUYER_SECTION[lang], 'id="supply-evidence"', 'id="quality"'].map(s => html.indexOf(s));
    expect(buyer, lang).toBeGreaterThan(0);
    expect(start, lang).toBeGreaterThan(buyer);
    expect(quality, lang).toBeGreaterThan(start);
    const evidence = html.slice(start, quality);
    expect(evidence).toContain(`<h2>${COPY[lang].title.replace("'", '&#x27;')}</h2>`);
    const images = tags(evidence, 'img');
    expect(images.map(i => i.alt), lang).toEqual(COPY[lang].alt);
    expect([...evidence.matchAll(/<figcaption>(.*?)<\/figcaption>/g)].map(m => m[1]), lang).toEqual(COPY[lang].captions);
    // Each photograph is the button that opens it larger (components/common/Lightbox ZoomTrigger).
    const frames = tags(evidence, 'div').filter(d => d.class === 'supply-evidence-frame');
    expect(frames.map(d => [d.role, d.tabindex, d.title]), lang).toEqual(FILES.map(() => ['button', '0', COPY[lang].zoom]));
    // Sized, lazy and never prioritized: the hero keeps the bandwidth.
    for (const img of images) {
      expect(Number(img.width) * Number(img.height), img.alt).toBeGreaterThan(0);
      expect(img.loading, img.alt).toBe('lazy');
      expect(img.fetchpriority, img.alt).toBeUndefined();
      expect(img.sizes, img.alt).toMatch(/^\(max-width: 600px\)/);
    }
    files[lang] = images.map(i => asset(i.src));
    // No preload of an evidence photograph.
    expect(tags(html, 'link').filter(l => l.rel === 'preload' && /cassava-(bulk|container)|dried-cassava/.test(l.imagesrcset ?? l.href ?? ''))).toEqual([]);
  }
  expect(files.en).toEqual(FILES);
  expect(files.vi).toEqual(files.en);
  expect(files.zh).toEqual(files.en);
});

test('no other page shows the supply evidence or its photographs', async ({ request }) => {
  for (const path of ['/', '/products/passion-fruit', '/vi/san-pham/chanh-day', '/products/bananas', '/products/tapioca-starch', '/trade-solutions']) {
    const html = await get(request, path);
    expect(html, path).not.toContain('supply-evidence');
    expect(html, path).not.toMatch(/cassava-bulk-stock|cassava-container-loading|dried-cassava-chips-detail/);
  }
});

// The lightbox (features/cassava-supply-evidence/SupplyEvidencePreview): the production file whole, never an original.
test('each photograph opens larger, the same optimized file with its caption, and closes by Escape, button or backdrop', async ({ page }) => {
  const requests = [];
  page.on('request', r => requests.push(r.url()));
  for (const [lang, path] of Object.entries(PAGES)) {
    await page.goto(path);
    const frames = page.locator('#supply-evidence .supply-evidence-frame');
    await expect(frames).toHaveCount(FILES.length);
    const dialog = page.getByRole('dialog');
    for (const [i, file] of FILES.entries()) {
      await frames.nth(i).click();
      await expect(dialog, `${lang} ${file}`).toHaveAttribute('aria-label', COPY[lang].captions[i]);
      await expect(dialog.locator('figcaption')).toHaveText(COPY[lang].captions[i]);
      const img = dialog.locator('img');
      await expect(img).toHaveAttribute('alt', COPY[lang].alt[i]);
      expect(asset(await img.getAttribute('src'))).toBe(file);
      // Whole and inside the viewport.
      await expect(img).toHaveCSS('object-fit', 'contain');
      const box = await img.boundingBox();
      const view = page.viewportSize();
      expect(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= (view?.width ?? 0) && box.y + box.height <= (view?.height ?? 0), file).toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(frames.nth(i)).toBeFocused();
    }
    // The keyboard opens it too; the close button and the backdrop close it.
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    // The focused close button is inside the dialog, with the photograph and its caption.
    await expect(dialog.getByRole('button', { name: COPY[lang].close })).toBeFocused();
    await dialog.getByRole('button', { name: COPY[lang].close }).click();
    await expect(dialog).toBeHidden();
    await expect(frames.last()).toBeFocused();
    await page.keyboard.press(' ');
    await expect(dialog).toBeVisible();
    await page.locator('.supply-evidence-preview').click({ position: { x: 5, y: 5 } });
    await expect(dialog).toBeHidden();
  }
  expect(requests.filter(url => /\.jpe?g/i.test(decodeURIComponent(url)))).toEqual([]);
});
