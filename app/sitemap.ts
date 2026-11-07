import type { MetadataRoute } from 'next';
import { LOCALES, PAGES, PRODUCT_SLUG_VI } from '@/i18n/routes';
import { loadArticleIndex } from '@/next/content';
import { absoluteUrl, alternateUrls, type Lang, type LocalePaths } from '@/next/seo';

// One entry per URL and language, with the same alternates as the page's hreflang (pageMetadata), from the same
// route contract. Articles come from the content loader, so a takedown removes them here too.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const keys = [...PAGES, ...Object.keys(PRODUCT_SLUG_VI).map(id => `/products/${id}`)];
  const pages: LocalePaths[] = keys.map(path => ({ en: path, vi: path }));
  const articles: LocalePaths[] = (await loadArticleIndex()).map(slugs =>
    Object.fromEntries(Object.entries(slugs).map(([lang, slug]) => [lang, `/blog/${slug}`])));
  return [...pages, ...articles].flatMap(paths => {
    const languages = alternateUrls(paths);
    return (LOCALES as Lang[]).flatMap(lang => {
      const path = paths[lang];
      return path ? [{ url: absoluteUrl(path, lang), alternates: { languages } }] : [];
    });
  });
}
