import { test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import KoGuidePage, * as koRoute from '../../app/(ko)/ko/tapioca-chips/[slug]/page.tsx';
import ZhGuidePage, * as zhRoute from '../../app/(zh)/zh-cn/cassava-chips/[slug]/page.tsx';
import { GET as sitemap } from '../../app/sitemap.xml/route.ts';
import { KO_CASSAVA_GUIDES, ZH_CASSAVA_GUIDES } from '../i18n/routes.js';
import { cassavaChinaGuides } from '../data/cassavaChinaGuides.js';
import { cassavaKoreaGuides } from '../data/cassavaKoreaGuides.js';

// The Next.js routes run here outside a server component environment.
vi.mock('server-only', () => ({}));

// The Simplified Chinese and Korean guides: one page per entry of the data, nothing else; original content in one
// language, so a self canonical, no alternates and no translation of another page.
const SETS = [
  { base: '/zh-cn/cassava-chips', slugs: ZH_CASSAVA_GUIDES, data: cassavaChinaGuides, route: zhRoute, Page: ZhGuidePage, og: 'zh_CN' },
  { base: '/ko/tapioca-chips', slugs: KO_CASSAVA_GUIDES, data: cassavaKoreaGuides, route: koRoute, Page: KoGuidePage, og: 'ko_KR' },
];

for (const { base, slugs, data, route, Page, og } of SETS) {
  test(`${base}/<slug>: one static page per guide, unknown slugs 404`, () => {
    assert.equal(route.dynamicParams, false);
    assert.deepEqual(route.generateStaticParams(), slugs.map(slug => ({ slug })));
  });

  for (const slug of slugs) {
    test(`${base}/${slug}: its title and description, a self canonical, no alternates; one h1`, async () => {
      const params = Promise.resolve({ slug });
      const { title, description, alternates, openGraph } = await route.generateMetadata({ params });
      assert.deepEqual([title, description], [data.items[slug].seo.title, data.items[slug].seo.description]);
      assert.equal(alternates.canonical, `https://www.hmv-global.com${base}/${slug}`);
      assert.deepEqual(alternates.languages, {});
      assert.deepEqual([openGraph.locale, openGraph.alternateLocale], [og, undefined]);
      const html = renderToStaticMarkup(await Page({ params }));
      assert.equal(html.match(/<h1\b/g).length, 1);
      assert.ok(html.includes(`<h1>${data.items[slug].h1}</h1>`));
    });
  }

  test(`sitemap: each guide under ${base} once, without alternates`, async () => {
    const entries = (await (await sitemap()).text()).match(/<url>.*?<\/url>/g);
    for (const slug of slugs) {
      const loc = `https://www.hmv-global.com${base}/${slug}`;
      assert.deepEqual(entries.filter(e => e.includes(`${loc}<`)), [`<url><loc>${loc}</loc></url>`]);
    }
  });
}
