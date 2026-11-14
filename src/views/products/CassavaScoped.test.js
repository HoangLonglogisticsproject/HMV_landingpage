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

for (const { name, View, c, lang, locale } of PAGES) {
  test(`${name}: one heading, the hero, the Intertek rows, the workflow and the RFQ checklist, from its copy`, async () => {
    await render(View);
    assert.deepEqual(texts('h1'), [c.hero.h1]);
    assert.deepEqual(texts('.money-trust li'), c.hero.trust);
    assert.deepEqual(texts('#quality .landing-table tbody tr').map(String), c.quality.rows.map(([n, value]) => n + value));
    assert.deepEqual(texts('.landing-steps strong'), c.workflow.steps.map(s => s.title));
    assert.deepEqual(texts('.scoped-rfq-card li'), c.rfq.items);
    assert.equal(container.querySelector('#scoped-rfq-title').textContent, c.rfq.title.join(''));
    assert.ok(container.querySelector('#capability .scoped-network').textContent.includes(c.network.text));
  });

  // The photographs the EN/VI page shows, in this page's language: after the buyer value, before the quality results.
  test(`${name}: the supply evidence between the buyer section and the quality results`, async () => {
    await render(View);
    const section = container.querySelector('section#supply-evidence');
    assert.equal(section.previousElementSibling.id, 'capability');
    assert.equal(section.nextElementSibling.id, 'quality');
    assert.equal(section.querySelector('h2').textContent, cassavaEvidence.copy[lang].title);
    const images = [...section.querySelectorAll('img')].map(i => [i.getAttribute('src'), i.alt, i.getAttribute('loading')]);
    assert.deepEqual(images, cassavaEvidence.photos.map(p => [p.src, p.alt[lang], 'lazy']));
    assert.deepEqual(texts('#supply-evidence figcaption'), cassavaEvidence.photos.map(p => p.caption[lang]));
  });

  test(`${name}: section links to this page; the page in English, Vietnamese, Chinese and Korean, this one current`, async () => {
    await render(View);
    for (const [id, label] of c.nav.items) {
      assert.equal(container.querySelector(`.nav-center a[href="#${id}"]`).textContent, label);
      assert.ok(container.querySelector(`section#${id}`), id);
    }
    const languages = [...container.querySelectorAll('.scoped-langs a')].map(a => [a.hreflang, a.getAttribute('href'), a.getAttribute('aria-current')]);
    assert.deepEqual(languages, [
      ['en', '/products/dried-cassava-chips'],
      ['vi', '/vi/san-pham/san-lat-kho'],
      ['zh-CN', '/zh-cn/cassava-chips'],
      ['ko', '/ko/tapioca-chips'],
    ].map(([l, href]) => [l, href, l === locale ? 'page' : null]));
  });

  test(`${name}: each call to action opens the HMV Trade Desk with dried cassava chips, and says it is in English`, async () => {
    await render(View);
    const opened = [];
    const onOpen = e => opened.push(e.detail);
    window.addEventListener(OPEN_TRADE_DESK, onOpen);
    const buttons = [...container.querySelectorAll('button[title]')];
    for (const button of buttons) await act(() => button.click());
    window.removeEventListener(OPEN_TRADE_DESK, onOpen);
    assert.deepEqual(opened, ['nav', 'hero', 'rfq'].map(at => ({ product: 'dried-cassava-chips', source: `${lang}_${at}` })));
    assert.ok(buttons.every(b => b.title === c.tradeDesk));
  });
}

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
