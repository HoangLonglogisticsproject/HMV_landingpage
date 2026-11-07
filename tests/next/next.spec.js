// @ts-check
import { test, expect } from '@playwright/test';
import { articles } from '../../src/data/articles.js';
import { LOCALES, PAGES, PRODUCT_SLUG_VI, localizePath } from '../../src/i18n/routes.js';
import { abs, head, tags } from './html.js';

/**
 * Next.js site in EN and VI: server HTML, status codes, redirects, noindex, client islands and the language switch.
 * Run with playwright.next.config.js (never against the production domain).
 */

// Every indexable URL, from the route contract: each page, product and article in each language.
const KEYS = [...PAGES, ...Object.keys(PRODUCT_SLUG_VI).map(id => `/products/${id}`), ...articles.map(a => `/blog/${a.slug.en}`)];
const URLS = LOCALES.flatMap(lang => KEYS.map(key => ({ key, lang, path: localizePath(key, lang) })));

// Server-rendered pages: everything a crawler or link preview needs is in the HTML, before any JavaScript.
for (const { key, lang, path } of URLS) {
  test(`server HTML ${path}`, async ({ request }) => {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const html = await res.text();
    const h = head(html);
    expect(h.lang).toBe(lang);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(h.h1).toBeTruthy();
    expect(h.title).toMatch(/. \| HMV Global$/);
    expect(h.title.split(' | '), 'one brand suffix (D-06)').toHaveLength(2);
    expect(h.description).toBeTruthy();
    expect(h.canonical).toBe(abs(path));
    const en = abs(localizePath(key, 'en'));
    expect(h.hreflang).toEqual({ en, vi: abs(localizePath(key, 'vi')), 'x-default': en });
    // This is the Next.js build, not the Vite SPA shell.
    expect(html).toContain('/_next/static/');
    expect(html).not.toContain('<div id="root"></div>');
  });
}

// Spot checks of the visible copy (the full Vite/Next parity check compares every page).
const COPY = [
  { path: '/', h1: 'Rooted in the land.Connecting the world.', title: 'Agricultural Supply Chain & Global Trading | HMV Global' },
  { path: '/vi', h1: 'Bám rễ từ đất lành.Vươn tầm ra thế giới.', title: 'Chuỗi cung ứng nông nghiệp & thương mại quốc tế | HMV Global' },
  { path: '/about', h1: 'About HMV', title: 'About HMV | HMV Global' },
  { path: '/vi/about', h1: 'Về HMV', title: 'Về HMV | HMV Global' },
  { path: '/contact', h1: 'Partner with us', title: 'Partner with us | HMV Global' },
  { path: '/vi/contact', h1: 'Kết nối hợp tác', title: 'Kết nối hợp tác | HMV Global' },
  { path: '/vi/supply-chain', h1: 'Chuỗi cung ứng', title: 'Chuỗi cung ứng | HMV Global' },
  { path: '/vi/san-pham/hat-dieu', h1: 'Hạt điều', title: 'Hạt điều | HMV Global' },
  { path: '/products/nuts', h1: 'Cashew nuts', title: 'Cashew nuts | HMV Global' },
  { path: '/vi/tin-tuc/xuat-khau-chanh-day-eu', title: 'Xuất khẩu Chanh dây sang Châu Âu: Tiêu chuẩn GlobalGAP và câu chuyện của HMV Global. | HMV Global' },
  // Decision D-06: one brand suffix, added by the title template.
  { path: '/logistics', title: 'International Logistics & Dangerous Goods Handling | HMV Global' },
  { path: '/vi/packaging-logistics', title: 'Quy Cách Đóng Gói & Vận Chuyển Xuất Khẩu | HMV Global' },
];

for (const p of COPY) {
  test(`copy ${p.path}`, async ({ request }) => {
    const h = head(await (await request.get(p.path)).text());
    expect(h.title).toBe(p.title);
    if (p.h1) expect(h.h1).toBe(p.h1);
  });
}

test('articles carry Article structured data in their language', async ({ request }) => {
  for (const { key, lang, path } of URLS.filter(u => u.key.startsWith('/blog/'))) {
    const html = await (await request.get(path)).text();
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    const data = JSON.parse(json ?? 'null');
    expect(data, key).toMatchObject({ '@type': 'Article', inLanguage: lang, headline: head(html).h1 });
  }
});

test('the home page HTML contains every section, client components included', async ({ request }) => {
  const html = await (await request.get('/')).text();
  for (const heading of ['THE VALUE JOURNEY', 'CORE COMMODITIES', 'PARTNER COMMUNITY', 'HMV GLOBAL IN ACTION',
    'GLOBAL REACH', 'HMV ECONEWS', 'Initiate Trade', 'Exporting Passion Fruit']) {
    expect(html, heading).toContain(heading);
  }
});

test('internal links in Vietnamese pages point to Vietnamese URLs', async ({ request }) => {
  const html = await (await request.get('/vi')).text();
  const hrefs = tags(html, 'a').map(a => a.href);
  expect(hrefs).toContain('/vi/about');
  expect(hrefs).toContain('/vi/contact');
  expect(hrefs).toContain('/vi/san-pham/chanh-day');
  expect(hrefs).toContain('/vi/tin-tuc/xuat-khau-chanh-day-eu');
  expect(hrefs).toContain('/vi/logistics');
  expect(hrefs).not.toContain('/about');
});

// Unknown URLs: a real 404 (not the SPA's 200), noindex, and the same chrome-less English 404 page as the Vite site,
// server-rendered (app/global-not-found.tsx). Unknown products and articles are not generated (dynamicParams = false).
const NOT_FOUND = ['/this-page-does-not-exist', '/vi/trang-khong-ton-tai', '/about/extra', '/products/unknown',
  '/vi/san-pham/unknown'];
for (const path of NOT_FOUND) {
  test(`404 ${path}`, async ({ request }) => {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
    const html = await res.text();
    const h = head(html);
    expect(h.lang).toBe('en');
    expect(h.title).toBe('Page not found | HMV Global');
    expect(h.h1).toBe('Page not found');
    expect(h.robots).toContain('noindex');
    expect(html).toContain('class="not-found"');
    expect(html).not.toContain('class="site-nav"');
    expect(tags(html, 'a').some(a => a.href === '/')).toBe(true);
  });
}

// Unknown article slugs reach the article route (dynamicParams = true, for new CMS articles): 404 and noindex, with
// Next.js's default 404 body rendered on the client (two root layouts; architecture §10, decision D-17).
const ARTICLE_NOT_FOUND = ['/blog/unknown', '/vi/tin-tuc/unknown'];
for (const path of ARTICLE_NOT_FOUND) {
  test(`404 ${path}`, async ({ request }) => {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
    expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
    expect(head(await res.text()).robots).toContain('noindex');
  });
}

// What the visitor actually sees there: Next.js's default 404, not the site's. Accepted UX exception (D-17) with correct
// 404 and noindex semantics; not a solved problem.
test('unknown article slug in a browser: Next.js default 404 page (accepted exception, D-17)', async ({ page }) => {
  for (const path of ARTICLE_NOT_FOUND) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.locator('h1'), path).toHaveText('404');
    await expect(page.getByText('This page could not be found.'), path).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first(), path).toHaveAttribute('content', /noindex/);
    await expect(page.locator('.site-nav'), path).toHaveCount(0);
  }
});

// Redirect chains as implemented: the proxy resolves legacy forms in one hop without `lang`; a trailing slash costs
// one extra hop (Next.js removes it before the proxy runs). Location must stay on the tested host.
const CHAINS = [
  ['/about?lang=vi', ['/vi/about']],
  ['/?lang=vi', ['/vi']],
  ['/vi/about?lang=en', ['/about']],
  ['/about/', ['/about']],
  ['/vi/', ['/vi']],
  ['/en/about', ['/about']],
  ['/en', ['/']],
  ['/en/about/?lang=vi', ['/en/about?lang=vi', '/vi/about']],
  ['/en/about/', ['/en/about', '/about']],
  ['/about/?lang=vi', ['/about?lang=vi', '/vi/about']],
  ['/products/?lang=vi', ['/products?lang=vi', '/vi/trade-solutions']],
  ['/blog', ['/insights']],
  ['/vi/tin-tuc', ['/vi/insights']],
  ['/vi/blog', ['/vi/insights']],
  ['/vi/products', ['/vi/trade-solutions']],
  ['/index.html', ['/']],
  ['/contact?product=Passion%20fruit&utm_source=li&lang=vi', ['/vi/contact?product=Passion+fruit&utm_source=li']],
  ['/products?lang=vi', ['/vi/trade-solutions']],
  ['/products', ['/trade-solutions']],
  ['/vi/san-pham', ['/vi/trade-solutions']],
  ['/vi/products/passion-fruit', ['/vi/san-pham/chanh-day']],
  ['/products/nuts?lang=vi', ['/vi/san-pham/hat-dieu']],
  ['/blog/exporting-passion-fruit-eu?lang=vi', ['/vi/tin-tuc/xuat-khau-chanh-day-eu']],
  ['/vi/blog/exporting-passion-fruit-eu', ['/vi/tin-tuc/xuat-khau-chanh-day-eu']],
  // The other language's article slug: the article route answers (prerendered redirect).
  ['/blog/xuat-khau-chanh-day-eu', ['/blog/exporting-passion-fruit-eu']],
  ['/vi/tin-tuc/exporting-passion-fruit-eu', ['/vi/tin-tuc/xuat-khau-chanh-day-eu']],
  // The CMS admin's link format (M-56), resolved by app/tin-tuc/[slug]/route.ts.
  ['/tin-tuc/xuat-khau-chanh-day-eu', ['/vi/tin-tuc/xuat-khau-chanh-day-eu']],
  ['/tin-tuc/exporting-passion-fruit-eu', ['/blog/exporting-passion-fruit-eu']],
];

test('/tin-tuc/<unknown> is a 404', async ({ request }) => {
  expect((await request.get('/tin-tuc/unknown', { maxRedirects: 0 })).status()).toBe(404);
});

// One canonical formatter for every surface: the sitemap's <loc> is the page's canonical and og:url, string for string,
// and its alternates are the page's hreflang set, string for string.
test('sitemap: every indexable URL, with exactly the page canonical, og:url and hreflang strings', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => ({
    loc: body.match(/<loc>([^<]+)<\/loc>/)?.[1],
    alternates: Object.fromEntries([...body.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(([, l, h]) => [l, h])),
  }));
  expect(entries.map(e => e.loc).sort()).toEqual(URLS.map(u => abs(u.path)).sort());
  for (const { path } of URLS) {
    const h = head(await (await request.get(path)).text());
    const entry = entries.find(e => e.loc === h.canonical);
    expect(entry, path).toBeDefined();
    expect(h.ogUrl, path).toBe(h.canonical);
    expect(entry?.alternates, path).toEqual(h.hreflang);
  }
});

test('robots.txt allows crawling and points to the sitemap', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toMatch(/User-Agent: \*\s+Allow: \//i);
  expect(robots).toContain('Sitemap: https://www.hmv-global.com/sitemap.xml');
});

test('home pages carry Organization and WebSite structured data with confirmed facts only', async ({ request }) => {
  for (const path of ['/', '/vi']) {
    const html = await (await request.get(path)).text();
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? 'null';
    const [org, site] = JSON.parse(json)['@graph'];
    expect(Object.keys(org).sort(), path).toEqual(['@id', '@type', 'alternateName', 'logo', 'name', 'url']);
    expect(site, path).toMatchObject({ '@type': 'WebSite', url: 'https://www.hmv-global.com', publisher: { '@id': org['@id'] } });
  }
});

test('the revalidation endpoint refuses requests without the secret', async ({ request }) => {
  expect((await request.post('/api/revalidate')).status()).toBe(401);
  expect((await request.post('/api/revalidate', { headers: { 'x-revalidate-secret': 'guess' } })).status()).toBe(401);
});

for (const [from, hops] of CHAINS) {
  test(`redirect ${from}`, async ({ request, baseURL }) => {
    let url = from;
    for (const expected of hops) {
      const res = await request.get(url, { maxRedirects: 0 });
      expect(res.status(), url).toBe(308);
      // Raw headers: exactly one Location (Next.js 16.4.5 can send two after an ISR regeneration; architecture §10).
      expect(res.headersArray().filter(h => h.name.toLowerCase() === 'location'), url).toHaveLength(1);
      const location = new URL(res.headers().location, baseURL);
      expect(location.host).toBe(new URL(String(baseURL)).host);
      url = location.pathname + location.search;
      expect(url).toBe(expected);
    }
    const final = await request.get(url, { maxRedirects: 0 });
    expect(final.status(), `${url} must not redirect again`).not.toBe(308);
  });
}

// Fail-safe for test deployments: every page and 404 is noindex (header and meta) unless SITE_INDEXABLE=true.
// Redirect responses have no indexable body; their targets are covered here.
test('pages and 404s are noindex until SITE_INDEXABLE=true', async ({ request }) => {
  for (const path of [...URLS.map(u => u.path), ...NOT_FOUND, ...ARTICLE_NOT_FOUND]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.headers()['x-robots-tag'], path).toBe('noindex, nofollow');
    expect(head(await res.text()).robots, path).toContain('noindex');
  }
});

// Client islands on server-rendered pages: the photo preview opens and closes without a page-level client component.
for (const path of ['/logistics', '/vi/packaging-logistics']) {
  test(`photo preview ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.locator('.dg-img-thumb, .pack-card-media').first().click();
    const preview = page.locator('.pack-lightbox');
    await expect(preview).toBeVisible();
    await preview.click({ position: { x: 5, y: 5 } });
    await expect(preview).toHaveCount(0);
  });
}

test('the article back button returns to the previous page', async ({ page }) => {
  await page.goto('/vi/insights');
  await page.locator('a[href="/vi/tin-tuc/xuat-khau-chanh-day-eu"]').first().click();
  await expect(page).toHaveURL(/\/vi\/tin-tuc\/xuat-khau-chanh-day-eu$/);
  await page.locator('button.article-back').click();
  await expect(page).toHaveURL(/\/vi\/insights$/);
});

// Language switch regressions: the old `lang` parameter must never bring the visitor back to the old language,
// while product, UTM and #hash survive the switch.
test.describe('language switch', () => {
  test.beforeEach(() => test.skip(test.info().project.name === 'chromium-mobile', 'Switcher is inside the mobile drawer'));

  const switchTo = async (page, label) => {
    await page.locator('button.hmv-lang-trigger').first().click();
    await page.locator(`[role="menuitem"]:has-text("${label}")`).first().click();
  };

  test('/about?lang=vi, then English, stays English', async ({ page }) => {
    await page.goto('/about?lang=vi');
    await expect(page).toHaveURL(/\/vi\/about$/);
    await expect(page.locator('h1').first()).toHaveText('Về HMV');
    await switchTo(page, 'English');
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('h1').first()).toHaveText('About HMV');
    await page.reload();
    await expect(page.locator('h1').first()).toHaveText('About HMV');
  });

  test('contact keeps the product and UTM parameters across the switch', async ({ page }) => {
    await page.goto('/contact?product=Passion%20fruit&utm_source=li&lang=vi');
    await expect(page).toHaveURL(/\/vi\/contact\?product=Passion\+fruit&utm_source=li$/);
    const select = page.locator('form.inquiry-form select[name="product"]');
    await expect(select).toHaveValue('Passion fruit');
    await switchTo(page, 'English');
    await expect(page).toHaveURL(/\/contact\?product=Passion\+fruit&utm_source=li$/);
    await expect(page.locator('h1').first()).toHaveText('Partner with us');
    await expect(select).toHaveValue('Passion fruit');
  });

  test('the #hash survives the switch', async ({ page }) => {
    await page.goto('/vi#initiate-trade');
    await switchTo(page, 'English');
    await expect(page).toHaveURL(/\/#initiate-trade$/);
    await expect(page.locator('h1').first()).toContainText('Rooted in the land');
  });
});
