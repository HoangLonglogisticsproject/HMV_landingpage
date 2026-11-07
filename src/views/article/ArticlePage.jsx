import { useLayoutEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteShell } from '@/components/layout/SiteShell';
import { PageMeta } from '@/components/common/PageMeta';
import { useArticle } from '@/features/articles/hooks';
import { RichText } from '@/features/articles/RichText';
import { useLanguage } from '@/i18n/LanguageContext';

const copy = {
  en: { back: 'Back', quote: 'Request a quotation', all: 'All EcoNews articles', loading: 'Loading article…', readIn: 'Read in Vietnamese', status: { 'not-found': ['Article not found', 'This EcoNews article does not exist or is no longer published.'], unavailable: ['This article is not available in English', 'It has only been published in Vietnamese.'], error: ['This article could not be loaded', 'Please try again later.'] } },
  vi: { back: 'Quay lại', quote: 'Gửi yêu cầu báo giá', all: 'Xem tất cả EcoNews', loading: 'Đang tải bài viết…', readIn: 'Đọc bản tiếng Anh', status: { 'not-found': ['Không tìm thấy bài viết', 'Bài viết EcoNews này không tồn tại hoặc không còn được xuất bản.'], unavailable: ['Bài viết này chưa có bản tiếng Việt', 'Bài viết hiện chỉ được xuất bản bằng tiếng Anh.'], error: ['Không thể tải bài viết', 'Vui lòng thử lại sau.'] } },
};
const org = { '@type': 'Organization', name: 'HMV Global Co., LTD' };

export function ArticlePage() {
  const { lang, setLang } = useLanguage();
  const { slug } = useParams();
  const nav = useNavigate();
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
  const t = copy[lang];
  const message = t.status[s.status];
  const back = () => (window.history.length > 1 ? nav(-1) : nav('/'));
  return (
    <>
      <PageMeta lang={lang} title={a?.metaTitle ?? (message?.[0] || 'EcoNews')} description={a?.description ?? ''} />
      {/* Missing pages must not be indexed; a temporary error must not deindex a live one. */}
      {(s.status === 'not-found' || s.status === 'unavailable') && <Helmet><meta name="robots" content="noindex" /></Helmet>}
      {a && <Helmet><script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, datePublished: a.date.iso, inLanguage: lang, image: a.image?.src, author: org, publisher: org }).replace(/</g, '\\u003c')}</script></Helmet>}
      {/* The shell stays mounted through redirects so the navigation does not remount. */}
      <SiteShell lang={lang} className="article-page">
        {s.status === 'redirect' ? <Navigate to={s.to} replace /> : (
          <>
            <div className="article-col">
              <Button type="button" variant="ghost" className="article-back" onClick={back}><ArrowLeft size={16} />{t.back}</Button>
              {a ? (
                <>
                  <p className="article-meta"><span>{a.category}</span><time dateTime={a.date.iso}>{a.date.label}</time></p>
                  <h1>{a.title}</h1>
                </>
              ) : message ? (
                <>
                  <h1>{message[0]}</h1>
                  <p className="article-note">{message[1]}</p>
                  <div className="article-status-actions">
                    {s.status === 'unavailable' && <Button type="button" onClick={() => setLang(s.locale)}>{t.readIn}</Button>}
                    <Button asChild variant="outline"><Link to="/insights">{t.all}</Link></Button>
                  </div>
                </>
              ) : (
                <p className="article-note" role="status">{t.loading}</p>
              )}
            </div>
            {a && (
              <>
                {a.image && <figure className="article-hero"><img src={a.image.src} alt={a.image.alt} fetchPriority="high" decoding="async" style={a.image.position ? { objectPosition: a.image.position } : undefined} /></figure>}
                <article className="article-col article-body">
                  <RichText doc={a.content} />
                  <aside className="article-cta glass">
                    {a.cta && <p>{a.cta}</p>}
                    <Button asChild size="lg" className="day-cta"><Link to="/#initiate-trade">{t.quote}<ArrowUpRight size={18} /></Link></Button>
                  </aside>
                </article>
              </>
            )}
          </>
        )}
      </SiteShell>
    </>
  );
}
