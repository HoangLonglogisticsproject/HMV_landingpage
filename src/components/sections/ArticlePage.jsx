import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/sections/Navigation';
import { Footer } from '@/components/sections/Footer';
import { PageMeta } from '@/components/common/PageMeta';
import { photos } from '@/data/hmv';
import { articles } from '@/data/articles';

export function ArticlePage() {
  const { lang, slug } = useParams();
  const nav = useNavigate();
  if (!['en', 'vi'].includes(lang)) return <Navigate to="/en" replace />;
  const a = articles[slug];
  if (!a) return <Navigate to={`/${lang}/insights`} replace />;
  const vi = lang === 'vi';
  const back = () => (window.history.length > 1 ? nav(-1) : nav(`/${lang}`));
  return (
    <>
      <PageMeta lang={lang} title={a.title} description={a.description} />
      <Helmet><script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, datePublished: a.iso, inLanguage: 'vi', image: photos.farm, author: { '@type': 'Organization', name: 'HMV Global Co., LTD' }, publisher: { '@type': 'Organization', name: 'HMV Global Co., LTD' } })}</script></Helmet>
      <Navigation lang={lang} />
      <main id="main-content" className="article-page">
        <div className="article-col">
          <Button type="button" variant="ghost" className="article-back" onClick={back}><ArrowLeft size={16} />{vi ? 'Quay lại' : 'Back'}</Button>
          <p className="article-meta"><span>{a.category}</span><time dateTime={a.iso}>{a.date}</time></p>
          <h1 lang="vi">{a.title}</h1>
          {!vi && <p className="article-note">This article is currently available in Vietnamese.</p>}
        </div>
        <figure className="article-hero"><img src={photos.farm} alt="Vườn chanh dây tại Việt Nam" width={1280} height={960} fetchPriority="high" decoding="async" /></figure>
        <article className="article-col article-body" lang="vi">
          {a.body.map(([tag, c], i) => tag === 'h2' ? <h2 key={i}>{c}</h2> : tag === 'ul' ? <ul key={i}>{c.map(([b, t]) => <li key={b}><strong>{b}</strong> {t}</li>)}</ul> : <p key={i}>{c}</p>)}
          <aside className="article-cta glass">
            <p>{vi ? 'Bạn đang tìm nguồn chanh dây cho thị trường EU?' : 'Sourcing passion fruit for the EU market?'}</p>
            <Button asChild size="lg" className="day-cta"><Link to={`/${lang}#initiate-trade`}>{vi ? 'Gửi yêu cầu báo giá' : 'Request a quotation'}<ArrowUpRight size={18} /></Link></Button>
          </aside>
        </article>
      </main>
      <Footer lang={lang} />
    </>
  );
}
