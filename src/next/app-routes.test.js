import { test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { rootMetadata } from './seo.ts';
import ZhLayout, { metadata as zhLayoutMetadata } from '../../app/(zh)/layout.tsx';
import ZhCassavaPage, { metadata as zhCassavaMetadata } from '../../app/(zh)/zh-cn/cassava-chips/page.tsx';
import { GET as sitemap } from '../../app/sitemap.xml/route.ts';

// The Next.js routes run here outside a server component environment.
vi.mock('server-only', () => ({}));

const CASSAVA = ['/products/dried-cassava-chips', '/vi/san-pham/san-lat-kho', '/zh-cn/cassava-chips'];

test('the zh root layout: the site metadata, and a zh-CN document', () => {
  assert.equal(zhLayoutMetadata, rootMetadata);
  assert.match(renderToStaticMarkup(h(ZhLayout, null, 'page')), /^<html lang="zh-CN">.*<body>.*page<\/body><\/html>$/s);
});

test('/zh-cn/cassava-chips: the Chinese title and the cassava hreflang set; the page renders the Chinese view', () => {
  const { title, alternates } = zhCassavaMetadata;
  assert.equal(title, '越南木薯干片供应商与工厂批量采购方案');
  assert.match(alternates.canonical, /\/zh-cn\/cassava-chips$/);
  assert.deepEqual(Object.keys(alternates.languages), ['en', 'vi', 'zh-CN', 'x-default']);
  assert.match(renderToStaticMarkup(h(ZhCassavaPage)), /<h1 id="zh-title">由 HMV Global 管理的木薯干片批量供应方案<\/h1>/);
});

test('sitemap: the three cassava URLs, each with the zh-CN alternate; no other entry has one', async () => {
  const entries = (await (await sitemap()).text()).match(/<url>.*?<\/url>/g);
  const withZh = entries.filter(e => e.includes('hreflang="zh-CN"'));
  assert.deepEqual(withZh.map(e => new URL(e.match(/<loc>(.*?)<\/loc>/)[1]).pathname), CASSAVA);
  assert.ok(entries.length > withZh.length);
});
