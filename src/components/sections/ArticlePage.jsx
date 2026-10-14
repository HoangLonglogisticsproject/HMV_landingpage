import { useLayoutEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/sections/Navigation';
import { Footer } from '@/components/sections/Footer';
import { PageMeta } from '@/components/common/PageMeta';
import { photos } from '@/data/hmv';
import { findArticle } from '@/data/articles';
import { SupportChatWidget } from '@/components/common/SupportChatWidget';

export function ArticlePage() {
  const { lang, slug } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  // Reset before paint and again after layout settles (images/fonts), so the
  // browser's restored scroll position can never leave the title under the sticky header.
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    if (location.state?.isLocaleSwitch && typeof location.state?.scrollY === 'number') {
      const targetY = location.state.scrollY;
      window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
      });
      return;
    }
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    toTop();
    const raf = requestAnimationFrame(toTop);
    const timer = setTimeout(toTop, 120);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [location.pathname, location.state]);
  if (!['en', 'vi'].includes(lang)) return <Navigate to="/en" replace />;
  const a = findArticle(slug);
  if (!a) return <Navigate to={`/${lang}/insights`} replace />;
  if (a.slug[lang] !== slug) return <Navigate to={`/${lang}/blog/${a.slug[lang]}`} replace />;
  const vi = lang === 'vi';
  const img = photos[a.image];
  const back = () => (window.history.length > 1 ? nav(-1) : nav(`/${lang}`));
  return (
    <>
      <PageMeta lang={lang} title={a.title[lang]} description={a.description[lang]} />
      <Helmet><script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: a.title[lang], datePublished: a.iso, inLanguage: lang, image: img, author: { '@type': 'Organization', name: 'HMV Global Co., LTD' }, publisher: { '@type': 'Organization', name: 'HMV Global Co., LTD' } })}</script></Helmet>
      <Navigation lang={lang} />
      <main id="main-content" className="article-page">
        <div className="article-col">
          <Button type="button" variant="ghost" className="article-back" onClick={back}><ArrowLeft size={16} />{vi ? 'Quay lại' : 'Back'}</Button>
          <p className="article-meta"><span>{a.category[lang]}</span><time dateTime={a.iso}>{a.date[lang]}</time></p>
          <h1>{a.title[lang]}</h1>
        </div>
        <figure className="article-hero"><img src={img} alt={a.alt[lang]} fetchPriority="high" decoding="async" style={a.imagePosition ? { objectPosition: a.imagePosition } : undefined} /></figure>
        <article className="article-col article-body">
          {a.body[lang].map(([tag, c], i) => tag === 'h2' ? <h2 key={i}>{c}</h2> : tag === 'ul' ? <ul key={i}>{c.map(([b, t]) => <li key={b}><strong>{b}</strong> {t}</li>)}</ul> : <p key={i}>{c}</p>)}
          <aside className="article-cta glass">
            <p>{a.cta[lang]}</p>
            <Button asChild size="lg" className="day-cta"><Link to={`/${lang}#initiate-trade`}>{vi ? 'Gửi yêu cầu báo giá' : 'Request a quotation'}<ArrowUpRight size={18} /></Link></Button>
          </aside>
        </article>
      </main>
      <Footer lang={lang} />
      <SupportChatWidget lang={lang} />
    </>
  );
}
