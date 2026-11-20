// @ts-check
import { test, expect } from '@playwright/test';
import { abs, head, tags } from './html.js';

/**
 * The page-scoped Simplified Chinese cassava page (/zh-cn/cassava-chips): server HTML, its own header and links, the
 * HMV Trade Desk call to action. Its layout is checked in cassava-china.desktop.spec.js; its hreflang set, sitemap
 * entry, robots and redirects with every URL in next.spec.js. The copy is written out here: these are the exact
 * strings the page must serve.
 */
const PATH = '/zh-cn/cassava-chips';
const get = async request => {
  const res = await request.get(PATH, { maxRedirects: 0 });
  expect(res.status()).toBe(200);
  return res.text();
};
const text = html => html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<');

test('server HTML: a zh-CN document with the Chinese title, description, heading and buyer copy, factories first', async ({ request }) => {
  const html = await get(request);
  const h = head(html);
  expect(h.lang).toBe('zh-CN');
  expect(h.title).toBe('越南木薯干片供应商与工厂批量采购方案 | HMV Global');
  expect(h.description).toBe('HMV Global 面向饲料厂、淀粉加工厂和生物乙醇企业提供木薯干片批量供应，按目的地、月度采购量和质量要求协调货源、取样、集货、单证及交付。');
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(h.h1).toBe('由 HMV Global 管理的木薯干片批量供应方案');
  expect(h.canonical).toBe(abs(PATH));
  expect(h.og).toMatchObject({ url: abs(PATH), locale: 'zh_CN', title: h.title, description: h.description });
  const body = text(html);
  for (const copy of [
    'HMV GLOBAL · 工业原料批量供应管理',
    'HMV Global 面向饲料厂、淀粉加工厂和生物乙醇生产企业提供可执行的木薯干片批量供应方案，同时服务进口商及大宗批发采购。',
    '工业原料供应', '月度批量供应', '按买方要求协调质量', '区域供应网络',
    'HMV GLOBAL 供应网络能力', 'HMV 供应网络能力参考', '50,000 吨/月', '10,000 吨/月', '150 集装箱/月', '250 集装箱/月',
    '过境出口组织能力', '砂和二氧化硅（Sand & silica）',
    '并非对每一位买方的供货承诺', '并非对单一买方的供货承诺',
    '主要应用领域', '生物乙醇生产', '饲料原料', '淀粉加工', '取决于买方的配方设计与原料策略',
    '为什么选择 HMV Global', '多产地组织', '灵活的月度供应', '质量匹配', '出口与交付执行',
    '集货与出运实景',
    '质量参考', '送检样品结果，仅作采购评估参考；实际供货规格以双方确认的供应方案及合同为准。',
    'Intertek 越南分析报告 AGRIVIETNAM2026-1700', '如何理解本次样品结果？',
    '第三方实验室分析', 'Third-party laboratory analysis', '检测机构', 'Intertek 越南', '报告编号', '报告日期', '2026年10月5日', '分析对象', '送检样品',
    '71.1%', '11.55%', '2.99%', '1.86%', '0.45%', '未检出', '0.17 mg/kg', '0.28 mg/kg', '<0.02 mg/kg',
    '供应能力与网络',
    'HMV 的区域供应网络覆盖越南及柬埔寨。具体原产地、规格、可供数量及商务条件均按每个供应方案和批次确认。',
    '合作与采购流程', '提交需求', '匹配货源', '样品与确认', '商务协商', '集货与装运', '交付与跟进',
    '常见问题', '木薯干片适合哪些工业用途？', '采购木薯干片通常关注哪些质量指标？', '木薯干片的淀粉含量如何确认？',
    'HMV 是否支持大批量月度采购？', '可以根据买方规格协调供应吗？', '越南与柬埔寨货源如何选择？',
    '获取木薯干片采购方案', 'HMV Trade Desk 目前为英文界面',
  ]) expect(body, copy).toContain(copy);
  // Factory buyers lead; importers and wholesalers follow.
  expect(body.indexOf('饲料厂')).toBeLessThan(body.indexOf('进口商'));
  // The regional statement (Vietnam and Cambodia) is below the buyer section, not in the hero.
  const hero = html.slice(html.indexOf('id="overview"'), html.indexOf('aria-label="本页目录"'));
  expect(hero).toContain('由 HMV Global 管理的木薯干片批量供应方案');
  expect(hero).not.toContain('覆盖越南及柬埔寨');
  expect(body.indexOf('出口与交付执行')).toBeLessThan(body.indexOf('覆盖越南及柬埔寨'));
  // No specification limits beyond the sample results.
  expect(body).not.toMatch(/[≤≥]/);
});

test('server HTML: the sections in page order, each a labelled section with one h2; the strip and FAQ answers in it', async ({ request }) => {
  const html = await get(request);
  const sections = tags(html, 'section');
  expect(sections.map(s => s.id)).toEqual(['overview', 'applications', 'why-hmv', 'supply-evidence', 'quality', 'capability', 'workflow', 'faq', 'rfq']);
  for (const s of sections) expect(html, s.id).toMatch(new RegExp(`<h[12] id="${s['aria-labelledby']}"`));
  // The strip below the hero: real links to each section, in page order.
  const strip = html.slice(html.indexOf('aria-label="本页目录"'), html.indexOf('id="applications"'));
  expect([...strip.matchAll(/href="#([\w-]+)"/g)].map(m => m[1])).toEqual(['overview', 'applications', 'supply-evidence', 'quality', 'capability', 'workflow', 'faq']);
  // Closed disclosure widgets whose answers are server-rendered, crawlable text.
  expect(html.match(/<details\b/g)).toHaveLength(6);
  expect(html).not.toMatch(/<details[^>]*\bopen\b/);
  expect(text(html)).toContain('本页所示 71.1% 为一份 Intertek 送检样品的结果，并非固定批次规格');
  // No FAQ structured data: FAQ rich results are limited to government and health sites, so it would add markup only.
  expect(html).not.toContain('FAQPage');
});

test('server HTML: quality reference, key results, then the third-party evidence; no report button yet; no certification claim', async ({ request }) => {
  const html = await get(request);
  const quality = html.slice(html.indexOf('<section id="quality"'), html.indexOf('<section id="capability"'));
  const order = ['>质量参考</h2>', '>71.1%<', '<table', '>第三方实验室分析</h3>', '>如何理解本次样品结果？</h4>'].map(s => quality.indexOf(s));
  expect(order.every(at => at > 0)).toBe(true);
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(quality).toContain('<aside aria-labelledby="quality-evidence-title"');
  expect(quality).toMatch(/<h3 id="quality-evidence-title"[^>]*>第三方实验室分析<\/h3>/);
  // The sanitized report pages are not committed yet (src/data/cassavaQualityReport.js): nothing to open or download.
  expect(quality).not.toMatch(/<(button|a|dialog)\b/);
  expect(quality).not.toContain('查看检测报告');
  // One submitted sample analysed by Intertek: never a certification or guarantee of the product, supplier or shipment.
  expect(text(html)).not.toMatch(/certif|guarant|accredit|认证|认可|担保|保证/i);
});

test('header: the real HMV logo, the section links, and this page in English, Vietnamese, Chinese and Korean', async ({ request }) => {
  const html = await get(request);
  const logo = tags(html, 'img').find(img => img.alt === 'HMV Global');
  expect(decodeURIComponent(logo?.src ?? '')).toMatch(/\/_next\/static\/media\/logohmv\.[\w-]+\.webp/);
  // The site's language menu shows Chinese; its four options are real links in the server HTML, crawlable.
  const trigger = tags(html, 'button').find(b => b.class === 'hmv-lang-trigger');
  expect(trigger?.['aria-label']).toBe('选择语言，当前：简体中文');
  const language = tags(html, 'a').filter(a => a.hreflang && a.lang);
  expect(language.map(a => [a.hreflang, a.lang, a.href, a['aria-current']])).toEqual([
    ['en', 'en', '/products/dried-cassava-chips', undefined],
    ['vi', 'vi', '/vi/san-pham/san-lat-kho', undefined],
    ['zh-CN', 'zh-CN', PATH, 'page'],
    ['ko', 'ko', '/ko/tapioca-chips', undefined],
  ]);
  expect(language.some(a => /nofollow/.test(a.rel ?? ''))).toBe(false);
  for (const [href, label] of [['#overview', '产品概览'], ['#quality', '质量参考'], ['#capability', '供应能力'], ['#workflow', '采购流程']]) {
    expect(html).toContain(`<a href="${href}">${label}</a>`);
  }
  // Not the site navigation and footer, whose links lead to pages without a Chinese version.
  expect(html).not.toContain('nav-group');
  expect(html).not.toContain('pf-grid');
});

test('every link works: section anchors exist on the page, every other link answers 200; no other /zh-cn URL', async ({ request }) => {
  const html = await get(request);
  const hrefs = [...new Set(tags(html, 'a').map(a => a.href))];
  expect(hrefs.length).toBeGreaterThan(5);
  for (const href of hrefs) {
    if (href.startsWith('#')) expect(html, href).toContain(`id="${href.slice(1)}"`);
    else {
      expect(href, href).toMatch(/^\/(?!\/)/);
      if (href.startsWith('/zh-cn')) expect(href).toBe(PATH);
      if (href.startsWith('/ko')) expect(href).toBe('/ko/tapioca-chips');
      expect((await request.get(href, { maxRedirects: 0 })).status(), href).toBe(200);
    }
  }
});

test('the call to action opens the English HMV Trade Desk with dried cassava chips', async ({ page }) => {
  await page.goto(PATH);
  // Two calls to action share the label: the hero's and the closing one's.
  await expect(page.getByRole('button', { name: '向 HMV 提交采购需求' })).toHaveCount(2);
  await page.getByRole('button', { name: '向 HMV 提交采购需求' }).first().click();
  const desk = page.getByRole('dialog', { name: 'HMV Trade Desk' });
  await expect(desk).toBeVisible();
  await expect(desk).toHaveAttribute('lang', 'en');
  await expect(desk.locator('.desk-summary')).toContainText('Dried cassava chips');
  await expect(desk.getByRole('log')).toHaveText('HMVWhere would you like the goods delivered?');
  const events = await page.evaluate(() => /** @type {any} */ (window).dataLayer ?? []);
  expect(events).toContainEqual({ event: 'trade_desk_open', source: 'zh_hero', product: 'dried-cassava-chips', locale: 'en' });
});
