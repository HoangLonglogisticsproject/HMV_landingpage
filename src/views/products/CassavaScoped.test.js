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

// The procurement page (CassavaProcurement) in each language, from its own copy: the same sections in the same order;
// the Korean page adds its market intelligence block before the call to action.
const SECTIONS = ['overview', 'applications', 'why-hmv', 'supply-evidence', 'quality', 'capability', 'workflow', 'faq'];
const labelOf = section => container.querySelector(`#${section.getAttribute('aria-labelledby')}`);
// The lucide icon of a card: what it is, by its `key`, whatever its position in the copy.
const iconOf = card => [...card.querySelector('svg').classList].find(name => name.startsWith('lucide-'));
const ICONS = {
  bioethanol: 'lucide-flask-conical',
  feed: 'lucide-wheat',
  starch: 'lucide-factory',
  network: 'lucide-layers',
  monthly: 'lucide-calendar-days',
  quality: 'lucide-shield-check',
  consolidation: 'lucide-boxes',
  delivery: 'lucide-truck',
};
// The quality cards' names: the result's name without its English gloss ("砂和二氧化硅（Sand & silica）").
const CARD_NAMES = {
  Chinese: ['淀粉', '水分', '粗纤维', '砂和二氧化硅'],
  Korean: ['전분', '수분', '조섬유', '모래 및 실리카'],
};
// The analysis' details, written out: laboratory, report number, report date, what was analysed.
const DETAILS = {
  Chinese: [['检测机构', 'Intertek 越南'], ['报告编号', 'AGRIVIETNAM2026-1700'], ['报告日期', '2026年10月5日'], ['分析对象', '送检样品']],
  Korean: [['분석 기관', 'Intertek 베트남'], ['보고서 번호', 'AGRIVIETNAM2026-1700'], ['보고서 일자', '2026년 10월 5일'], ['분석 대상', '제출 샘플']],
};
// One submitted sample analysed by Intertek: never a certification or a guarantee of the product, the supplier or a
// shipment ("Intertek Certified Product", "Guaranteed by Intertek" and the like), in any of the pages' languages.
const CLAIMS = /certif|guarant|accredit|认证|认可|担保|保证|인증|보증|보장|공인/i;

for (const { name, View, c, lang } of PAGES) {
  test(`${name}: one h1; every section in page order, named by its h2; the strip links each one`, async () => {
    await render(View);
    assert.deepEqual(texts('h1'), [c.hero.h1]);
    const sections = [...container.querySelectorAll('main section')];
    assert.deepEqual(sections.map(s => s.id), [...SECTIONS, ...(c.market ? ['market'] : []), 'rfq']);
    for (const section of sections) {
      assert.equal(labelOf(section).closest('section'), section, section.id);
      assert.equal(labelOf(section).tagName, section.id === 'overview' ? 'H1' : 'H2', section.id);
    }
    assert.deepEqual(sections.slice(1).map(s => labelOf(s).textContent), [
      c.applications.title, c.why.title, cassavaEvidence.copy[lang].title, c.quality.title, c.network.title, c.workflow.title, c.faq.title,
      ...(c.market ? [c.market.title] : []),
      c.rfq.title,
    ]);
    // The strip below the hero: a link to each section, in page order.
    const strip = container.querySelector(`nav[aria-label="${c.sections.label}"]`);
    assert.equal(strip.parentElement.previousElementSibling.id, 'overview');
    assert.deepEqual([...strip.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.textContent]), c.sections.items.map(([id, label]) => [`#${id}`, label]));
  });

  test(`${name}: applications and why HMV as h3 cards, each with the icon of what it is, whatever its position`, async () => {
    await render(View);
    const applications = [...container.querySelectorAll('#applications article')];
    assert.deepEqual(applications.map(a => [a.querySelector('h3').textContent, iconOf(a)]), c.applications.items.map(i => [i.title, ICONS[i.key]]));
    const why = [...container.querySelectorAll('#why-hmv li')];
    assert.deepEqual(why.map(li => [li.querySelector('h3').textContent, iconOf(li)]), c.why.items.map(i => [i.title, ICONS[i.key]]));
  });

  test(`${name} supply evidence: the HMV photographs between why HMV and quality, lazy, each opening larger`, async () => {
    stubDialog();
    await render(View);
    const section = container.querySelector('section#supply-evidence');
    assert.equal(section.previousElementSibling.id, 'why-hmv');
    assert.equal(section.nextElementSibling.id, 'quality');
    const images = [...section.querySelectorAll('img')].map(i => [i.getAttribute('src'), i.alt, i.getAttribute('loading')]);
    assert.deepEqual(images, cassavaEvidence.photos.map(p => [p.src, p.alt[lang], 'lazy']));
    assert.deepEqual(texts('#supply-evidence figcaption'), cassavaEvidence.photos.map(p => p.caption[lang]));
    const frames = section.querySelectorAll('button.supply-evidence-frame');
    assert.equal(frames.length, 3);
    await act(() => frames[1].click());
    const dialog = section.querySelector('dialog.supply-evidence-preview');
    assert.equal(dialog.getAttribute('aria-label'), cassavaEvidence.photos[1].caption[lang]);
    assert.equal(dialog.querySelector('img').alt, cassavaEvidence.photos[1].alt[lang]);
  });

  test(`${name} quality: result cards, the full Intertek table and its source, then the laboratory analysis and how to read it`, async () => {
    await render(View);
    const quality = container.querySelector('#quality');
    const [cards, details] = quality.querySelectorAll('dl');
    assert.deepEqual([...cards.querySelectorAll('dd')].map(dd => dd.textContent), ['71.1%', '11.55%', '2.99%', '0.45%']);
    assert.deepEqual([...cards.querySelectorAll('dt')].map(dt => dt.firstChild.textContent), CARD_NAMES[name]);
    assert.deepEqual([...cards.querySelectorAll('dt span')].map(s => s.textContent), ['Starch', 'Moisture', 'Raw fiber', 'Sand & silica']);
    assert.deepEqual([...quality.querySelectorAll('thead th')].map(th => [th.textContent, th.scope]), c.quality.head.map(head => [head, 'col']));
    assert.deepEqual([...quality.querySelectorAll('tbody tr')].map(tr => [tr.querySelector('th[scope=row]').textContent, tr.querySelector('td').textContent]), c.quality.rows);
    for (const text of [c.quality.note, c.quality.source]) assert.ok(quality.textContent.includes(text), text);
    // After the results: the evidence, an aside named by its h3, with the analysis it comes from and how to read it.
    const aside = quality.querySelector('aside');
    assert.equal(labelOf(aside).tagName, 'H3');
    assert.equal(labelOf(aside).textContent, c.quality.evidence.title);
    assert.ok(aside.contains(details));
    assert.deepEqual([...details.children].map(d => [d.querySelector('dt').textContent, d.querySelector('dd').textContent]), DETAILS[name]);
    assert.equal(aside.querySelector('h4').textContent, c.quality.evidence.explain.title);
    assert.deepEqual([...aside.querySelectorAll('li')].map(li => li.textContent), c.quality.evidence.explain.points);
    // No report pages are committed yet (data/cassavaQualityReport.js): no button, no link, nothing to open.
    assert.equal(quality.querySelector('button, a, dialog'), null);
  });

  test(`${name} quality report: its pages open in a modal dialog from a button; Escape closes it and focus returns`, async () => {
    stubDialog();
    const { evidence } = c.quality;
    const pages = [1, 2].map(n => ({ src: `/report-${n}.webp`, width: 1654, height: 2339 }));
    await act(() => root.render(h(Quality, { quality: c.quality, reportPages: pages })));
    const button = container.querySelector('#quality aside button');
    assert.equal(button.type, 'button');
    assert.equal(button.textContent, evidence.view);
    button.focus();
    await act(() => button.click());
    const dialog = container.querySelector('dialog');
    assert.equal(dialog.open, true);
    assert.equal(dialog.getAttribute('aria-label'), `Intertek ${{ Chinese: '越南分析报告', Korean: '베트남 분석 보고서' }[name]} AGRIVIETNAM2026-1700`);
    const close = dialog.querySelector('button');
    assert.equal(close.getAttribute('aria-label'), evidence.close);
    assert.equal(document.activeElement, close);
    assert.deepEqual([...dialog.querySelectorAll('img')].map(i => [i.getAttribute('src'), i.alt, i.getAttribute('loading')]), [
      ['/report-1.webp', `${evidence.name} · 1/2`, null],
      ['/report-2.webp', `${evidence.name} · 2/2`, 'lazy'],
    ]);
    assert.ok(dialog.textContent.includes(evidence.redacted));
    await act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    assert.equal(container.querySelector('dialog'), null);
    assert.equal(document.activeElement, button);
  });

  test(`${name}: no certification or guarantee claim, on the page or in its copy`, async () => {
    await render(View);
    assert.doesNotMatch(container.textContent, CLAIMS);
    assert.doesNotMatch(JSON.stringify(c), CLAIMS);
  });

  test(`${name}: network, process, questions (server-rendered, closed) and the call to action, from the copy`, async () => {
    await render(View);
    const capability = container.querySelector('#capability');
    assert.deepEqual([...capability.querySelectorAll('dd')].map(dd => dd.textContent), c.figures.items.map(f => f.value));
    for (const text of [c.network.text, c.figures.note, c.network.regions.label, ...c.network.role.points]) assert.ok(capability.textContent.includes(text), text);
    assert.deepEqual([...capability.querySelectorAll('ol li')].map(li => li.textContent), c.network.regions.items.map(([region, role]) => region + role));
    assert.deepEqual(texts('#workflow ol > li h3'), c.workflow.steps.map(s => s.title));
    assert.deepEqual(texts('#workflow ol > li p'), c.workflow.steps.map(s => s.text));
    // Native disclosure widgets, closed; the answers are in the markup all the same.
    const details = [...container.querySelectorAll('#faq details')];
    assert.deepEqual(details.map(d => [d.open, d.querySelector('summary').textContent, d.querySelector('p').textContent]), c.faq.items.map(i => [false, i.q, i.a]));
    assert.deepEqual([...container.querySelectorAll('#faq details a')].map(a => [a.getAttribute('href'), a.textContent]), c.faq.items.filter(i => i.link).map(i => i.link));
    // What to send, each with the icon of what it is.
    const rfq = [...container.querySelectorAll('#rfq li')];
    assert.deepEqual(rfq.map(li => li.textContent), c.rfq.items.map(i => i.label + (i.hint ?? '')));
    assert.deepEqual(rfq.map(iconOf), c.rfq.items.map(i => ({ company: 'lucide-building2', destination: 'lucide-map-pin', volume: 'lucide-layers', application: 'lucide-flask-conical' })[i.key]));
    assert.ok(container.querySelector('#rfq').textContent.includes(c.rfq.note));
  });
}

const zh = cassavaChina;
const ko = cassavaKorea;

test('Chinese hero: the trust points, the network figures and the Intertek sample reference, each qualified', async () => {
  await render(CassavaChinaView);
  const hero = container.querySelector('#overview');
  assert.deepEqual([...hero.querySelectorAll('ul li')].map(li => li.textContent), zh.hero.trust);
  assert.deepEqual([...hero.querySelectorAll('dd')].map(dd => dd.textContent), [...zh.figures.items.map(f => f.value), ...zh.intertek.results.map(([, v]) => v)]);
  for (const text of [zh.hero.lead, zh.figures.short, zh.intertek.report, zh.intertek.caption]) assert.ok(hero.textContent.includes(text), text);
});

// Manufacturers first: the hero panel says what a factory buys; the network figures come after the buyer value.
test('Korean hero: what a factory buys and the Intertek reference, manufacturers before importers; no network figure', async () => {
  await render(CassavaKoreaView);
  const hero = container.querySelector('#overview');
  assert.deepEqual([...hero.querySelectorAll('ul li')].map(li => li.textContent), ko.hero.trust);
  assert.deepEqual([...hero.querySelectorAll('dt')].map(dt => dt.textContent), [...ko.panel.items.map(([term]) => term), ...ko.intertek.results.map(([n]) => n)]);
  assert.deepEqual([...hero.querySelectorAll('dd')].map(dd => dd.textContent), [...ko.panel.items.map(([, value]) => value), ...ko.intertek.results.map(([, v]) => v)]);
  for (const text of [ko.hero.lead, ko.hero.support, ko.intertek.report, ko.intertek.caption]) assert.ok(hero.textContent.includes(text), text);
  assert.ok(hero.textContent.indexOf(ko.hero.lead) < hero.textContent.indexOf(ko.hero.support));
  assert.ok(!hero.textContent.includes('캄보디아'));
  assert.ok(!hero.textContent.includes('톤/월'));
  // The network figures: in the supply network section, after applications, why HMV, the evidence and quality.
  assert.deepEqual([...container.querySelectorAll('#capability dd')].map(dd => dd.textContent), ko.figures.items.map(f => f.value));
});

// The Korean page's market block links to the Korean market page; the Chinese page has no market page to link to.
test('the market block links to /ko/tapioca-market on the Korean page only', async () => {
  await render(CassavaKoreaView);
  const market = container.querySelector('section#market');
  assert.equal(market.querySelector('h3').textContent, ko.market.heading);
  assert.ok(market.textContent.includes(ko.market.text));
  const link = market.querySelector('a');
  assert.deepEqual([link.getAttribute('href'), link.textContent], ['/ko/tapioca-market', '타피오카 조달 인사이트 보기']);
  await act(() => root.unmount());
  root = createRoot(container);
  await render(CassavaChinaView);
  assert.equal(container.querySelector('#market, a[href^="/ko/tapioca-market"]'), null);
});
