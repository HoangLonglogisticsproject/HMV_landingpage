// @ts-check
import { test, expect } from '@playwright/test';
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
    '제조업별 원료 사용', '타피오카 칩을 사용하는 주요 제조 분야', '주정·에탄올 생산', '사료 생산', '전분 가공',
    '제조사가 HMV와 협력하는 이유', '단순한 공급처 연결이 아니라 공장 조달을 위한 공급 실행',
    '공급 네트워크', '품질 기준 조율', '집하 및 선적 관리', '상업 및 납품 실행',
    'HMV의 지역 공급 네트워크는 베트남과 캄보디아의 공급 역량을 연계합니다.',
    '50,000 톤/월', '10,000 톤/월', '150 컨테이너/월', '250 컨테이너/월', '모든 구매사에 대한 공급 확약이 아닙니다',
    '실제 공급 현장', 'HMV 공급 네트워크의 제품·대량 공급·출하 현장', '대량 타피오카 칩 — 실제 공급 현장',
    '아래 수치는 특정 제출 샘플의 시험 결과이며 모든 공급 물량의 고정 규격을 의미하지 않습니다.',
    'Intertek 베트남 분석 보고서 AGRIVIETNAM2026-1700', '71.1%', '11.55%', '불검출', '<0.02 mg/kg',
    '구매 요구사항에서 납품까지', '공장 맞춤형 타피오카 칩', '공급을 HMV와 협의하세요',
    '회사 / 공장명', '도착지', '예상 월간 구매량 (톤/월)', 'HMV Trade Desk는 현재 영어로 제공됩니다.',
    '공장 조달에 영향을 주는 타피오카 시장 변수',
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

test('header: the real HMV logo, the section links, and this page in English, Vietnamese, Chinese and Korean', async ({ request }) => {
  const html = await get(request);
  const logo = tags(html, 'img').find(img => img.alt === 'HMV Global');
  expect(decodeURIComponent(logo?.src ?? '')).toMatch(/\/_next\/static\/media\/logohmv\.[\w-]+\.webp/);
  const language = Object.fromEntries(tags(html, 'a').filter(a => a.hreflang).map(a => [a.hreflang, a]));
  expect(Object.fromEntries(Object.entries(language).map(([l, a]) => [l, a.href]))).toEqual({
    en: '/products/dried-cassava-chips',
    vi: '/vi/san-pham/san-lat-kho',
    'zh-CN': '/zh-cn/cassava-chips',
    ko: PATH,
  });
  expect(language.ko['aria-current']).toBe('page');
  for (const [href, label] of [['#overview', '제품 개요'], ['#applications', '제조사 적용'], ['#capability', '공급 역량'], ['#quality', '품질 참고'], ['#workflow', '공급 절차']]) {
    expect(html).toContain(`<a href="${href}">${label}</a>`);
  }
  // Not the site navigation and footer, whose links lead to pages without a Korean version.
  expect(html).not.toContain('hmv-lang-trigger');
  expect(html).not.toContain('pf-grid');
});

test('every link works: section anchors exist on the page, every other link answers 200; no other /ko URL', async ({ request }) => {
  const html = await get(request);
  const hrefs = [...new Set(tags(html, 'a').map(a => a.href))];
  expect(hrefs.length).toBeGreaterThan(5);
  for (const href of hrefs) {
    if (href.startsWith('#')) expect(html, href).toContain(`id="${href.slice(1)}"`);
    else {
      expect(href, href).toMatch(/^\/(?!\/)/);
      if (href.startsWith('/ko')) expect(href).toBe(PATH);
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
