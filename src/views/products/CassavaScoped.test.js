// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { cassavaChina } from '@/data/cassavaChina.js';
import { cassavaEvidence } from '@/data/cassavaEvidence.js';
import { cassavaKorea } from '@/data/cassavaKorea.js';
import { OPEN_TRADE_DESK } from '@/features/trade-desk/open.js';
import { CassavaChinaView } from './CassavaChinaView.jsx';
import { CassavaKoreaView } from './CassavaKoreaView.jsx';
import { Quality } from './CassavaProcurement.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
vi.setConfig({ testTimeout: 20_000 });

// The two page-scoped cassava pages (views/products/CassavaScoped.jsx): the same chrome and sections, their own copy.
const PAGES = [
  { name: 'Chinese', View: CassavaChinaView, c: cassavaChina, lang: 'zh', locale: 'zh-CN' },
  { name: 'Korean', View: CassavaKoreaView, c: cassavaKorea, lang: 'ko', locale: 'ko' },
];

let root, container;
beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
const render = View => act(() => root.render(h(View)));
const texts = selector => [...container.querySelectorAll(selector)].map(e => e.textContent);
// jsdom has no showModal() or close(): the previews' dialogs need them (tests/next/supply-evidence.spec.js uses the
// browser's).
const stubDialog = () => {
  HTMLDialogElement.prototype.showModal ??= function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function close() {
    this.open = false;
  };
};

for (const { name, View, c, lang, locale } of PAGES) {
  test(`${name}: section links to this page; the page in English, Vietnamese, Chinese and Korean, this one current`, async () => {
    await render(View);
    for (const [id, label] of c.nav.items) {
      assert.equal(container.querySelector(`.nav-center a[href="#${id}"]`).textContent, label);
      assert.ok(container.querySelector(`section#${id}`), id);
    }
    // The site's language menu shows this page's language; the four links are in the HTML even while it is closed.
    const trigger = container.querySelector('header button.hmv-lang-trigger');
    assert.equal(trigger.textContent, { 'zh-CN': '简体中文', ko: '한국어' }[locale]);
    assert.equal(trigger.getAttribute('aria-label'), { 'zh-CN': '选择语言，当前：简体中文', ko: '언어 선택, 현재: 한국어' }[locale]);
    const languages = [...container.querySelectorAll('header ul[hidden] a')].map(a => [a.hreflang, a.lang, a.getAttribute('href'), a.getAttribute('aria-current')]);
    assert.deepEqual(languages, [
      ['en', '/products/dried-cassava-chips'],
      ['vi', '/vi/san-pham/san-lat-kho'],
      ['zh-CN', '/zh-cn/cassava-chips'],
      ['ko', '/ko/tapioca-chips'],
    ].map(([l, href]) => [l, l, href, l === locale ? 'page' : null]));
  });

  test(`${name}: each call to action opens the HMV Trade Desk with dried cassava chips, and says it is in English`, async () => {
    await render(View);
    const opened = [];
    const onOpen = e => opened.push(e.detail);
    window.addEventListener(OPEN_TRADE_DESK, onOpen);
    const buttons = [...container.querySelectorAll('button[title]')].filter(b => b.title === c.tradeDesk);
    assert.equal(buttons.length, 3);
    for (const button of buttons) await act(() => button.click());
    window.removeEventListener(OPEN_TRADE_DESK, onOpen);
    assert.deepEqual(opened, ['nav', 'hero', 'rfq'].map(at => ({ product: 'dried-cassava-chips', source: `${lang}_${at}` })));
  });
}

// The Korean page keeps the shared sections (CassavaScoped); the Chinese page has its own (CassavaProcurement), below.
test('Korean: one heading, the hero, the Intertek rows, the workflow and the RFQ checklist, from its copy', async () => {
  await render(CassavaKoreaView);
  const c = cassavaKorea;
  assert.deepEqual(texts('h1'), [c.hero.h1]);
  assert.deepEqual(texts('.money-trust li'), c.hero.trust);
  assert.deepEqual(texts('#quality .landing-table tbody tr').map(String), c.quality.rows.map(([n, value]) => n + value));
  assert.deepEqual(texts('.landing-steps strong'), c.workflow.steps.map(s => s.title));
  assert.deepEqual(texts('.scoped-rfq-card li'), c.rfq.items);
  assert.equal(container.querySelector('#scoped-rfq-title').textContent, c.rfq.title.join(''));
  assert.ok(container.querySelector('#capability .scoped-network').textContent.includes(c.network.text));
});

// The photographs the EN/VI page shows, in Korean: after the buyer value, before the quality results.
test('Korean: the supply evidence between the buyer section and the quality results', async () => {
  await render(CassavaKoreaView);
  const section = container.querySelector('section#supply-evidence');
  assert.equal(section.previousElementSibling.id, 'capability');
  assert.equal(section.nextElementSibling.id, 'quality');
  assert.equal(section.querySelector('h2').textContent, cassavaEvidence.copy.ko.title);
  const images = [...section.querySelectorAll('img')].map(i => [i.getAttribute('src'), i.alt, i.getAttribute('loading')]);
  assert.deepEqual(images, cassavaEvidence.photos.map(p => [p.src, p.alt.ko, 'lazy']));
  assert.deepEqual(texts('#supply-evidence figcaption'), cassavaEvidence.photos.map(p => p.caption.ko));
});

const zh = cassavaChina;
const ZH_SECTIONS = ['overview', 'applications', 'why-hmv', 'supply-evidence', 'quality', 'capability', 'workflow', 'faq', 'rfq'];
const labelOf = section => container.querySelector(`#${section.getAttribute('aria-labelledby')}`);

test('Chinese: one h1; every section in page order, named by its heading; the strip links each one', async () => {
  await render(CassavaChinaView);
  assert.deepEqual(texts('h1'), [zh.hero.h1]);
  const sections = [...container.querySelectorAll('main section')];
  assert.deepEqual(sections.map(s => s.id), ZH_SECTIONS);
  for (const section of sections) {
    assert.equal(labelOf(section).closest('section'), section, section.id);
    assert.equal(labelOf(section).tagName, section.id === 'overview' ? 'H1' : 'H2', section.id);
  }
  assert.deepEqual(sections.slice(1).map(s => labelOf(s).textContent), [
    zh.applications.title, zh.why.title, cassavaEvidence.copy.zh.title, zh.quality.title, zh.network.title, zh.workflow.title, zh.faq.title, zh.rfq.title,
  ]);
  // The strip below the hero: a link to each section, in page order.
  const strip = container.querySelector(`nav[aria-label="${zh.sections.label}"]`);
  assert.equal(strip.parentElement.previousElementSibling.id, 'overview');
  assert.deepEqual([...strip.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.textContent]), zh.sections.items.map(([id, label]) => [`#${id}`, label]));
});

test('Chinese hero: the trust points, the network figures and the Intertek sample reference, each qualified', async () => {
  await render(CassavaChinaView);
  const hero = container.querySelector('#overview');
  assert.deepEqual([...hero.querySelectorAll('ul li')].map(li => li.textContent), zh.hero.trust);
  assert.deepEqual([...hero.querySelectorAll('dd')].map(dd => dd.textContent), [...zh.figures.items.map(f => f.value), ...zh.intertek.results.map(([, v]) => v)]);
  for (const text of [zh.hero.lead, zh.figures.short, zh.intertek.report, zh.intertek.caption]) assert.ok(hero.textContent.includes(text), text);
});

test('Chinese quality: result cards, the full Intertek table and its source, then the laboratory analysis and how to read it', async () => {
  await render(CassavaChinaView);
  const quality = container.querySelector('#quality');
  const [cards, details] = quality.querySelectorAll('dl');
  assert.deepEqual([...cards.querySelectorAll('dd')].map(dd => dd.textContent), zh.quality.highlights.map(m => m.value));
  assert.deepEqual([...quality.querySelectorAll('thead th')].map(th => [th.textContent, th.scope]), zh.quality.head.map(h => [h, 'col']));
  assert.deepEqual([...quality.querySelectorAll('tbody tr')].map(tr => [tr.querySelector('th[scope=row]').textContent, tr.querySelector('td').textContent]), zh.quality.rows);
  for (const text of [zh.quality.note, zh.quality.source]) assert.ok(quality.textContent.includes(text), text);
  // After the results: the evidence, an aside named by its heading, with the analysis it comes from and how to read it.
  const aside = quality.querySelector('aside');
  assert.equal(labelOf(aside).tagName, 'H3');
  assert.equal(labelOf(aside).textContent, '第三方实验室分析');
  assert.ok(aside.contains(details));
  assert.deepEqual([...details.children].map(d => [d.querySelector('dt').textContent, d.querySelector('dd').textContent]), [
    ['检测机构', 'Intertek 越南'],
    ['报告编号', 'AGRIVIETNAM2026-1700'],
    ['报告日期', '2026年10月5日'],
    ['分析对象', '送检样品'],
  ]);
  assert.equal(aside.querySelector('h4').textContent, '如何理解本次样品结果？');
  assert.deepEqual([...aside.querySelectorAll('li')].map(li => li.textContent), zh.quality.evidence.explain.points);
  // No report pages are committed yet (data/cassavaQualityReport.js): no button, no link, nothing to open.
  assert.equal(quality.querySelector('button, a, dialog'), null);
});

test('Chinese quality report: its pages open in a modal dialog from a button; Escape closes it and focus returns', async () => {
  stubDialog();
  const pages = [1, 2].map(n => ({ src: `/report-${n}.webp`, width: 1654, height: 2339 }));
  await act(() => root.render(h(Quality, { quality: zh.quality, reportPages: pages })));
  const button = container.querySelector('#quality aside button');
  assert.equal(button.type, 'button');
  assert.equal(button.textContent, '查看检测报告');
  button.focus();
  await act(() => button.click());
  const dialog = container.querySelector('dialog');
  assert.equal(dialog.open, true);
  assert.equal(dialog.getAttribute('aria-label'), 'Intertek 越南分析报告 AGRIVIETNAM2026-1700');
  const close = dialog.querySelector('button');
  assert.equal(close.getAttribute('aria-label'), '关闭检测报告');
  assert.equal(document.activeElement, close);
  assert.deepEqual([...dialog.querySelectorAll('img')].map(i => [i.getAttribute('src'), i.alt, i.getAttribute('loading')]), [
    ['/report-1.webp', 'Intertek 越南分析报告 AGRIVIETNAM2026-1700 · 1/2', null],
    ['/report-2.webp', 'Intertek 越南分析报告 AGRIVIETNAM2026-1700 · 2/2', 'lazy'],
  ]);
  assert.ok(dialog.textContent.includes('报告中的发货人、收货人等商业信息已遮盖。'));
  await act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
  assert.equal(container.querySelector('dialog'), null);
  assert.equal(document.activeElement, button);
});

// One submitted sample analysed by Intertek: never a certification or a guarantee, of the product, the supplier or a
// shipment ("Intertek Certified Product", "Guaranteed by Intertek" and the like), on the page or in its copy.
test('Chinese page: no certification or guarantee claim', async () => {
  await render(CassavaChinaView);
  const claims = /certif|guarant|accredit|认证|认可|担保|保证/i;
  assert.doesNotMatch(container.textContent, claims);
  assert.doesNotMatch(JSON.stringify(zh), claims);
});

test('Chinese supply evidence: the HMV photographs between why HMV and quality, lazy, each opening larger', async () => {
  stubDialog();
  await render(CassavaChinaView);
  const section = container.querySelector('section#supply-evidence');
  assert.equal(section.previousElementSibling.id, 'why-hmv');
  assert.equal(section.nextElementSibling.id, 'quality');
  const images = [...section.querySelectorAll('img')].map(i => [i.getAttribute('src'), i.alt, i.getAttribute('loading')]);
  assert.deepEqual(images, cassavaEvidence.photos.map(p => [p.src, p.alt.zh, 'lazy']));
  assert.deepEqual(texts('#supply-evidence figcaption'), ['集货仓储与堆放', '装柜及出运准备', '木薯干片原料近景']);
  const frames = section.querySelectorAll('button.supply-evidence-frame');
  assert.equal(frames.length, 3);
  await act(() => frames[1].click());
  const dialog = section.querySelector('dialog.supply-evidence-preview');
  assert.equal(dialog.getAttribute('aria-label'), cassavaEvidence.photos[1].caption.zh);
  assert.equal(dialog.querySelector('img').alt, cassavaEvidence.photos[1].alt.zh);
});

test('Chinese capability, process, questions and call to action, from the copy', async () => {
  await render(CassavaChinaView);
  const capability = container.querySelector('#capability');
  assert.deepEqual([...capability.querySelectorAll('dd')].map(dd => dd.textContent), zh.figures.items.map(f => f.value));
  for (const text of [zh.network.text, zh.figures.note, zh.network.regions.label, ...zh.network.role.points]) assert.ok(capability.textContent.includes(text), text);
  assert.deepEqual([...capability.querySelectorAll('ol li')].map(li => li.textContent), zh.network.regions.items.map(([name, role]) => name + role));
  assert.deepEqual(texts('#workflow ol > li h3'), zh.workflow.steps.map(s => s.title));
  assert.deepEqual(texts('#workflow ol > li p'), zh.workflow.steps.map(s => s.text));
  // Native disclosure widgets, closed; the answers are in the markup all the same.
  const details = [...container.querySelectorAll('#faq details')];
  assert.deepEqual(details.map(d => [d.open, d.querySelector('summary').textContent, d.querySelector('p').textContent]), zh.faq.items.map(i => [false, i.q, i.a]));
  assert.deepEqual([...container.querySelectorAll('#faq details a')].map(a => [a.getAttribute('href'), a.textContent]), zh.faq.items.filter(i => i.link).map(i => i.link));
  assert.deepEqual(texts('#rfq li'), zh.rfq.items.map(([label, hint]) => label + hint));
  assert.ok(container.querySelector('#rfq').textContent.includes(zh.rfq.note));
});

// Manufacturers first: the use cases follow the hero, the network figures come after the buyer value.
test('Korean: the hero panel shows what a factory buys; the use cases come next; the network figures after the buyer value', async () => {
  await render(CassavaKoreaView);
  const c = cassavaKorea;
  const hero = container.querySelector('#overview');
  assert.deepEqual([...hero.querySelectorAll('.scoped-facts dt')].map(e => e.textContent), c.panel.items.map(([term]) => term));
  assert.equal(hero.querySelector('.money-figure-amount'), null, 'no capacity figure in the hero');
  assert.ok(!hero.textContent.includes('캄보디아'));
  const useCases = container.querySelector('section#applications');
  assert.equal(useCases.previousElementSibling, hero);
  assert.deepEqual([...useCases.querySelectorAll('h3')].map(e => e.textContent), ['주정·에탄올 생산', '사료 생산', '전분 가공']);
  const capability = container.querySelector('#capability');
  assert.equal(capability.previousElementSibling, useCases);
  assert.deepEqual([...capability.querySelectorAll('.money-figures dd')].map(e => e.textContent), c.figures.items.map(f => f.value));
  assert.equal(container.querySelector('.scoped-support').textContent, c.hero.support);
});

// The Korean page's market teaser links to the Korean market page; the Chinese page has no market page to link to.
test('the market teaser links to /ko/tapioca-market on the Korean page only', async () => {
  await render(CassavaKoreaView);
  const link = container.querySelector('.scoped-market a');
  assert.deepEqual([link.getAttribute('href'), link.textContent], ['/ko/tapioca-market', '타피오카 조달 인사이트 보기']);
  await act(() => root.unmount());
  root = createRoot(container);
  await render(CassavaChinaView);
  assert.equal(container.querySelector('.scoped-market a'), null);
});
