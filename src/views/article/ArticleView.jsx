import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichText } from '@/features/articles/RichText';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { Link } from '@/lib/navigation';
import { BackButton } from './BackButton';
import { articleCopy } from './copy';
import Image from '@/lib/image';

// Article page content inside the site shell, shared by both builds. `state` is an article resolution
// (loading | ready | not-found | unavailable | error); `readIn` is the adapter's action to the other language.
/** @param {{ lang: 'en' | 'vi', state: { status: string, article?: object, locale?: string }, readIn?: import('react').ReactNode }} props */
export function ArticleView({ lang, state, readIn }) {
  const a = state.article;
  const t = articleCopy[lang];
  const message = t.status[state.status];
  let heading = <p className="article-note"><output>{t.loading}</output></p>;
  if (a) {
    heading = (
      <>
        <p className="article-meta"><span>{a.category}</span><time dateTime={a.date.iso}>{a.date.label}</time></p>
        <h1>{a.title}</h1>
      </>
    );
  } else if (message) {
    heading = (
      <>
        <h1>{message[0]}</h1>
        <p className="article-note">{message[1]}</p>
        <div className="article-status-actions">
          {readIn}
          <Button asChild variant="outline"><Link to="/insights">{t.all}</Link></Button>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="article-col">
        <BackButton><ArrowLeft size={16} />{t.back}</BackButton>
        {heading}
      </div>
      {a && (
        <>
          {a.image && <figure className="article-hero"><Image src={a.image.src} alt={a.image.alt} width={a.image.width} height={a.image.height} sizes="(max-width: 1120px) calc(100vw - 40px), 1080px" loading="eager" fetchPriority="high" decoding="async" style={a.image.position ? { objectPosition: a.image.position } : undefined} /></figure>}
          <article className="article-col article-body">
            <RichText doc={a.content} />
            <aside className="article-cta glass">
              {/* Bundled articles about a product link their question to its page; CMS articles have no product. */}
              {a.cta && <p>{a.product ? <Link to={`/products/${a.product}`}>{a.cta}</Link> : a.cta}</p>}
              {/* An article with a Trade Desk source opens the desk with its product; others keep the quotation form. */}
              {a.tradeDesk ? (
                <TradeDeskButton size="lg" className="day-cta" product={a.product} source={a.tradeDesk}>{t.tradeDesk}<ArrowUpRight size={18} /></TradeDeskButton>
              ) : (
                <Button asChild size="lg" className="day-cta"><Link to="/#initiate-trade">{t.quote}<ArrowUpRight size={18} /></Link></Button>
              )}
            </aside>
          </article>
        </>
      )}
    </>
  );
}
