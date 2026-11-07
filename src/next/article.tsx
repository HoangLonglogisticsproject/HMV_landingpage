// The article page of both locales (app/(en)/blog/[slug], app/(vi)/vi/tin-tuc/[slug]): resolution, metadata and the
// server-rendered page with its structured data. Next.js only.
import { notFound, permanentRedirect } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { articles } from '@/data/articles';
import { bundledArticle } from '@/features/articles/bundled';
import { localizePath } from '@/i18n/routes';
import { pageMetadata, type Lang } from '@/next/seo';
import { ArticleView } from '@/views/article/ArticleView';
import { articleJsonLd, articleMeta } from '@/views/meta';

/** Both languages' slugs: the other language's slug answers with a 308 to this language's URL (articleAt). */
export const articleSlugs = () => articles.flatMap(a => [{ slug: a.slug.en }, { slug: a.slug.vi }]);

// ponytail: bundled articles only; the CMS PR adds the CMS lookup (slugs and alternates) here.
function articleAt(lang: Lang, slug: string) {
  const article = bundledArticle(slug, lang);
  if (!article) notFound();
  const url = localizePath(`/blog/${slug}`, lang);
  if (!url.endsWith(`/${slug}`)) permanentRedirect(url);
  return { status: 'ready', article };
}

export const articleMetadata = (lang: Lang, slug: string) =>
  pageMetadata({ lang, path: `/blog/${slug}`, ...articleMeta(lang, articleAt(lang, slug)) });

// Outside the (site) layout: the article page frames its own site shell, as on the Vite site.
export function ArticlePage({ lang, slug }: { lang: Lang; slug: string }) {
  const state = articleAt(lang, slug);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd(lang, state.article) }} />
      <SiteShell lang={lang} className="article-page">
        <ArticleView lang={lang} state={state} />
      </SiteShell>
    </>
  );
}
