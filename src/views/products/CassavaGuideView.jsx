import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cassavaChina } from '@/data/cassavaChina';
import { cassavaChinaGuides } from '@/data/cassavaChinaGuides';
import { RichText } from '@/features/articles/RichText';
import { toDoc } from '@/features/articles/bundled';
import { ScopedFooter, ScopedHeader } from '@/features/scoped-chrome/ScopedChrome';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { TradeDeskHost } from '@/features/trade-desk/TradeDeskHost';
import { cn } from '@/lib/utils';
import { CommercialSupport } from './CassavaProcurement';
import { PRODUCT } from './CassavaScoped';
import styles from './CassavaProcurement.module.css';

// A Simplified Chinese guide or market update about dried cassava chips (data/cassavaChinaGuides.js), Next.js only: the
// article layout of the site's EcoNews pages in the page-scoped chrome of the Chinese procurement page, which it links
// back to (header action, the link above the title, the body). The HMV Trade Desk opens in English with the entry's
// source. A market update shows its external data with each original source, then HMV's reading (对采购商意味着什么？).
// Server-rendered; the Trade Desk button and host are the client islands.
const PAGE = '/zh-cn/cassava-chips';
const { copy } = cassavaChinaGuides;

const dateLabel = iso =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// A <time>, not a <span>: the article meta line styles its spans as the eyebrow.
function Dated({ label, iso }) {
  return (
    <time dateTime={iso}>
      {label}：{dateLabel(iso)}
    </time>
  );
}

/** A market update's external data as its sources report it, then every original source with its date. */
function MarketData({ guide }) {
  return (
    <section id="market-data" aria-labelledby="market-data-title">
      <h2 id="market-data-title">{copy.market.data}</h2>
      <p className="article-note">{copy.market.dataNote}</p>
      <RichText doc={toDoc(guide.data)} />
      <h3>{copy.market.sources}</h3>
      <ol>
        {guide.sources.map(source => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" title={copy.market.newWindow}>
              {source.publisher}：{source.title}
            </a>
            {' · '}
            <time dateTime={source.date}>{dateLabel(source.date)}</time>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** HMV's reading of a market update's data, labelled as such. */
function BuyerReading({ guide }) {
  return (
    <section id="buyers" aria-labelledby="buyers-title">
      <h2 id="buyers-title">{copy.market.buyers}</h2>
      <p className="article-note">{copy.market.buyersNote}</p>
      <RichText doc={toDoc(guide.buyers)} />
    </section>
  );
}

/** `slug`: the entry to render, among `guides` (default: the published ones). */
export function CassavaGuideView({ slug, guides = cassavaChinaGuides.items }) {
  const guide = guides[slug];
  const market = guide.kind === 'market';
  const sections = market ? ['market-data', 'buyers'] : ['guide'];
  const related = Object.entries(guides).filter(([other]) => other !== slug);
  const nav = { label: copy.navLabel, items: [...sections, 'commercial-support', 'related'].map(id => [id, copy.nav[id]]) };
  return (
    <>
      <ScopedHeader nav={nav}>
        <a className="nav-support-btn" href={PAGE}>
          <span>{copy.page}</span>
          <ArrowUpRight size={15} />
        </a>
      </ScopedHeader>
      <main id="main-content" className="article-page">
        <div className="article-col">
          <p className="pb-6">
            <a href={PAGE} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
              <ArrowLeft size={15} aria-hidden="true" />
              {copy.page}
            </a>
          </p>
          <p className="article-meta">
            <span>{guide.eyebrow}</span>
            <Dated label={copy.published} iso={guide.published} />
            {guide.updated && <Dated label={copy.updated} iso={guide.updated} />}
          </p>
          <h1>{guide.h1}</h1>
          <p className="pt-4 text-[17px] leading-relaxed text-ink-muted">{guide.lead}</p>
        </div>
        <article className="article-col article-body pt-6">
          {market ? (
            <>
              <MarketData guide={guide} />
              <BuyerReading guide={guide} />
            </>
          ) : (
            <div id="guide">
              <RichText doc={toDoc(guide.body)} />
            </div>
          )}
          <aside className="article-cta glass" aria-label={copy.cta.title}>
            <p>{copy.cta.lead}</p>
            <TradeDeskButton size="lg" className="day-cta" product={PRODUCT} source={guide.source} title={cassavaChina.tradeDesk}>
              {copy.cta.button}
              <ArrowUpRight size={18} />
            </TradeDeskButton>
            {/* Not a <p>: the article's call-to-action paragraph rule (bold, 17 px) is unlayered and would win. */}
            <small className="block w-full text-sm text-ink-muted">{copy.cta.note}</small>
          </aside>
        </article>
        <div className="article-col pt-10">
          <CommercialSupport support={cassavaChina.support} className="" />
        </div>
        <nav id="related" aria-labelledby="related-title" className="article-col pt-10">
          <h2 id="related-title" className={cn(styles.heading, 'text-xl font-bold text-navy')}>{copy.related}</h2>
          <ul className="flex flex-col gap-2 pt-4">
            <li>
              <a href={PAGE} className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
                {copy.page}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </li>
            {related.map(([other, entry]) => (
              <li key={other}>
                <a href={`${PAGE}/${other}`} className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
                  {entry.h1}
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <ScopedFooter addressLabel={cassavaChina.footer.address} />
      <TradeDeskHost lang="en" />
    </>
  );
}
