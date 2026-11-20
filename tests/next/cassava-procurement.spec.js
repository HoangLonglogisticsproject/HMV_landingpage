// @ts-check
import { test, expect } from '@playwright/test';
import { abs, head, tags } from './html.js';

/**
 * The EN/VI dried cassava chips page: the cassava procurement page of the Chinese and Korean pages
 * (views/products/CassavaProcurement) in the site's chrome, its calls to action the HMV Trade Desk. Its overflow from
 * 1440 to 375 px is checked in cassava-scoped.desktop.spec.js, its photographs in supply-evidence.spec.js, its hreflang
 * set and sitemap entry with every URL in next.spec.js. The copy is written out here: these are the exact strings the
 * pages must serve.
 */
const PAGES = {
  en: {
    path: '/products/dried-cassava-chips',
    title: 'Dried Cassava Chips Supplier in Vietnam | HMV Global',
    h1: 'Bulk Dried Cassava Chips Supply Managed by HMV Global',
    headings: [
      'Cassava chips for feed, starch and bioethanol', 'Why buyers work with HMV', 'Real supply evidence', 'Quality reference',
      'Supply network and capacity', 'Supply workflow', 'Frequently asked questions', 'Build Your Cassava Supply Plan with HMV',
    ],
    strip: 'On this page',
    evidence: ['Third-party laboratory analysis', 'How to read this sample result'],
    copy: [
      'Laboratory', 'Intertek Vietnam', 'Report number', 'AGRIVIETNAM2026-1700', 'Report date', '05 Oct 2026', 'Analysed', 'Submitted sample',
      'Not a fixed specification for every lot or shipment.',
      'Source: Intertek Vietnam analysis report AGRIVIETNAM2026-1700, dated 05 Oct 2026. The reported values apply to the analyzed sample.',
      '50,000 MT/month', '150 containers/month', 'not a guaranteed output for every buyer',
      'Is the 71.1% starch result a fixed specification?',
      'No. 71.1% is the result of one sample analysed by Intertek, not a fixed specification for every shipment.',
      'Looking for tapioca starch? It is a separate product.',
    ],
    hero: 'Build Your Cassava Supply Plan with HMV',
    closing: 'Send your requirement to HMV',
    desk: { destination: 'Delivery destination', volume: 'Expected volume', request: 'Request Quotation', company: 'Company', email: 'Business email', consent: 'HMV may contact me about this inquiry.', send: 'Send Request' },
  },
  vi: {
    path: '/vi/san-pham/san-lat-kho',
    title: 'Nhà cung cấp sắn lát khô B2B tại Việt Nam | HMV Global',
    h1: 'Nguồn cung sắn lát khô số lượng lớn do HMV Global điều phối',
    headings: [
      'Sắn lát cho thức ăn chăn nuôi, tinh bột và bioethanol', 'Vì sao người mua chọn HMV', 'Hình ảnh nguồn hàng thực tế',
      'Tham chiếu chất lượng', 'Mạng lưới và năng lực cung ứng', 'Quy trình cung ứng', 'Câu hỏi thường gặp',
      'Xây dựng phương án cung ứng sắn lát cùng HMV',
    ],
    strip: 'Trên trang này',
    evidence: ['Phân tích phòng thí nghiệm bên thứ ba', 'Cách hiểu kết quả mẫu này'],
    copy: [
      'Phòng thí nghiệm', 'Intertek Việt Nam', 'Số báo cáo', 'AGRIVIETNAM2026-1700', 'Ngày báo cáo', '05/10/2026', 'Đối tượng phân tích',
      'Mẫu gửi phân tích', 'Third-party laboratory analysis', 'Không phải thông số cố định cho mọi lô hàng.',
      'Nguồn: Báo cáo phân tích Intertek Việt Nam AGRIVIETNAM2026-1700 ngày 05/10/2026. Các giá trị áp dụng cho mẫu được phân tích.',
      '50.000 tấn/tháng', '150 container/tháng', 'không phải sản lượng cam kết cho mọi khách hàng',
      'Kết quả tinh bột 71,1% có phải thông số cố định không?',
      'Không. 71,1% là kết quả của một mẫu do Intertek phân tích, không phải thông số cố định cho mọi lô hàng.',
      'Bạn cần tinh bột sắn? Đó là một sản phẩm riêng.',
    ],
    hero: 'Xây dựng phương án cung ứng sắn lát cùng HMV',
    closing: 'Gửi yêu cầu thu mua cho HMV',
    desk: { destination: 'Nơi giao hàng', volume: 'Sản lượng dự kiến', request: 'Yêu cầu báo giá', company: 'Công ty', email: 'Email doanh nghiệp', consent: 'Tôi đồng ý để HMV liên hệ về yêu cầu này.', send: 'Gửi yêu cầu' },
  },
};
const SECTIONS = ['overview', 'applications', 'why-hmv', 'supply-evidence', 'quality', 'capability', 'workflow', 'faq', 'rfq'];
// One submitted sample analysed by Intertek: no certification or guarantee of the product, the supplier or a shipment.
// The one guarantee named is denied: the network figures' "not a guaranteed output".
const CLAIMS = /certif|guarant|accredit|chứng nhận|bảo đảm|đảm bảo/i;

const get = async (request, path) => {
  const res = await request.get(path, { maxRedirects: 0 });
  expect(res.status(), path).toBe(200);
  return res.text();
};
const text = html => html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&#x27;/g, "'");

for (const [lang, p] of Object.entries(PAGES)) {
  test(`${lang} server HTML: the procurement page in the site's chrome; one h1, an h2 per section, the FAQ answers`, async ({ request }) => {
    const html = await get(request, p.path);
    const h = head(html);
    expect([h.lang, h.title, h.h1, h.canonical]).toEqual([lang, p.title, p.h1, abs(p.path)]);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    // The site's navigation and footer, not the page-scoped chrome of the Chinese and Korean pages.
    expect(html).toContain('nav-group');
    expect(html).toContain('pf-grid');
    expect(html).not.toMatch(/scoped-nav|scoped-footer/);
    // Each section labelled by its own heading, in page order.
    const sections = tags(html, 'section').filter(s => SECTIONS.includes(s.id));
    expect(sections.map(s => s.id)).toEqual(SECTIONS);
    for (const s of sections) expect(html, s.id).toMatch(new RegExp(`<h[12] id="${s['aria-labelledby']}"`));
    const headings = sections.slice(1).map(s => text(html.match(new RegExp(`<h2 id="${s['aria-labelledby']}"[^>]*>([\\s\\S]*?)</h2>`))?.[1] ?? ''));
    expect(headings).toEqual(p.headings);
    // The strip below the hero: real links to each section, in page order.
    const strip = html.slice(html.indexOf(`aria-label="${p.strip}"`), html.indexOf('id="applications"'));
    expect([...strip.matchAll(/href="#([\w-]+)"/g)].map(m => m[1])).toEqual(['overview', 'applications', 'supply-evidence', 'quality', 'capability', 'workflow', 'faq']);
    // Closed disclosure widgets whose answers are server-rendered, crawlable text; no FAQ structured data.
    expect(html.match(/<details\b/g)).toHaveLength(6);
    expect(html).not.toMatch(/<details[^>]*\bopen\b/);
    expect(html).not.toContain('FAQPage');
    const body = text(html);
    for (const copy of p.copy) expect(body, copy).toContain(copy);
  });

  test(`${lang} server HTML: quality reference, key results, then the third-party evidence; no report button; no certification claim`, async ({ request }) => {
    const html = await get(request, p.path);
    const quality = html.slice(html.indexOf('<section id="quality"'), html.indexOf('<section id="capability"'));
    const order = ['<dl', '<table', `>${p.evidence[0]}</h3>`, `>${p.evidence[1]}</h4>`].map(s => quality.indexOf(s));
    expect(order.every(at => at > 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(quality).toContain('<aside aria-labelledby="quality-evidence-title"');
    // The sanitized report pages are not committed yet (src/data/cassavaQualityReport.js): nothing to open or download.
    expect(quality).not.toMatch(/<(button|a|dialog)\b/);
    expect(text(html).replaceAll('not a guaranteed output', '')).not.toMatch(CLAIMS);
    // No legacy RFQ form or email draft on this page: its calls to action are the Trade Desk.
    expect(html).not.toMatch(/<form\b|name="product"/);
  });

  test(`${lang} a section link lands its heading below the sticky header`, async ({ page }) => {
    await page.goto(p.path);
    await page.locator(`nav[aria-label="${p.strip}"] a[href="#quality"]`).click();
    await expect(page).toHaveURL(/#quality$/);
    // The site's sticky bar (Navigation, --site-header-height).
    const header = await page.locator('.site-nav').first().boundingBox();
    await expect.poll(async () => (await page.locator('#quality h2').boundingBox())?.y ?? -1).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0));
  });
}

// Both calls to action open the HMV Trade Desk in the page's language with dried cassava chips; the inquiry carries
// this page (intercepted: nothing is sent). EN from the hero, VI from the closing call to action.
for (const [lang, at] of [['en', 'hero'], ['vi', 'rfq']]) {
  test(`${lang} the ${at} call to action sends a dried cassava chips inquiry with source ${lang}_${at} and this landing page`, async ({ page }) => {
    const p = PAGES[lang];
    let posted;
    await page.route('**/api/inquiry', async route => {
      posted = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) });
    });
    await page.goto(p.path);
    await page.locator(`#${at === 'hero' ? 'overview' : 'rfq'}`).getByRole('button', { name: at === 'hero' ? p.hero : p.closing }).click();
    const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
    await expect(desk).toHaveAttribute('lang', lang);
    for (const [label, value] of [[p.desk.destination, 'Chennai, India'], [p.desk.volume, '2000']]) {
      const input = desk.getByLabel(label, { exact: true });
      await input.fill(value);
      await input.press('Enter');
    }
    await desk.getByRole('button', { name: p.desk.request }).click();
    await desk.getByLabel(p.desk.company).fill('Example Feed Co.');
    await desk.getByLabel(p.desk.email).fill('buyer@example.com');
    await desk.getByLabel(p.desk.consent).check();
    await desk.getByRole('button', { name: p.desk.send }).click();
    await expect(desk).toContainText('HMV-2026-7KQ4XM');
    expect(posted).toMatchObject({ product: 'dried-cassava-chips', destination: 'Chennai, India' });
    expect(posted.context).toMatchObject({ page: p.path, landingPage: p.path });
    const events = await page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
    expect(events).toContainEqual({ event: 'trade_desk_open', source: `${lang}_${at}`, product: 'dried-cassava-chips', locale: lang });
  });
}
