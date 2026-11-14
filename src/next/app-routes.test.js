import { test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { rootMetadata } from './seo.ts';
import ZhLayout, { metadata as zhLayoutMetadata } from '../../app/(zh)/layout.tsx';
import ZhCassavaPage, { metadata as zhCassavaMetadata } from '../../app/(zh)/zh-cn/cassava-chips/page.tsx';
import KoLayout, { metadata as koLayoutMetadata } from '../../app/(ko)/layout.tsx';
import KoTapiocaPage, { metadata as koTapiocaMetadata } from '../../app/(ko)/ko/tapioca-chips/page.tsx';
import { GET as sitemap } from '../../app/sitemap.xml/route.ts';

// The Next.js routes run here outside a server component environment.
vi.mock('server-only', () => ({}));

const CASSAVA = ['/products/dried-cassava-chips', '/vi/san-pham/san-lat-kho', '/zh-cn/cassava-chips', '/ko/tapioca-chips'];
const LANGUAGES = ['en', 'vi', 'zh-CN', 'ko', 'x-default'];

test('the zh and ko root layouts: the site metadata, and a zh-CN or ko document', () => {
  assert.equal(zhLayoutMetadata, rootMetadata);
  assert.equal(koLayoutMetadata, rootMetadata);
  assert.match(renderToStaticMarkup(h(ZhLayout, null, 'page')), /^<html lang="zh-CN">.*<body>.*page<\/body><\/html>$/s);
  assert.match(renderToStaticMarkup(h(KoLayout, null, 'page')), /^<html lang="ko">.*<body>.*page<\/body><\/html>$/s);
});

test('/zh-cn/cassava-chips: the Chinese title and the cassava hreflang set; the page renders the Chinese view', () => {
  const { title, alternates } = zhCassavaMetadata;
  assert.equal(title, '越南木薯干片供应商与工厂批量采购方案');
  assert.match(alternates.canonical, /\/zh-cn\/cassava-chips$/);
  assert.deepEqual(Object.keys(alternates.languages), LANGUAGES);
  assert.match(renderToStaticMarkup(h(ZhCassavaPage)), /<h1 id="scoped-title">由 HMV Global 管理的木薯干片批量供应方案<\/h1>/);
});

test('/ko/tapioca-chips: the Korean title and the cassava hreflang set; the page renders the Korean view', () => {
  const { title, alternates } = koTapiocaMetadata;
  assert.equal(title, '베트남 타피오카 칩 공급 - 주정·에탄올·사료 제조업체용 원료');
  assert.match(alternates.canonical, /\/ko\/tapioca-chips$/);
  assert.deepEqual(Object.keys(alternates.languages), LANGUAGES);
  assert.match(renderToStaticMarkup(h(KoTapiocaPage)), /<h1 id="scoped-title">HMV Global이 관리하는 제조사용 타피오카 칩 대량 공급<\/h1>/);
});

test('sitemap: the four cassava URLs, each with the zh-CN and ko alternates; no other entry has either', async () => {
  const entries = (await (await sitemap()).text()).match(/<url>.*?<\/url>/g);
  const scoped = entries.filter(e => e.includes('hreflang="zh-CN"') || e.includes('hreflang="ko"'));
  assert.deepEqual(scoped.map(e => new URL(e.match(/<loc>(.*?)<\/loc>/)[1]).pathname), CASSAVA);
  for (const e of scoped) assert.ok(e.includes('hreflang="zh-CN"') && e.includes('hreflang="ko"'), e);
  assert.ok(entries.length > scoped.length);
});
