// @ts-check
import { test, expect } from '@playwright/test';
import { passionFruitPages } from '../../src/data/passionFruitPages.js';

/**
 * The golden passion fruit pages, one per buyer segment, on the Next.js build: the segment navigation, language
 * switching, the calls to action into the Trade Desk and the Quick RFQ (the API response is mocked with page.route; the
 * endpoint is tested in trade-desk.spec.js), the sitemap pairs and the images. Runs on desktop and phone.
 */

// Written out, not derived from the route contract, so a change to the contract cannot move these URLs unnoticed.
const SEGMENTS = [
  { key: 'export', en: '/products/passion-fruit', vi: '/vi/san-pham/chanh-day', cta: 'Ask HMV Trade Desk', ctaVi: 'Hỏi HMV Trade Desk' },
  { key: 'foodservice', en: '/products/passion-fruit/foodservice', vi: '/vi/san-pham/chanh-day/khach-san-nha-hang', cta: 'Discuss Your Supply Needs', ctaVi: 'Trao đổi nhu cầu cung ứng' },
  { key: 'retail', en: '/products/passion-fruit/retail', vi: '/vi/san-pham/chanh-day/doi-tac-ban-le', cta: 'Discuss a Retail Partnership', ctaVi: 'Trao đổi hợp tác phân phối' },
];
const NAV_EN = ['International Buyers', 'Foodservice', 'Retail Business'];
const NAV_VI = ['Xuất khẩu', 'Khách sạn & F&B', 'Đối tác bán lẻ'];
const desk = page => page.getByRole('dialog', { name: 'HMV Trade Desk' });
const h1Text = lang => key => {
  const { title } = passionFruitPages[lang][key].hero;
  return Array.isArray(title) ? title.join(' ') : title;
};

test('the segment navigation: three real links, the current page marked, back and forward work', async ({ page }) => {
  await page.goto('/products/passion-fruit', { waitUntil: 'networkidle' });
  const nav = page.getByRole('navigation', { name: 'Buyer segments' });
  await expect(nav.getByRole('link')).toHaveText(NAV_EN);
  expect(await nav.getByRole('link').evaluateAll(links => links.map(a => a.getAttribute('href')))).toEqual(SEGMENTS.map(s => s.en));
  await expect(nav.getByRole('link', { name: NAV_EN[0] })).toHaveAttribute('aria-current', 'page');
  await expect(nav.locator('[aria-current]')).toHaveCount(1);

  await nav.getByRole('link', { name: 'Foodservice' }).click();
  await expect(page).toHaveURL(/\/products\/passion-fruit\/foodservice$/);
  await expect(page.locator('h1')).toHaveText('An Exceptional Ingredient. A Memorable Experience.');
  await expect(nav.getByRole('link', { name: 'Foodservice' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'Retail Business' }).click();
  await expect(page).toHaveURL(/\/products\/passion-fruit\/retail$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/foodservice$/);
  await expect(page.locator('h1')).toHaveText('An Exceptional Ingredient. A Memorable Experience.');
  await page.goBack();
  await expect(page).toHaveURL(/\/products\/passion-fruit$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/foodservice$/);

  // The keyboard reaches and activates a segment link, and the focus is visible.
  await nav.getByRole('link', { name: 'Retail Business' }).focus();
  await expect(nav.getByRole('link', { name: 'Retail Business' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/retail$/);
});

for (const { key, en, vi } of SEGMENTS) {
  test(`${key}: a direct URL and a refresh render the page in both languages, one h1, the navigation in the page's language`, async ({ page }) => {
    for (const [path, lang, labels] of [[en, 'en', NAV_EN], [vi, 'vi', NAV_VI]]) {
      await page.goto(path);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(h1Text(lang)(key));
      await expect(page.getByRole('navigation', { name: lang === 'en' ? 'Buyer segments' : 'Nhóm khách hàng' }).getByRole('link')).toHaveText(labels);
    }
  });

  test(`${key}: the call to action opens the Trade Desk with passion fruit known`, async ({ page }) => {
    await page.goto(en, { waitUntil: 'networkidle' });
    const cta = page.getByRole('button', { name: key === 'export' ? 'Ask HMV Trade Desk' : SEGMENTS.find(s => s.key === key)?.cta, exact: true }).first();
    await cta.click();
    await expect(desk(page)).toBeVisible();
    await expect(desk(page).getByRole('complementary', { name: 'Your requirement' })).toContainText('Passion fruit');
    await expect(desk(page).getByRole('log')).toHaveText('HMVWhere would you like the goods delivered?');
    await page.keyboard.press('Escape');
    await expect(desk(page)).toBeHidden();
  });

  test(`${key}: every internal link resolves, every image loads and is described`, async ({ page, request }) => {
    await page.goto(en, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 40));
      }
    });
    // The optimizer renders a large candidate on its first request: wait for every image that is shown, not for a pause.
    await page.waitForFunction(() => [...document.images].filter(i => i.getBoundingClientRect().width > 0).every(i => i.complete), null, { timeout: 20_000 });
    const images = await page.evaluate(() => [...document.images].filter(i => i.getBoundingClientRect().width > 0).map(i => ({ src: i.src.slice(-50), ok: i.complete && i.naturalWidth > 0, alt: i.alt, decorative: !!i.closest('[aria-hidden="true"]') })));
    for (const img of images) {
      expect(img.ok, img.src).toBe(true);
      expect(img.alt.length > 0 || img.decorative, img.src).toBe(true);
    }
    const hrefs = await page.locator('main a[href^="/"]').evaluateAll(links => [...new Set(links.map(a => a.getAttribute('href').split('#')[0]))]);
    for (const href of hrefs.filter(Boolean)) expect((await request.get(href)).status(), href).toBe(200);
  });
}

test('the FAQ opens and closes from the keyboard', async ({ page }) => {
  await page.goto('/products/passion-fruit', { waitUntil: 'networkidle' });
  const first = page.locator('#faq details').first();
  await first.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('open', '');
  await expect(first.getByText(/availability, volume and timing/i)).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(first).not.toHaveAttribute('open', '');
});

test('foodservice and retail have no form: the business inquiry is the Trade Desk', async ({ page }) => {
  for (const path of [SEGMENTS[1].en, SEGMENTS[2].en]) {
    await page.goto(path);
    await expect(page.locator('main form, main input, main select')).toHaveCount(0);
  }
});

test('export: the Quick RFQ is the one form, fixed to passion fruit; its inquiry carries the page as the source', async ({ page }) => {
  const posted = [];
  await page.route('**/api/inquiry', async route => {
    posted.push(route.request().postDataJSON());
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) });
  });
  await page.goto('/products/passion-fruit?utm_source=newsletter', { waitUntil: 'networkidle' });
  await expect(page.locator('main form')).toHaveCount(1);
  // The hero's primary call to action takes the buyer to the form and into its first question.
  await page.getByRole('button', { name: 'Request a Supply Proposal' }).first().click();
  const form = page.locator('section#rfq form');
  await expect(form.getByLabel('Destination', { exact: true })).toBeFocused();
  await expect(form.getByLabel('Product', { exact: true })).toHaveCount(0);
  await form.getByLabel('Destination', { exact: true }).fill('Rotterdam, Netherlands');
  await form.getByLabel('Estimated volume', { exact: true }).fill('2');
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByLabel('Company', { exact: true }).fill('Example Foods B.V.');
  await form.getByLabel('Work email', { exact: true }).fill('buyer@example.com');
  await form.getByLabel('HMV may contact me about this inquiry.').check();
  await form.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.locator('section#rfq')).toContainText('HMV-2026-7KQ4XM');
  expect(posted).toHaveLength(1);
  expect(posted[0]).toMatchObject({
    locale: 'en',
    product: 'passion-fruit',
    destination: 'Rotterdam, Netherlands',
    volume: { amount: '2', unit: 'containers' },
    contact: { company: 'Example Foods B.V.', email: 'buyer@example.com' },
    consent: { contact: true },
    context: { page: '/products/passion-fruit', utm: { source: 'newsletter' } },
  });
  // The contract is unchanged: no field was added for the buyer segment, it is read from the source page.
  expect(Object.keys(posted[0]).sort()).toEqual(['application', 'consent', 'contact', 'context', 'destination', 'idempotencyKey', 'locale', 'notes', 'product', 'requirements', 'transport', 'volume', 'website']);
});

test('export: a refused inquiry says so and offers the email draft; nothing claims it was sent', async ({ page }) => {
  await page.route('**/api/inquiry', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }));
  await page.goto('/products/passion-fruit', { waitUntil: 'networkidle' });
  const form = page.locator('section#rfq form');
  await form.getByLabel('Destination', { exact: true }).fill('Busan, South Korea');
  await form.getByLabel('Estimated volume', { exact: true }).fill('1');
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByLabel('Company', { exact: true }).fill('Example Foods');
  await form.getByLabel('Work email', { exact: true }).fill('buyer@example.com');
  await form.getByLabel('HMV may contact me about this inquiry.').check();
  await form.getByRole('button', { name: 'Send Request' }).click();
  await expect(form.getByRole('alert')).toContainText('We could not send your request');
  await expect(form.getByRole('button', { name: 'Send by email instead' })).toBeVisible();
  await expect(page.locator('section#rfq')).not.toContainText(/request received/i);
});

test('the sitemap lists the six pages, each with its reciprocal EN/VI/x-default set', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const base = 'https://www.hmv-global.com';
  for (const { en, vi } of SEGMENTS) {
    const set = [`hreflang="en" href="${base}${en}"`, `hreflang="vi" href="${base}${vi}"`, `hreflang="x-default" href="${base}${en}"`];
    for (const loc of [en, vi]) {
      const entry = xml.split('<url>').find(chunk => chunk.startsWith(`<loc>${base}${loc}</loc>`));
      expect(entry, loc).toBeDefined();
      for (const link of set) expect(entry, `${loc} ${link}`).toContain(link);
    }
  }
});

test('each page has its own canonical, title and description, and hreflang to its own pair', async ({ request }) => {
  const seen = new Set();
  for (const { en, vi } of SEGMENTS) {
    for (const [path, other] of [[en, vi], [vi, en]]) {
      const html = await (await request.get(path)).text();
      expect(html, path).toContain(`<link rel="canonical" href="https://www.hmv-global.com${path}"/>`);
      expect(html, path).toContain(`href="https://www.hmv-global.com${other}"`);
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
      expect(description, path).toBeTruthy();
      expect(seen.has(description), `${path} description is unique`).toBe(false);
      seen.add(description);
    }
  }
});

// ── Buyer-aware inquiry: the volume question and the units of each segment (rules.js unitsFor) ─────────────────────────────

/** The buyer answers HMV's question in the conversation's field, sent with Enter. */
async function say(page, label, value) {
  const input = desk(page).getByLabel(label, { exact: true });
  await input.fill(value);
  await input.press('Enter');
}
const unitOptions = locator => locator.locator('option').allTextContents();

const QUESTIONS = {
  export: ['What quantity of golden passion fruit are you planning to import?', 'Anh/chị dự kiến nhập khẩu bao nhiêu chanh dây vàng?'],
  foodservice: ['What quantity of golden passion fruit does your hospitality or beverage business require?', 'Doanh nghiệp khách sạn, nhà hàng hoặc đồ uống của anh/chị cần bao nhiêu chanh dây vàng?'],
  retail: ['What quantity of golden passion fruit are you planning to distribute?', 'Anh/chị dự kiến phân phối bao nhiêu chanh dây vàng?'],
};

for (const { key, en, vi, cta, ctaVi } of SEGMENTS) {
  for (const [lang, path, index, label] of [['en', en, 0, cta], ['vi', vi, 1, ctaVi]]) {
    test(`${key} (${lang}): the Trade Desk asks the volume in the buyer's words and offers the segment's units`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.locator('main').getByRole('button', { name: label, exact: true }).first().click();
      await expect(desk(page)).toBeVisible();
      await desk(page).getByRole('textbox').first().fill('Da Nang');
      await desk(page).getByRole('textbox').first().press('Enter');
      await expect(desk(page).getByRole('log')).toContainText(QUESTIONS[key][index]);
      const unit = desk(page).getByRole('combobox');
      expect(await unitOptions(unit)).toEqual(lang === 'en'
        ? { export: ['containers', 'containers / month', 'MT', 'MT / month', 'kg'], foodservice: ['kg', 'kg / week', 'kg / month', 'MT', 'MT / month'], retail: ['kg', 'kg / week', 'kg / month', 'MT', 'MT / month'] }[key]
        : { export: ['container', 'container / tháng', 'tấn', 'tấn / tháng', 'kg'], foodservice: ['kg', 'kg / tuần', 'kg / tháng', 'tấn', 'tấn / tháng'], retail: ['kg', 'kg / tuần', 'kg / tháng', 'tấn', 'tấn / tháng'] }[key]);
      await expect(unit).toHaveValue(key === 'export' ? 'containers' : 'kg');
    });
  }
}

test('foodservice: kilograms per week reach the inquiry as they were meant, from the segment\'s own page', async ({ page }) => {
  let posted;
  await page.route('**/api/inquiry', async route => {
    posted = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) });
  });
  await page.goto(SEGMENTS[1].vi, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Trao đổi nhu cầu cung ứng' }).click();
  await say(page, 'Nơi giao hàng', 'Đà Nẵng');
  await desk(page).getByLabel('Sản lượng dự kiến', { exact: true }).fill('50');
  await desk(page).getByRole('combobox').selectOption('kg_week');
  await desk(page).getByLabel('Sản lượng dự kiến', { exact: true }).press('Enter');
  await expect(desk(page).locator('.desk-summary')).toContainText('50 kg / tuần');
  await desk(page).getByRole('button', { name: 'Yêu cầu báo giá' }).click();
  await desk(page).getByLabel('Công ty').fill('Resort Đà Nẵng');
  await desk(page).getByLabel('Email doanh nghiệp').fill('buyer@example.com');
  await desk(page).getByLabel('Tôi đồng ý để HMV liên hệ về yêu cầu này.').check();
  await desk(page).getByRole('button', { name: 'Gửi yêu cầu' }).click();
  await expect(desk(page)).toContainText('HMV-2026-7KQ4XM');
  expect(posted).toMatchObject({ locale: 'vi', product: 'passion-fruit', destination: 'Đà Nẵng', volume: { amount: '50', unit: 'kg_week' } });
  // The segment is the page the inquiry came from, as in every inquiry: no segment field was added.
  expect(posted.context).toMatchObject({ page: SEGMENTS[1].vi });
  expect(Object.keys(posted)).not.toContain('segment');
});

test('export: the Quick RFQ offers containers by default and kilograms as an option; the Trade Desk it opens keeps the page\'s segment', async ({ page }) => {
  await page.goto('/products/passion-fruit', { waitUntil: 'networkidle' });
  const unit = page.locator('section#rfq select');
  expect(await unitOptions(unit)).toEqual(['containers', 'containers / month', 'MT', 'MT / month', 'kg']);
  await expect(unit).toHaveValue('containers');
  await page.locator('section#rfq').getByLabel('Destination', { exact: true }).fill('Rotterdam');
  await page.locator('section#rfq').getByLabel('Estimated volume', { exact: true }).fill('500');
  await unit.selectOption('kg');
  await page.locator('section#rfq').getByRole('button', { name: 'Open HMV Trade Desk' }).click();
  await expect(desk(page).locator('.desk-summary')).toContainText('500 kg');
});

test('every other opener keeps its units: the home Quick RFQ and dried cassava chips are unchanged', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const form = page.locator('section#initiate-trade form.rfq-form');
  const unit = form.locator('select').last();
  await form.getByLabel('Product', { exact: true }).selectOption('passion-fruit');
  expect(await unitOptions(unit)).toEqual(['containers', 'containers / month', 'MT', 'MT / month']);
  await form.getByLabel('Product', { exact: true }).selectOption('dried-cassava-chips');
  expect(await unitOptions(unit)).toEqual(['containers', 'containers / month', 'MT', 'MT / month']);
  await expect(unit).toHaveValue('mt_month');
});

test('the API refuses kilograms of another product and a quantity of none; the existing units still pass', async ({ request }) => {
  const base = {
    idempotencyKey: '1f2e3d4c-5b6a-4987-8a7b-6c5d4e3f2a1b', locale: 'en', product: 'dried-cassava-chips', destination: 'Busan',
    volume: { amount: '5', unit: 'mt_month' }, contact: { company: 'Example Co', email: 'buyer@example.com' }, consent: { contact: true },
  };
  const status = async body => (await request.post('/api/inquiry', { data: body })).status();
  // Valid inquiries reach the delivery step: 503 here, which has no adapter (never 400).
  expect(await status(base)).toBe(503);
  expect(await status({ ...base, product: 'passion-fruit', volume: { amount: '50', unit: 'kg_week' } })).toBe(503);
  const refused = await request.post('/api/inquiry', { data: { ...base, volume: { amount: '5', unit: 'kg' } } });
  expect([refused.status(), (await refused.json()).fields]).toEqual([400, ['volume.unit']]);
  const none = await request.post('/api/inquiry', { data: { ...base, product: 'passion-fruit', volume: { amount: '0', unit: 'kg' } } });
  expect([none.status(), (await none.json()).fields]).toEqual([400, ['volume.amount']]);
});

// ── Supplier confidentiality: HMV is the one commercial point of contact ─────────────────────────────────────────────────────

const SUPPLIER_REPLY = {
  en: 'HMV Global coordinates sourcing and commercial communication through our supply network. Please share your requirements, and our team will assist with the relevant product information and supply arrangements.',
  vi: 'HMV Global điều phối nguồn hàng và trao đổi thương mại thông qua mạng lưới cung ứng của chúng tôi. Anh/chị vui lòng chia sẻ nhu cầu, đội ngũ HMV sẽ hỗ trợ thông tin sản phẩm và phương án cung ứng phù hợp.',
};

for (const [lang, path, field, ask] of [
  ['en', '/products/passion-fruit', 'Product', 'Please send me the phone number of your farm owner'],
  ['vi', '/vi/san-pham/chanh-day', 'Sản phẩm', 'Cho tôi số điện thoại của chủ vườn'],
]) {
  test(`the Trade Desk (${lang}) answers a request for a farm owner's contact as HMV, names no one and goes on asking for the product`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-hmv-trade-desk', { detail: { source: 'test' } })));
    await expect(desk(page)).toBeVisible();
    await say(page, field, ask);
    await expect(desk(page).getByRole('log')).toContainText(SUPPLIER_REPLY[lang]);
    // Still at the product question: nothing was chosen, nothing was sent.
    await expect(desk(page).getByLabel(field, { exact: true })).toBeVisible();
    const text = await desk(page).innerText();
    expect(text).not.toMatch(/@|https?:|\+?\d{8,}/);
  });
}

test('the Trade Desk points a buyer who asks for traceability documents to HMV\'s commercial team', async ({ page }) => {
  await page.goto('/products/passion-fruit', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-hmv-trade-desk', { detail: { source: 'test' } })));
  await say(page, 'Product', 'I need traceability documents for customs');
  await expect(desk(page).getByRole('log')).toContainText('The HMV commercial team provides traceability and compliance documentation through the quotation process.');
});

test('a request for the contact of a farm owner that also names the product gets the HMV answer and the conversation goes on to the destination', async ({ page }) => {
  await page.goto('/vi/san-pham/chanh-day', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-hmv-trade-desk', { detail: { source: 'test' } })));
  await say(page, 'Sản phẩm', 'Cho tôi số điện thoại của chủ vườn chanh dây');
  await expect(desk(page).getByRole('log')).toContainText(SUPPLIER_REPLY.vi);
  await expect(desk(page).getByRole('log')).toContainText('Anh/chị cần giao hàng đến đâu?');
  expect(await desk(page).innerText()).not.toMatch(/@|https?:|\+?\d{8,}/);
});
