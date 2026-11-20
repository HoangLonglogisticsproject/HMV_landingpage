// @ts-check
import { test, expect } from '@playwright/test';
import { abs, head, tags } from './html.js';

/**
 * The Vietnam–Cambodia consolidation page (/logistics/vietnam-cambodia-consolidation, /vi/…): server HTML and SEO, the
 * phone layout down to 320 px, and the route assessment form: validation, the request it sends (intercepted), the
 * real endpoint without a delivery adapter (503, the email draft offered), and the Trade Desk left as it was. Every URL's
 * head tags are also checked in next.spec.js.
 */
const PAGES = {
  en: {
    path: '/logistics/vietnam-cambodia-consolidation',
    title: 'Vietnam–Cambodia LTL Consolidation & Cross-Border Freight | HMV Global',
    h1: 'Vietnam–Cambodia Cross-Border Consolidation for B2B Shipments',
    hub: '/logistics',
    submit: 'Request route assessment',
    labels: { origin: 'Origin (pickup)', destination: 'Destination (delivery)', cargo: 'Cargo description', volume: 'Weight / CBM / shipment volume', company: 'Company', email: 'Business email' },
    consent: 'HMV may contact me about this request.',
  },
  vi: {
    path: '/vi/logistics/vietnam-cambodia-consolidation',
    title: 'Ghép hàng Việt Nam – Campuchia & vận chuyển xuyên biên giới | HMV Global',
    h1: 'Ghép hàng Việt Nam – Campuchia cho lô hàng B2B',
    hub: '/vi/logistics',
    submit: 'Gửi yêu cầu đánh giá tuyến',
    labels: { origin: 'Điểm nhận hàng', destination: 'Điểm giao hàng', cargo: 'Mô tả hàng hóa', volume: 'Trọng lượng / CBM / khối lượng lô hàng', company: 'Công ty', email: 'Email doanh nghiệp' },
    consent: 'Tôi đồng ý để HMV liên hệ về yêu cầu này.',
  },
};
const ALTERNATES = { en: abs(PAGES.en.path), vi: abs(PAGES.vi.path), 'x-default': abs(PAGES.en.path) };
// Never claimed on the page: owned border infrastructure, schedules, transit or clearance commitments, DDP.
const CLAIMS = /\bCFS\b|\bDDP\b|daily departure|guaranteed|our (Moc Bai|border) warehouse|cleared within|\d+\s*(hours|days)\b|cam kết thời gian|khởi hành hằng ngày/i;

for (const [lang, p] of Object.entries(PAGES)) {
  test(`${lang} server HTML: one h1, its title, canonical and hreflang; in the site chrome; the hub linked; no FAQ data`, async ({ request }) => {
    const res = await request.get(p.path, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const html = await res.text();
    const h = head(html);
    expect([h.lang, h.title, h.h1, h.canonical]).toEqual([lang, p.title, p.h1, abs(p.path)]);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(h.hreflang).toEqual(ALTERNATES);
    expect(html).toContain('nav-group');
    const hrefs = tags(html, 'a').map(a => a.href);
    expect(hrefs).toContain(p.hub);
    expect(hrefs).toContain(`${p.hub}#cross-border`);
    expect(html).not.toContain('FAQPage');
    expect(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '')).not.toMatch(CLAIMS);
    // The form is in the server HTML, every field labelled.
    for (const label of Object.values(p.labels)) expect(html).toContain(`>${label}`);
  });

  test(`${lang}: no horizontal scroll from 320 px`, async ({ page }) => {
    for (const width of [320, 375, 768]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(p.path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
    }
  });
}

test('sitemap: both URLs, each with the EN/VI alternates', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const path of [PAGES.en.path, PAGES.vi.path]) {
    const entry = xml.match(new RegExp(`<url><loc>${abs(path)}</loc>.*?</url>`))?.[0] ?? '';
    for (const [lang, href] of Object.entries(ALTERNATES)) expect(entry, path).toContain(`hreflang="${lang}" href="${href}"`);
  }
});

/** @param {import('@playwright/test').Page} page */
async function fill(page, p) {
  const form = page.locator('#route-assessment form');
  await form.getByLabel(p.labels.origin).fill('Binh Duong, Vietnam');
  await form.getByLabel(p.labels.destination).fill('Phnom Penh, Cambodia');
  await form.getByLabel(p.labels.cargo).fill('Electronic components in cartons');
  await form.getByLabel(p.labels.volume).fill('4 pallets, 2.5 CBM, 900 kg');
  await form.getByLabel(p.labels.company).fill('Example Co');
  await form.getByLabel(p.labels.email).fill('ops@example.com');
  await form.getByLabel(p.consent).check();
  return form;
}

test('validation: an empty request is not sent; each required field shows its error, the first focused', async ({ page }) => {
  let posted = 0;
  await page.route('**/api/route-assessment', route => {
    posted++;
    return route.abort();
  });
  await page.goto(PAGES.en.path);
  const form = page.locator('#route-assessment form');
  await form.getByRole('button', { name: PAGES.en.submit }).click();
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(7);
  await expect(form.getByLabel(PAGES.en.labels.origin)).toBeFocused();
  await expect(form).toContainText('Enter the pickup location.');
  await expect(form).toContainText('Confirm that HMV may contact you.');
  expect(posted).toBe(0);
});

for (const [lang, p] of Object.entries(PAGES)) {
  test(`${lang}: the submission carries the service, its source and the page; sent with the reference after a 201`, async ({ page }) => {
    const bodies = [];
    await page.route('**/api/route-assessment', route => {
      bodies.push(route.request().postDataJSON());
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) });
    });
    await page.goto(p.path);
    const form = await fill(page, p);
    await form.getByRole('button', { name: p.submit }).click();
    await expect(page.locator('#route-assessment output')).toContainText('HMV-2026-7KQ4XM');
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toMatchObject({
      locale: lang,
      service: 'vietnam-cambodia-consolidation',
      source: `${lang}_route_assessment`,
      origin: 'Binh Duong, Vietnam',
      destination: 'Phnom Penh, Cambodia',
      cargo: 'Electronic components in cartons',
      volume: '4 pallets, 2.5 CBM, 900 kg',
      contact: { company: 'Example Co', email: 'ops@example.com', name: '', phone: '' },
      consent: { contact: true },
      context: { page: p.path },
      website: '',
    });
    const events = await page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
    expect(events).toContainEqual({ event: 'generate_lead', product: 'vietnam-cambodia-consolidation', locale: lang, route: 'route_assessment' });
  });
}

// No delivery adapter in this environment (playwright.next.config.js): the real endpoint validates, then refuses.
test('the real endpoint without delivery: 400 for an invalid request, 503 for a valid one; the form keeps the answers and offers email', async ({ page, request }) => {
  const bad = await request.post('/api/route-assessment', { data: { service: 'vietnam-cambodia-consolidation' } });
  expect(bad.status()).toBe(400);
  expect((await bad.json()).fields).toEqual(expect.arrayContaining(['origin', 'contact.email', 'consent.contact']));
  await page.goto(PAGES.en.path);
  const form = await fill(page, PAGES.en);
  const response = page.waitForResponse('**/api/route-assessment');
  await form.getByRole('button', { name: PAGES.en.submit }).click();
  expect((await response).status()).toBe(503);
  const alert = form.getByRole('alert');
  await expect(alert).toContainText('The request could not be sent. Your answers are kept.');
  await expect(alert.getByRole('button', { name: 'Prepare an email instead' })).toBeVisible();
  await expect(form.getByLabel(PAGES.en.labels.origin)).toHaveValue('Binh Duong, Vietnam');
});

// Indexing (noindex outside production, indexable in the production smoke) is checked for every URL in next.spec.js.

test('the commodity Trade Desk is unchanged: it opens on this page, and its endpoint still validates commodity inquiries', async ({ page, request }) => {
  await page.goto(PAGES.en.path);
  // openTradeDesk() (features/trade-desk/open.js), as every call to action does.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-hmv-trade-desk', { detail: { source: 'nav' } })));
  await expect(page.getByRole('dialog', { name: 'HMV Trade Desk' })).toBeVisible();
  const res = await request.post('/api/inquiry', { data: { service: 'vietnam-cambodia-consolidation' } });
  expect(res.status()).toBe(400);
  expect((await res.json()).fields).toContain('product');
});

test('/logistics links the page from its cross-border section, once', async ({ request }) => {
  for (const [hub, href] of [['/logistics', PAGES.en.path], ['/vi/logistics', PAGES.vi.path]]) {
    const html = await (await request.get(hub)).text();
    const section = html.slice(html.indexOf('id="cross-border"'), html.indexOf('id="agency-network"'));
    expect(tags(section, 'a').filter(a => a.href === href), hub).toHaveLength(1);
    expect(tags(html, 'a').filter(a => a.href === href), hub).toHaveLength(1);
  }
});
