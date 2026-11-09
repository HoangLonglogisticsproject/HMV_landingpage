// @ts-check
import { test, expect } from '@playwright/test';
import { articles } from '../../src/data/articles.js';
import { PAGES, PRODUCT_SLUG_VI } from '../../src/i18n/routes.js';

/**
 * Image fidelity (architecture §11): on every page and in every lightbox, at a desktop DPR 2 and a phone DPR 3, each
 * image's aspect ratio is kept, the browser gets enough pixels for its painted size, and the source file has them.
 * Not a pixel comparison: re-encoding changes pixels on purpose (scripts/image-fidelity.mjs reviews the quality).
 */
const TARGETS = [
  { name: 'desktop', viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 },
  { name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 },
];
const KEYS = [...PAGES, ...Object.keys(PRODUCT_SLUG_VI).map(id => `/products/${id}`), ...articles.map(a => `/blog/${a.slug.en}`)];
const LIGHTBOXES = [
  { path: '/activities', triggers: '.activity-grid .activity-photo', img: '.photo-dialog img', close: 'Escape' },
  { path: '/logistics', triggers: '.dg-img-thumb, .cb-img-card', img: '.pack-lightbox img', close: '.pack-lightbox-close' },
  // Renders the image at its intrinsic size (no size rule on .lightbox-content), so only the aspect ratio applies.
  { path: '/packaging-logistics', triggers: '.pack-card-media, .stage-media', img: '.pack-lightbox img', close: '.lightbox-close', intrinsic: true },
];
// Served at the full resolution of the photograph HMV supplied (checked against the originals in commit f10daaa),
// which is smaller than their largest painted size × DPR: a sharper version needs a larger original, not an export.
const ORIGINAL_LIMITED = new Set(['car.webp', 'container1.webp', 'crossborder1.webp', 'crossborder2.webp',
  'crossborder3.webp', 'crossborder4.webp', 'crossborder5.webp', 'crossborder6.webp', 'factory-visit.webp',
  'farm-team.webp', 'forest-team.webp', 'fruitFarm.webp', 'fruitWeighing.webp', 'grower-visit.webp',
  'material-discussion.webp', 'mijack.webp', 'mijack2.webp', 'mijack3.webp', 'passion-fruit-cut.webp',
  'tapioca-starch-reference.webp', 'team-gathering.webp', 'vietnam-bananas.webp', 'visitfactory.webp']);

/** @param {import('@playwright/test').Locator} images */
async function measure(images) {
  return images.evaluateAll(async els => {
    const load = src => new Promise(done => { const i = new Image(); i.onload = () => done([i.naturalWidth, i.naturalHeight]); i.onerror = () => done([0, 0]); i.src = src; });
    return Promise.all(els.map(async el => {
      el.loading = 'eager';
      await el.decode().catch(() => {});
      const box = el.getBoundingClientRect();
      const url = new URL(el.currentSrc || el.src, location.href);
      const source = url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname;
      const [srcW, srcH] = await load(source);
      // naturalWidth of a srcset candidate is corrected for its density (CSS px); the optimizer's `w` is the pixel
      // width requested, and it never enlarges the source.
      const requested = Number(url.searchParams.get('w')) || el.naturalWidth;
      return { file: source.split('/').pop().replace(/\.[0-9a-z_-]{8,}\./i, '.'), fit: getComputedStyle(el).objectFit,
        boxW: box.width, boxH: box.height, ratio: el.naturalWidth / el.naturalHeight, px: Math.min(requested, srcW),
        srcW, srcH, svg: /\.svg$/.test(source) };
    }));
  });
}

function check(m, dpr, where, { intrinsic = false } = {}) {
  if (m.svg || !m.boxW || !m.boxH) return;
  const ratio = m.srcW / m.srcH;
  const label = `${where}: ${m.file}`;
  expect.soft(Math.abs(m.ratio - ratio) / ratio, `${label} delivered ratio`).toBeLessThan(0.01);
  if (m.fit === 'fill') expect.soft(Math.abs(m.boxW / m.boxH - ratio) / ratio, `${label} stretched`).toBeLessThan(0.015);
  if (intrinsic) return;
  // CSS pixels of the source that end up painted: cover crops one dimension, contain letterboxes.
  const painted = m.fit === 'cover' ? Math.max(m.boxW, m.boxH * ratio) : m.fit === 'contain' ? Math.min(m.boxW, m.boxH * ratio) : m.boxW;
  const need = Math.ceil(painted * dpr * 0.95);
  expect.soft(m.px, `${label} delivered ${m.px}px of ${need} needed (source ${m.srcW})`).toBeGreaterThanOrEqual(Math.min(need, m.srcW));
  if (!ORIGINAL_LIMITED.has(m.file)) expect.soft(m.srcW, `${label} source ${m.srcW}px, ${need} needed`).toBeGreaterThanOrEqual(need);
}

for (const target of TARGETS) {
  test(`images on every page keep their ratio and resolution, ${target.name}`, async ({ browser, baseURL }, info) => {
    test.skip(info.project.name !== 'chromium-desktop', 'one run sets its own viewports');
    test.setTimeout(180_000);
    const page = await browser.newPage({ viewport: target.viewport, deviceScaleFactor: target.deviceScaleFactor, baseURL });
    for (const key of KEYS) {
      await page.goto(key, { waitUntil: 'networkidle' });
      for (const m of await measure(page.locator('img'))) check(m, target.deviceScaleFactor, key);
    }
    await page.close();
  });

  test(`lightbox images keep their ratio and resolution, ${target.name}`, async ({ browser, baseURL }, info) => {
    test.skip(info.project.name !== 'chromium-desktop', 'one run sets its own viewports');
    test.setTimeout(180_000);
    const page = await browser.newPage({ viewport: target.viewport, deviceScaleFactor: target.deviceScaleFactor, baseURL });
    for (const box of LIGHTBOXES) {
      await page.goto(box.path, { waitUntil: 'networkidle' });
      const triggers = page.locator(box.triggers);
      for (let i = 0; i < await triggers.count(); i++) {
        const img = page.locator(box.img).first();
        // A click before hydration does nothing: retry.
        await expect(async () => {
          await triggers.nth(i).click();
          await expect(img).toBeVisible({ timeout: 2_000 });
        }).toPass({ timeout: 15_000 });
        for (const m of await measure(img)) check(m, target.deviceScaleFactor, `${box.path} lightbox ${i + 1}`, box);
        if (box.close === 'Escape') await page.keyboard.press('Escape');
        else await page.locator(box.close).first().dispatchEvent('click');
        await expect(img).toBeHidden();
      }
    }
    await page.close();
  });
}
