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
    'HMV Global 面向饲料厂、淀粉加工厂和生物乙醇生产企业，提供持续、可执行的木薯干片批量供应方案；同时服务进口商及大宗批发采购。',
    '工厂原料采购', '月度批量供应', '按买方要求协调质量', '区域供应网络',
    'HMV GLOBAL 供应网络能力', 'HMV 供应网络能力参考', '50,000 吨/月', '10,000 吨/月', '150 集装箱/月', '250 集装箱/月',
    '过境出口组织能力', '砂和二氧化硅（Sand & silica）',
    '并非对每一位买方的供货承诺',
    '为什么工厂采购团队选择 HMV', '不只是找到货源，而是由 HMV 管理整套供应执行',
    '供应网络', '质量要求协调', '集货与装运协调', '贸易执行',
    'HMV 的区域供应网络覆盖越南及柬埔寨。具体原产地、规格、可供数量及商务条件均按每个供应方案和批次确认。',
    '以下结果来自特定送检样品，仅作为质量参考，并不代表所有供应批次的固定规格。最终批次要求以双方确认的供应方案及合同为准。',
    'Intertek 越南分析报告 AGRIVIETNAM2026-1700',
    '71.1%', '11.55%', '2.99%', '1.86%', '0.45%', '未检出', '0.17 mg/kg', '0.28 mg/kg', '<0.02 mg/kg',
    '饲料生产', '淀粉加工', '生物乙醇', '从采购需求到交付',
    '确认采购需求', '组织适配货源', '取样与质量确认', '批次集货', '装运协调', '单证与交付',
    '让 HMV 为您的工厂制定木薯干片供应方案', 'HMV Trade Desk 目前为英文界面',
    '关注中国木薯市场',
  ]) expect(body, copy).toContain(copy);
  // Factory buyers lead; importers and wholesalers follow.
  expect(body.indexOf('饲料厂')).toBeLessThan(body.indexOf('进口商'));
  // The regional statement (Vietnam and Cambodia) is below the buyer section, not in the hero.
  const hero = html.slice(html.indexOf('id="overview"'), html.indexOf('id="capability"'));
  expect(hero).not.toContain('覆盖越南及柬埔寨');
  expect(body.indexOf('贸易执行')).toBeLessThan(body.indexOf('覆盖越南及柬埔寨'));
  // No specification limits beyond the sample results.
  expect(body).not.toMatch(/[≤≥]/);
});

test('header: the real HMV logo, the section links, and this page in English, Vietnamese, Chinese and Korean', async ({ request }) => {
  const html = await get(request);
  const logo = tags(html, 'img').find(img => img.alt === 'HMV Global');
  expect(decodeURIComponent(logo?.src ?? '')).toMatch(/\/_next\/static\/media\/logohmv\.[\w-]+\.webp/);
  const links = tags(html, 'a');
  const language = Object.fromEntries(links.filter(a => a.hreflang).map(a => [a.hreflang, a]));
  expect(Object.fromEntries(Object.entries(language).map(([l, a]) => [l, a.href]))).toEqual({
    en: '/products/dried-cassava-chips',
    vi: '/vi/san-pham/san-lat-kho',
    'zh-CN': PATH,
    ko: '/ko/tapioca-chips',
  });
  expect(language['zh-CN']['aria-current']).toBe('page');
  for (const [href, label] of [['#overview', '产品概览'], ['#capability', '供应能力'], ['#quality', '质量参考'], ['#workflow', '供应流程']]) {
    expect(html).toContain(`<a href="${href}">${label}</a>`);
  }
  // Not the site navigation and footer, whose links lead to pages without a Chinese version.
  expect(html).not.toContain('hmv-lang-trigger');
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
  // Two calls to action share the label: the hero's and the RFQ section's.
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
