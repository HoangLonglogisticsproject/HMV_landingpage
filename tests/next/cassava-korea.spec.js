// @ts-check
import { test, expect } from '@playwright/test';
import { KO_CASSAVA_GUIDES } from '../../src/i18n/routes.js';
import { abs, head, tags } from './html.js';

/**
 * The page-scoped Korean tapioca chips page (/ko/tapioca-chips): server HTML, manufacturers first, its own header and
 * links, the HMV Trade Desk call to action. Its layout is checked in cassava-scoped.desktop.spec.js; its hreflang set,
 * sitemap entry, robots and redirects with every URL in next.spec.js. The copy is written out here: these are the
 * exact strings the page must serve.
 */
const PATH = '/ko/tapioca-chips';
const get = async request => {
  const res = await request.get(PATH, { maxRedirects: 0 });
  expect(res.status()).toBe(200);
  return res.text();
};
const text = html => html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<');

test('server HTML: a ko document with the Korean title, description and heading; manufacturers first', async ({ request }) => {
  const html = await get(request);
  const h = head(html);
  expect(h.lang).toBe('ko');
  expect(h.title).toBe('베트남 타피오카 칩 공급 - 주정·에탄올·사료 제조업체용 원료 | HMV Global');
  expect(h.description).toBe('HMV Global은 주정·에탄올, 사료 및 전분 가공 제조사를 위한 베트남 타피오카 칩 대량 공급을 관리합니다. 월간 구매량, 품질 요구사항, 집하 및 납품 계획에 맞춰 공급안을 조율합니다.');
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(h.h1).toBe('HMV Global이 관리하는 제조사용 타피오카 칩 대량 공급');
  expect(h.canonical).toBe(abs(PATH));
  expect(h.og).toMatchObject({ url: abs(PATH), locale: 'ko_KR', title: h.title, description: h.description });
  const body = text(html);
  for (const copy of [
    'HMV GLOBAL · 산업용 원료 공급 관리',
    '제조사 원료 조달', '월간 대량 공급', '구매 기준에 따른 품질 조율', '지역 공급 네트워크',
    '주요 수요처', '주정·에탄올 · 사료 · 전분 가공', '월 단위 정기 대량 공급', '구매사 기준에 맞춰 협의', 'Intertek 분석 샘플',
    '적용 분야', '공급 현장', '자주 묻는 질문',
    '타피오카 칩을 사용하는 주요 제조 분야', '주정·에탄올 생산', '사료 생산', '전분 가공',
    '제조사가 HMV와 협력하는 이유', '단순한 공급처 연결이 아니라 공장 조달을 위한 공급 실행',
    '공급 네트워크', '품질 기준 조율', '집하 및 선적 관리', '상업 및 납품 실행',
    'HMV의 지역 공급 네트워크는 베트남과 캄보디아의 공급 역량을 연계합니다.',
    '50,000 톤/월', '10,000 톤/월', '150 컨테이너/월', '250 컨테이너/월', '모든 구매사에 대한 공급 확약이 아닙니다',
    '실제 공급 현장', 'HMV 공급 네트워크의 제품·대량 공급·출하 현장', '대량 타피오카 칩 — 실제 공급 현장',
    '아래 수치는 특정 제출 샘플의 시험 결과이며 모든 공급 물량의 고정 규격을 의미하지 않습니다.',
    'Intertek 베트남 분석 보고서 AGRIVIETNAM2026-1700', '71.1%', '11.55%', '불검출', '<0.02 mg/kg',
    '제3자 실험실 분석', 'Third-party laboratory analysis', '분석 기관', 'Intertek 베트남', '보고서 번호', '보고서 일자',
    '2026년 10월 5일', '분석 대상', '제출 샘플', '모든 로트나 선적에 적용되는 고정 규격이 아닙니다.',
    '공급 네트워크 개요 (지도 아님)', 'HMV의 조율 역할',
    '공급 절차', '구매 요구사항에서 납품까지', '공장 맞춤형 타피오카 칩', '공급을 HMV와 협의하세요',
    '회사 / 공장명', '도착지', '예상 월간 구매량', '톤/월', 'HMV Trade Desk는 현재 영어로 제공됩니다.',
    '원료 시장 정보', '공장 조달에 영향을 주는 타피오카 시장 변수',
  ]) expect(body, copy).toContain(copy);
  // Manufacturers lead: distilled alcohol and ethanol, feed, starch, then importers and wholesale buyers.
  const hero = text(html.slice(html.indexOf('id="overview"'), html.indexOf('id="applications"')));
  const at = ['주정·에탄올', '사료', '전분', '수입업체', '대량 도매'].map(term => hero.indexOf(term));
  expect(at.every((i, n) => i >= 0 && (n === 0 || i > at[n - 1])), hero).toBe(true);
  // Cambodia and the network figures come after the buyer value, never in the hero.
  expect(hero).not.toContain('캄보디아');
  expect(hero).not.toContain('톤/월');
  expect(body).not.toMatch(/[≤≥]|카사바 칩|무역상|트레이더/);
});

test('server HTML: the procurement sections in page order, each a labelled section with one h2; the strip and FAQ answers in it', async ({ request }) => {
  const html = await get(request);
  const sections = tags(html, 'section');
  expect(sections.map(s => s.id)).toEqual(['overview', 'applications', 'why-hmv', 'supply-evidence', 'quality', 'capability', 'workflow', 'faq', 'guides', 'market', 'rfq']);
  for (const s of sections) expect(html, s.id).toMatch(new RegExp(`<h[12] id="${s['aria-labelledby']}"`));
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  // The strip below the hero: real links to each section, in page order.
  const strip = html.slice(html.indexOf('aria-label="페이지 목차"'), html.indexOf('id="applications"'));
  expect([...strip.matchAll(/href="#([\w-]+)"/g)].map(m => m[1])).toEqual(['overview', 'applications', 'supply-evidence', 'quality', 'capability', 'workflow', 'faq']);
  // Closed disclosure widgets whose answers are server-rendered, crawlable text.
  expect(html.match(/<details\b/g)).toHaveLength(6);
  expect(html).not.toMatch(/<details[^>]*\bopen\b/);
  const body = text(html);
  for (const copy of [
    '타피오카 칩은 어떤 제조 분야에 사용되나요?', '타피오카 칩 구매 시 주로 확인하는 품질 항목은 무엇인가요?', '전분 함량은 어떻게 확인하나요?',
    '월 단위 정기 대량 구매가 가능한가요?', '공장의 구매 규격에 맞춰 공급을 조율할 수 있나요?', '베트남과 캄보디아 중 어느 산지에서 공급되나요?',
    '이 페이지의 71.1%는 Intertek이 분석한 제출 샘플 1건의 결과이며 고정 선적 규격이 아닙니다.',
  ]) expect(body, copy).toContain(copy);
  // No FAQ structured data: FAQ rich results are limited to government and health sites, so it would add markup only.
  expect(html).not.toContain('FAQPage');
});

test('server HTML: quality reference, key results, then the third-party evidence; no report button yet; no certification claim', async ({ request }) => {
  const html = await get(request);
  const quality = html.slice(html.indexOf('<section id="quality"'), html.indexOf('<section id="capability"'));
  const order = ['>품질 참고</h2>', '>71.1%<', '<table', '>제3자 실험실 분석</h3>', '>이 샘플 결과는 어떻게 이해해야 하나요?</h4>'].map(s => quality.indexOf(s));
  expect(order.every(at => at > 0)).toBe(true);
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(quality).toContain('<aside aria-labelledby="quality-evidence-title"');
  // The sanitized report pages are not committed yet (src/data/cassavaQualityReport.js): nothing to open or download.
  expect(quality).not.toMatch(/<(button|a|dialog)\b/);
  expect(quality).not.toContain('분석 보고서 보기');
  // One submitted sample analysed by Intertek: never a certification or guarantee of the product, supplier or shipment.
  expect(text(html)).not.toMatch(/certif|guarant|accredit|인증|보증|보장|공인/i);
});

test('the buyer guides, after the questions and before the market block, link the three Korean guides', async ({ request }) => {
  const html = await get(request);
  const guides = html.slice(html.indexOf('<section id="guides"'), html.indexOf('<section id="market"'));
  expect(guides).toMatch(/<h2 id="guides-title"[^>]*>구매 가이드<\/h2>/);
  expect(tags(guides, 'a').map(a => a.href)).toEqual(KO_CASSAVA_GUIDES.map(slug => `${PATH}/${slug}`));
  expect(text(guides)).toContain('산업용 타피오카 칩 구매 가이드');
  expect(text(guides)).toContain('타피오카 칩 품질 확인 가이드');
  expect(text(guides)).toContain('에탄올 생산용 타피오카 칩 구매 시 확인할 사항');
  expect(html.indexOf('<section id="faq"')).toBeLessThan(html.indexOf('<section id="guides"'));
  // The guides are not the money page: its heading, title and canonical stay the page's own.
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(head(html).canonical).toBe(abs(PATH));
});

test('the market intelligence block, after the questions, links to the Korean market page', async ({ request }) => {
  const html = await get(request);
  const market = html.slice(html.indexOf('<section id="market"'), html.indexOf('<section id="rfq"'));
  expect(market).toMatch(/<h2 id="market-title"[^>]*>원료 시장 정보<\/h2>/);
  expect(text(market)).toContain('공장 조달에 영향을 주는 타피오카 시장 변수');
  expect(tags(market, 'a').map(a => a.href)).toEqual(['/ko/tapioca-market']);
  expect(html.indexOf('<section id="faq"')).toBeLessThan(html.indexOf('<section id="market"'));
});

test('header: the real HMV logo, the section links, and this page in English, Vietnamese, Chinese and Korean', async ({ request }) => {
  const html = await get(request);
  const logo = tags(html, 'img').find(img => img.alt === 'HMV Global');
  expect(decodeURIComponent(logo?.src ?? '')).toMatch(/\/_next\/static\/media\/logohmv\.[\w-]+\.webp/);
  // The site's language menu shows Korean; its four options are real links in the server HTML, crawlable.
  const trigger = tags(html, 'button').find(b => b.class === 'hmv-lang-trigger');
  expect(trigger?.['aria-label']).toBe('언어 선택, 현재: 한국어');
  const language = tags(html, 'a').filter(a => a.hreflang && a.lang);
  expect(language.map(a => [a.hreflang, a.lang, a.href, a['aria-current']])).toEqual([
    ['en', 'en', '/products/dried-cassava-chips', undefined],
    ['vi', 'vi', '/vi/san-pham/san-lat-kho', undefined],
    ['zh-CN', 'zh-CN', '/zh-cn/cassava-chips', undefined],
    ['ko', 'ko', PATH, 'page'],
  ]);
  expect(language.some(a => /nofollow/.test(a.rel ?? ''))).toBe(false);
  for (const [href, label] of [['#overview', '제품 개요'], ['#applications', '제조사 적용'], ['#capability', '공급 역량'], ['#quality', '품질 참고'], ['#workflow', '공급 절차']]) {
    expect(html).toContain(`<a href="${href}">${label}</a>`);
  }
  // Not the site navigation and footer, whose links lead to pages without a Korean version.
  expect(html).not.toContain('nav-group');
  expect(html).not.toContain('pf-grid');
});

test('every link works: section anchors exist on the page, every other link answers 200; only the existing /ko URLs', async ({ request }) => {
  const html = await get(request);
  const hrefs = [...new Set(tags(html, 'a').map(a => a.href))];
  expect(hrefs.length).toBeGreaterThan(5);
  for (const href of hrefs) {
    if (href.startsWith('#')) expect(html, href).toContain(`id="${href.slice(1)}"`);
    else {
      expect(href, href).toMatch(/^\/(?!\/)/);
      // This page, its three guides and the Korean market page (its market teaser), the only Korean pages.
      if (href.startsWith('/ko')) expect([PATH, '/ko/tapioca-market', ...KO_CASSAVA_GUIDES.map(slug => `${PATH}/${slug}`)]).toContain(href);
      expect((await request.get(href, { maxRedirects: 0 })).status(), href).toBe(200);
    }
  }
});

test('the call to action opens the English HMV Trade Desk with dried cassava chips', async ({ page }) => {
  await page.goto(PATH);
  // Two calls to action share the label: the hero's and the RFQ section's.
  await expect(page.getByRole('button', { name: 'HMV에 원료 구매 요구사항 전달' })).toHaveCount(2);
  await page.getByRole('button', { name: 'HMV에 원료 구매 요구사항 전달' }).first().click();
  const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
  await expect(desk).toBeVisible();
  await expect(desk).toHaveAttribute('lang', 'en');
  await expect(desk.locator('.desk-summary')).toContainText('Dried cassava chips');
  const events = await page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
  expect(events).toContainEqual({ event: 'trade_desk_open', source: 'ko_hero', product: 'dried-cassava-chips', locale: 'en' });
});

// The closing call to action, through the whole English desk: the product, the Korean source and this landing page reach
// the inquiry (intercepted: nothing is sent).
test('the closing call to action sends a dried cassava chips inquiry with source ko_rfq and this landing page', async ({ page }) => {
  let posted;
  await page.route('**/api/inquiry', async route => {
    posted = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'HMV-2026-7KQ4XM' }) });
  });
  await page.goto(PATH);
  await page.locator('#rfq').getByRole('button', { name: 'HMV에 원료 구매 요구사항 전달' }).click();
  const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
  await expect(desk).toHaveAttribute('lang', 'en');
  await expect(desk.locator('.desk-summary')).toContainText('Dried cassava chips');
  for (const [label, value] of [['Delivery destination', 'Incheon, South Korea'], ['Expected volume', '2000']]) {
    const input = desk.getByLabel(label, { exact: true });
    await input.fill(value);
    await input.press('Enter');
  }
  await desk.getByRole('button', { name: 'Request Quotation' }).click();
  await desk.getByLabel('Company').fill('Example Alcohol Co.');
  await desk.getByLabel('Business email').fill('buyer@example.com');
  await desk.getByLabel('HMV may contact me about this inquiry.').check();
  await desk.getByRole('button', { name: 'Send Request' }).click();
  await expect(desk).toContainText('HMV-2026-7KQ4XM');
  expect(posted).toMatchObject({ product: 'dried-cassava-chips', destination: 'Incheon, South Korea' });
  expect(posted.context).toMatchObject({ page: PATH, landingPage: PATH });
  const events = await page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
  expect(events).toContainEqual({ event: 'trade_desk_open', source: 'ko_rfq', product: 'dried-cassava-chips', locale: 'en' });
});

// The supply-evidence photographs open larger here too, with the Korean caption.
test('a supply-evidence photograph opens larger with its Korean caption', async ({ page }) => {
  await page.goto(PATH);
  const frame = page.locator('#supply-evidence .supply-evidence-frame').first();
  await expect(frame).toHaveAttribute('title', '이미지 크게 보기');
  await frame.click();
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-label', '대량 타피오카 칩 — 실제 공급 현장');
  await page.keyboard.press('Escape');
  await expect(frame).toBeFocused();
});
