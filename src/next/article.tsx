// The article page of both locales (app/(en)/blog/[slug], app/(vi)/vi/tin-tuc/[slug]): resolution, metadata and the
// server-rendered page with its structured data. Next.js only.
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SiteShell } from '@/components/layout/SiteShell';
import { localizePath } from '@/i18n/routes';
import { loadArticle, loadArticleIndex } from '@/next/content';
import { pageMetadata, type Lang, type LocalePaths } from '@/next/seo';
import { ArticleView } from '@/views/article/ArticleView';
import { articleCopy } from '@/views/article/copy';
import { articleJsonLd, articleMeta } from '@/views/meta';

/** Every known slug of both languages; the other language's slug answers with a 308 to this language's URL. */
export const articleSlugs = async () => (await loadArticleIndex()).flatMap(slugs => Object.values(slugs).map(slug => ({ slug })));

// The route's own outcomes: 404, or a 308 to this language's slug. What remains is rendered (ready, unavailable).
async function stateAt(lang: Lang, slug: string) {
  const state = await loadArticle(lang, slug);
  if (state.status === 'not-found') notFound();
  if (state.status === 'redirect') permanentRedirect(localizePath(state.to, lang));
  return state;
}

const keyPaths = (slugs: LocalePaths): LocalePaths =>
  Object.fromEntries(Object.entries(slugs).map(([lang, slug]) => [lang, `/blog/${slug}`]));

// Never throws: the page owns the 404 and the redirects.
export async function articleMetadata(lang: Lang, slug: string): Promise<Metadata> {
  const state = await loadArticle(lang, slug);
  const path = `/blog/${slug}`;
  if (state.status === 'ready') return pageMetadata({ lang, path, languages: keyPaths(state.article.alternates), ...articleMeta(lang, state) });
  if (state.status === 'unavailable') return pageMetadata({ lang, path, noindex: true, ...articleMeta(lang, state) });
  return {};
}

// Outside the (site) layout: the article page frames its own site shell, as on the Vite site.
export async function ArticlePage({ lang, slug }: { lang: Lang; slug: string }) {
  const state = await stateAt(lang, slug);
  return (
    <>
      {state.status === 'ready' && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd(lang, state.article) }} />
      )}
      <SiteShell lang={lang} className="article-page">
        <ArticleView
          lang={lang}
          state={state}
          readIn={
            state.status === 'unavailable' && (
              <Button asChild>
                <a href={localizePath(`/blog/${slug}`, state.locale)} hrefLang={state.locale}>
                  {articleCopy[lang].readIn}
                </a>
              </Button>
            )
          }
        />
      </SiteShell>
    </>
  );
}
