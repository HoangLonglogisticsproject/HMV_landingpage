import { test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import GuidePage, { dynamicParams, generateMetadata, generateStaticParams } from '../../app/(zh)/zh-cn/cassava-chips/[slug]/page.tsx';
import { GET as sitemap } from '../../app/sitemap.xml/route.ts';
import { ZH_CASSAVA_GUIDES } from '../i18n/routes.js';
import { cassavaChinaGuides } from '../data/cassavaChinaGuides.js';

// The Next.js routes run here outside a server component environment.
vi.mock('server-only', () => ({}));

// The Simplified Chinese guides: one page per entry of the data, nothing else; original content in one language.
test('/zh-cn/cassava-chips/<slug>: one static page per guide, unknown slugs 404', () => {
  assert.equal(dynamicParams, false);
  assert.deepEqual(generateStaticParams(), ZH_CASSAVA_GUIDES.map(slug => ({ slug })));
});

for (const slug of ZH_CASSAVA_GUIDES) {
  test(`/zh-cn/cassava-chips/${slug}: its title and description, a self canonical, no alternates; one h1`, async () => {
    const params = Promise.resolve({ slug });
    const { title, description, alternates, openGraph } = await generateMetadata({ params });
    assert.deepEqual([title, description], [cassavaChinaGuides.items[slug].seo.title, cassavaChinaGuides.items[slug].seo.description]);
    assert.equal(alternates.canonical, `https://www.hmv-global.com/zh-cn/cassava-chips/${slug}`);
    assert.deepEqual(alternates.languages, {});
    assert.deepEqual([openGraph.locale, openGraph.alternateLocale], ['zh_CN', undefined]);
    const html = renderToStaticMarkup(await GuidePage({ params }));
    assert.equal(html.match(/<h1\b/g).length, 1);
    assert.ok(html.includes(`<h1>${cassavaChinaGuides.items[slug].h1}</h1>`));
  });
}

test('sitemap: each Chinese guide once, without alternates', async () => {
  const entries = (await (await sitemap()).text()).match(/<url>.*?<\/url>/g);
  for (const slug of ZH_CASSAVA_GUIDES) {
    const loc = `https://www.hmv-global.com/zh-cn/cassava-chips/${slug}`;
    assert.deepEqual(entries.filter(e => e.includes(`${loc}<`)), [`<url><loc>${loc}</loc></url>`]);
  }
});
