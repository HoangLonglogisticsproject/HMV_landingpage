import { LOCALES, PAGES, PRODUCT_PATHS, SCOPED_CONTENT_PAGES } from '@/i18n/routes';
import { loadArticleIndex, sitePagePaths } from '@/next/content';
import { absoluteUrl, alternateUrls, scopedLocales, type Lang, type LocalePaths, type PageLang } from '@/next/seo';

// The sitemap, written here rather than with Next.js's sitemap convention, which rewrites the root URL as `B/`: every
// <loc> and alternate comes from absoluteUrl(), the formatter of the canonical, hreflang and og:url. One entry per URL
// and language, page-scoped locales included, with the page's hreflang set as alternates; a standalone content page
// (SCOPED_CONTENT_PAGES) is one entry without alternates. Articles come from the content loader, so a takedown
// removes them here too. Prerendered at build (a GET handler is not cached by default): static in bundled mode; with
// CMS_CONTENT=true, ISR with the interval and `cms` tag of its fetches (architecture §9.4).
export const dynamic = 'force-static';

const escapeXml = (s: string) => s.replaceAll(/[&<>"']/g, c => `&#${c.codePointAt(0)};`);

export async function GET() {
  const pages: LocalePaths[] = [...(await Promise.all(PAGES.map(sitePagePaths))), ...PRODUCT_PATHS.map(path => ({ en: path, vi: path }))];
  const articles: LocalePaths[] = (await loadArticleIndex()).map(slugs =>
    Object.fromEntries(Object.entries(slugs).map(([lang, slug]) => [lang, `/blog/${slug}`])));
  const urls = [...pages, ...articles].flatMap(paths => {
    const links = Object.entries(alternateUrls(paths))
      .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}"/>`);
    const locs = [
      ...(LOCALES as Lang[]).flatMap(lang => (paths[lang] ? [absoluteUrl(paths[lang], lang)] : [])),
      ...scopedLocales(paths).map(lang => absoluteUrl(paths.en!, lang)),
    ];
    return locs.map(loc => `<url><loc>${escapeXml(loc)}</loc>${links.join('')}</url>`);
  });
  for (const { locale, path } of SCOPED_CONTENT_PAGES) {
    urls.push(`<url><loc>${escapeXml(absoluteUrl(path, locale as PageLang))}</loc></url>`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
