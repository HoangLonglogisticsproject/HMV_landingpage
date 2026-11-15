// @ts-check
import { test, expect } from '@playwright/test';
import { abs, head, tags } from './html.js';

/**
 * The Korean tapioca market page (/ko/tapioca-market), Korean-only original content: server HTML a crawler (Naver,
 * Google) reads without JavaScript, its links, and the link back from the Korean supply page. Its canonical, sitemap
 * entry, robots and `?lang=` redirect are checked with every URL in next.spec.js; its layout in
 * tapioca-market.desktop.spec.js. The copy is written out here: these are the exact strings the page must serve.
 */
const PATH = '/ko/tapioca-market';
const get = async (request, path = PATH) => {
  const res = await request.get(path, { maxRedirects: 0 });
  expect(res.status(), path).toBe(200);
  return res.text();
};
const text = html => html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'");

test('server HTML: a ko document with its own title, description, one heading and canonical, no alternates', async ({ request }) => {
  const html = await get(request);
  const h = head(html);
  expect(h.lang).toBe('ko');
  expect(h.title).toBe('타피오카 원료 조달 인사이트 | HMV Global');
  expect(h.description).toBe('한국 제조사를 위해 베트남·캄보디아 공급, 날씨, 옥수수 가격, 수요 변화를 정리한 타피오카 칩 조달 인사이트입니다.');
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(h.h1).toBe('한국 제조사를 위한 타피오카 원료 조달 인사이트');
  expect(h.canonical).toBe(abs(PATH));
  expect(h.hreflang).toEqual({});
  expect(h.og).toMatchObject({ url: abs(PATH), locale: 'ko_KR', title: h.title, description: h.description });
  expect(h.og['locale:alternate']).toBeUndefined();
});

test('server HTML: the market intelligence, its dates and sources, evidence apart from the buyer view', async ({ request }) => {
  const html = await get(request);
  const body = text(html);
  for (const copy of [
    'HMV GLOBAL · PROCUREMENT INTELLIGENCE',
    '업데이트: 2026.11.15',
    '본 페이지는 시장 참고 정보이며 HMV의 확정 견적, 공급 확약 또는 가격 예측이 아닙니다.',
    '한국 주정 원료 수요', '건기 수매·비축 시기', '캄보디아 기상 리스크', '국제 옥수수 가격 동향',
    '구조적 참고', '계절적 참고', '최근 동향', '과거 참고',
    '지속 수요', '진입 전', '높은 위험', '최근 하락',
    '이는 타피오카 생산량 감소를 직접 의미하지는 않지만',
    '옥수수 가격의 단기 움직임만으로 타피오카 수요 방향이나 실제 원료 대체를 단정할 수 없습니다.',
    'KRX 공시 · 2026.05.15', 'FAO · 2026.10.05', '농림축산식품부 · 2026.11.07',
    '2026년 11월 타피오카 조달 브리프', '이번 달 제조사 체크리스트', '타피오카 조달에 영향을 주는 주요 변수',
    '시장 정보에서 실제 공급 검토로', '출처 및 작성 기준', '귀사의 조달 조건에 맞는 공급안을 확인하세요',
  ]) expect(body, copy).toContain(copy);
  // Every signal shows what its sources say and, apart, what it may mean for a buyer.
  expect(html.match(/class="market-signal"/g)).toHaveLength(4);
  expect(html.match(/>확인된 근거</g)).toHaveLength(4);
  expect(html.match(/>구매사 관점</g)).toHaveLength(4);
  // The sections, in their order, by the ids the analytics will use.
  const ids = ['market-monitor', 'procurement-brief', 'market-drivers', 'manufacturer-checklist', 'supply-evidence-links', 'source-methodology'];
  const at = ids.map(id => html.indexOf(`id="${id}"`));
  expect(at.every((i, n) => i > 0 && (n === 0 || i > at[n - 1])), JSON.stringify(at)).toBe(true);
  // No price, no prediction; neither the old season wording, the market-style labels nor the unproven KREI figures.
  expect(body).not.toMatch(/USD|달러\/톤|\$\d|(상승|하락) 전망|가격을 예측/);
  expect(body).not.toMatch(/조달 시즌|구조 신호|계절 신호|현재 신호|한국농촌경제연구원|3\.9%|4\.0%/);
});

test('links: internal ones reach the supply page and answer 200; no other /ko/tapioca-* URL; no Trade Desk', async ({ request }) => {
  const html = await get(request);
  const links = tags(html, 'a');
  const internal = [...new Set(links.map(a => a.href).filter(href => href.startsWith('/')))].sort();
  expect(internal).toEqual(['/', '/ko/tapioca-chips', '/ko/tapioca-chips#capability', '/ko/tapioca-chips#quality', '/ko/tapioca-chips#supply-evidence']);
  for (const href of internal) expect((await request.get(href.split('#')[0], { maxRedirects: 0 })).status(), href).toBe(200);
  // The anchors of the supply page exist there.
  const supply = await get(request, '/ko/tapioca-chips');
  for (const id of ['capability', 'quality', 'supply-evidence']) expect(supply, id).toContain(`id="${id}"`);
  for (const a of links.filter(a => a.href.startsWith('#'))) expect(html, a.href).toContain(`id="${a.href.slice(1)}"`);
  for (const a of links.filter(a => /^https?:/.test(a.href))) expect([a.target, a.rel], a.href).toEqual(['_blank', 'noopener noreferrer']);
  expect(html).not.toContain('<button');
});

test('the Korean supply page links to the market page; nothing else does', async ({ request }) => {
  const supply = tags(await get(request, '/ko/tapioca-chips'), 'a').filter(a => a.href === PATH);
  expect(supply.map(a => a.href)).toEqual([PATH]);
  for (const path of ['/products/dried-cassava-chips', '/vi/san-pham/san-lat-kho', '/zh-cn/cassava-chips', '/']) {
    expect(await get(request, path), path).not.toContain(PATH);
  }
});
