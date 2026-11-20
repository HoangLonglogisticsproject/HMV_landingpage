// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { cassavaChina } from '@/data/cassavaChina.js';
import { cassavaChinaGuides } from '@/data/cassavaChinaGuides.js';
import { OPEN_TRADE_DESK } from '@/features/trade-desk/open.js';
import { CassavaGuideView } from './CassavaGuideView.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
vi.setConfig({ testTimeout: 20_000 });

let root, container;
beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
const render = props => act(() => root.render(h(CassavaGuideView, props)));
const hrefs = selector => [...container.querySelectorAll(selector)].map(a => a.getAttribute('href'));
const { copy, items } = cassavaChinaGuides;

for (const [slug, guide] of Object.entries(items)) {
  test(`${slug}: one h1, its date, the body; every header link has its section`, async () => {
    await render({ slug });
    assert.deepEqual([...container.querySelectorAll('h1')].map(e => e.textContent), [guide.h1]);
    assert.equal(container.querySelector('.article-meta time').getAttribute('datetime'), guide.published);
    assert.equal(container.querySelector('.article-meta time').textContent, '发布日期：2026年11月21日');
    for (const href of hrefs('.nav-center a')) assert.ok(container.querySelector(href), href);
    assert.ok(container.querySelector('#guide h2'));
  });

  test(`${slug}: links back to the procurement page and to the other guides`, async () => {
    await render({ slug });
    // The header action, the link above the title and the related list; the body links to the page or its sections.
    assert.deepEqual(hrefs('header a.nav-support-btn, main > .article-col:first-child a'), ['/zh-cn/cassava-chips', '/zh-cn/cassava-chips']);
    assert.ok(hrefs('#guide a').some(href => href.startsWith('/zh-cn/cassava-chips')));
    const others = Object.keys(items).filter(other => other !== slug).map(other => `/zh-cn/cassava-chips/${other}`);
    assert.deepEqual(hrefs('#related li a'), ['/zh-cn/cassava-chips', ...others]);
  });

  test(`${slug}: the call to action opens the HMV Trade Desk with its own source; the Chinese commercial support`, async () => {
    await render({ slug });
    const opened = [];
    const onOpen = e => opened.push(e.detail);
    window.addEventListener(OPEN_TRADE_DESK, onOpen);
    const button = container.querySelector('.article-cta button');
    assert.equal(button.title, cassavaChina.tradeDesk);
    await act(() => button.click());
    window.removeEventListener(OPEN_TRADE_DESK, onOpen);
    assert.deepEqual(opened, [{ product: 'dried-cassava-chips', source: guide.source }]);
    const support = container.querySelector('#commercial-support');
    assert.equal(support.querySelector('h2').textContent, '中文商务支持');
    assert.deepEqual([...support.querySelectorAll('li')].map(li => li.textContent), ['产品规格', '月度采购量', '目的地', '商务条款', '订单跟进']);
  });
}

// A dated market update: external data with its original sources, apart from HMV's reading. Fixture only: none is
// published until HMV approves sourced figures.
const MARKET = {
  kind: 'market',
  source: 'zh_market_test',
  published: '2026-12-01',
  updated: '2026-12-05',
  seo: { title: '测试', description: '测试' },
  eyebrow: 'HMV GLOBAL · 市场动态',
  h1: '木薯干片市场动态（测试）',
  lead: '导语',
  data: [['p', '外部来源报告的数据。']],
  sources: [{ publisher: '来源机构', title: '原始报告', url: 'https://example.org/report', date: '2026-11-28' }],
  buyers: [['p', 'HMV 的采购解读，见[采购方案](/zh-cn/cassava-chips)。']],
};

test('a market update: its dates, the external data with each original source, then 对采购商意味着什么？', async () => {
  await render({ slug: 'market-test', guides: { 'market-test': MARKET, 'quality-guide': items['quality-guide'] } });
  assert.deepEqual([...container.querySelectorAll('.article-meta time')].map(t => t.getAttribute('datetime')), ['2026-12-01', '2026-12-05']);
  assert.deepEqual([...container.querySelectorAll('.nav-center a')].map(a => a.getAttribute('href')), ['#market-data', '#buyers', '#commercial-support', '#related']);
  const data = container.querySelector('section#market-data');
  assert.equal(data.querySelector('h2').textContent, copy.market.data);
  assert.ok(data.textContent.includes(copy.market.dataNote));
  const source = data.querySelector('ol a');
  assert.deepEqual([source.getAttribute('href'), source.target, source.rel, source.textContent], ['https://example.org/report', '_blank', 'noopener noreferrer', '来源机构：原始报告']);
  assert.equal(data.querySelector('ol time').getAttribute('datetime'), '2026-11-28');
  const buyers = container.querySelector('section#buyers');
  assert.equal(buyers.querySelector('h2').textContent, '对采购商意味着什么？');
  assert.ok(buyers.compareDocumentPosition(data) & Node.DOCUMENT_POSITION_PRECEDING);
  assert.deepEqual(hrefs('#buyers p a'), ['/zh-cn/cassava-chips']);
  assert.equal(container.querySelector('#guide'), null);
});
