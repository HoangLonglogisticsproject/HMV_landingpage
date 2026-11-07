// Vite page adapter: resolves the article (bundled, or the CMS from the browser in CMS mode), keeps the site shell
// mounted through redirects, and owns what the locale-free SPA needs: the scroll reset and the in-place language switch.
import { useLayoutEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { SiteShell } from '@/components/layout/SiteShell';
import { PageMeta } from '@/components/common/PageMeta';
import { useArticle } from '@/features/articles/hooks';
import { useLanguage } from '@/i18n/LanguageContext';
import { articleJsonLd, articleMeta } from '../meta';
import { ArticleView } from './ArticleView';
import { articleCopy } from './copy';

export function ArticlePage() {
  const { lang, setLang } = useLanguage();
  const { slug } = useParams();
  const location = useLocation();
  // Reset before paint and again after layout settles (images/fonts), so the
  // browser's restored scroll position can never leave the title under the sticky header.
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    toTop();
    const raf = requestAnimationFrame(toTop);
    const timer = setTimeout(toTop, 120);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [location.pathname]);
  const s = useArticle(slug, lang);
  const a = s.article;
  return (
    <>
      <PageMeta lang={lang} {...articleMeta(lang, s)} />
      {/* Missing pages must not be indexed; a temporary error must not deindex a live one. */}
      {(s.status === 'not-found' || s.status === 'unavailable') && <Helmet><meta name="robots" content="noindex" /></Helmet>}
      {a && <Helmet><script type="application/ld+json">{articleJsonLd(lang, a)}</script></Helmet>}
      {/* The shell stays mounted through redirects so the navigation does not remount. */}
      <SiteShell lang={lang} className="article-page">
        {s.status === 'redirect' ? <Navigate to={s.to} replace /> : (
          <ArticleView
            lang={lang}
            state={s}
            readIn={s.status === 'unavailable' && <Button type="button" onClick={() => setLang(s.locale)}>{articleCopy[lang].readIn}</Button>}
          />
        )}
      </SiteShell>
    </>
  );
}
