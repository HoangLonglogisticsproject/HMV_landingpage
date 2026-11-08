import { LOCALES, PAGES, PRODUCT_SLUG_VI } from '@/i18n/routes';
import { loadArticleIndex } from '@/next/content';
import { absoluteUrl, alternateUrls, type Lang, type LocalePaths } from '@/next/seo';

// The sitemap, written here rather than with Next.js's sitemap convention, which rewrites the root URL as `B/`: every
// <loc> and alternate comes from absoluteUrl(), the formatter of the canonical, hreflang and og:url. One entry per URL
// and language, with the page's hreflang set as alternates. Articles come from the content loader, so a takedown
// removes them here too. Prerendered at build (a GET handler is not cached by default): static in bundled mode; with
// CMS_CONTENT=true, ISR with the interval and `cms` tag of its fetches (architecture §9.4).
export const dynamic = 'force-static';

const escapeXml = (s: string) => s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

export async function GET() {
  const keys = [...PAGES, ...Object.keys(PRODUCT_SLUG_VI).map(id => `/products/${id}`)];
  const pages: LocalePaths[] = keys.map(path => ({ en: path, vi: path }));
  const articles: LocalePaths[] = (await loadArticleIndex()).map(slugs =>
    Object.fromEntries(Object.entries(slugs).map(([lang, slug]) => [lang, `/blog/${slug}`])));
  const urls = [...pages, ...articles].flatMap(paths => {
    const links = Object.entries(alternateUrls(paths))
      .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}"/>`);
    return (LOCALES as Lang[]).flatMap(lang => {
      const path = paths[lang];
      return path ? [`<url><loc>${escapeXml(absoluteUrl(path, lang))}</loc>${links.join('')}</url>`] : [];
    });
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
