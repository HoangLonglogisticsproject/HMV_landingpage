import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cassavaChina } from '@/data/cassavaChina';
import { cassavaChinaGuides } from '@/data/cassavaChinaGuides';
import { cassavaKorea } from '@/data/cassavaKorea';
import { cassavaKoreaGuides } from '@/data/cassavaKoreaGuides';
import { RichText } from '@/features/articles/RichText';
import { toDoc } from '@/features/articles/bundled';
import { ScopedFooter, ScopedHeader } from '@/features/scoped-chrome/ScopedChrome';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { TradeDeskHost } from '@/features/trade-desk/TradeDeskHost';
import { cn } from '@/lib/utils';
import { CommercialSupport } from './CassavaProcurement';
import { PRODUCT } from './CassavaScoped';
import styles from './CassavaProcurement.module.css';

// A guide or market update about dried cassava chips in a page-scoped language, Next.js only: the Simplified Chinese ones
// (data/cassavaChinaGuides.js) and the Korean ones (data/cassavaKoreaGuides.js). The article layout of the site's EcoNews
// pages in the page-scoped chrome of that language's procurement page, which it links back to (header action, the link
// above the title, the body). The HMV Trade Desk opens in English with the entry's source. A market update shows its
// external data with each original source, then HMV's reading (对采购商意味着什么？). Only the Chinese page has the
// commercial support block. Server-rendered; the Trade Desk button and host are the client islands.
const SETS = {
  'zh-CN': { page: '/zh-cn/cassava-chips', guides: cassavaChinaGuides, content: cassavaChina },
  ko: { page: '/ko/tapioca-chips', guides: cassavaKoreaGuides, content: cassavaKorea },
};

const dateLabel = (iso, locale) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// A <time>, not a <span>: the article meta line styles its spans as the eyebrow.
function Dated({ copy, locale, label, iso }) {
  return (
    <time dateTime={iso}>
      {label}
      {copy.colon}
      {dateLabel(iso, locale)}
    </time>
  );
}

/** A market update's external data as its sources report it, then every original source with its date. */
function MarketData({ guide, copy, locale }) {
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
            <time dateTime={source.date}>{dateLabel(source.date, locale)}</time>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** HMV's reading of a market update's data, labelled as such. */
function BuyerReading({ guide, copy }) {
  return (
    <section id="buyers" aria-labelledby="buyers-title">
      <h2 id="buyers-title">{copy.market.buyers}</h2>
      <p className="article-note">{copy.market.buyersNote}</p>
      <RichText doc={toDoc(guide.buyers)} />
    </section>
  );
}

/** `slug`: the entry to render, among `guides` (default: the published ones of `locale`, 'zh-CN' or 'ko'). */
export function CassavaGuideView({ slug, locale = 'zh-CN', guides = SETS[locale].guides.items }) {
  const { page, content, guides: { copy } } = SETS[locale];
  const guide = guides[slug];
  const market = guide.kind === 'market';
  const sections = market ? ['market-data', 'buyers'] : ['guide'];
  // The procurement page, the other guides, then the links of the language's own (copy.links).
  const links = [
    [page, copy.page],
    ...Object.entries(guides).filter(([other]) => other !== slug).map(([other, entry]) => [`${page}/${other}`, entry.h1]),
    ...(copy.links ?? []),
  ];
  const nav = { label: copy.navLabel, items: [...sections, ...(content.support ? ['commercial-support'] : []), 'related'].map(id => [id, copy.nav[id]]) };
  return (
    <>
      <ScopedHeader nav={nav}>
        <a className="nav-support-btn" href={page}>
          <span>{copy.page}</span>
          <ArrowUpRight size={15} />
        </a>
      </ScopedHeader>
      <main id="main-content" className="article-page">
        <div className="article-col">
          <p className="pb-6">
            <a href={page} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
              <ArrowLeft size={15} aria-hidden="true" />
              {copy.page}
            </a>
          </p>
          <p className="article-meta">
            <span>{guide.eyebrow}</span>
            <Dated copy={copy} locale={locale} label={copy.published} iso={guide.published} />
            {guide.updated && <Dated copy={copy} locale={locale} label={copy.updated} iso={guide.updated} />}
          </p>
          <h1>{guide.h1}</h1>
          <p className="pt-4 text-[17px] leading-relaxed text-ink-muted">{guide.lead}</p>
        </div>
        <article className="article-col article-body pt-6">
          {market ? (
            <>
              <MarketData guide={guide} copy={copy} locale={locale} />
              <BuyerReading guide={guide} copy={copy} />
            </>
          ) : (
            <div id="guide">
              <RichText doc={toDoc(guide.body)} />
            </div>
          )}
          <aside className="article-cta glass" aria-label={copy.cta.title}>
            <p>{copy.cta.lead}</p>
            <TradeDeskButton size="lg" className="day-cta" product={PRODUCT} source={guide.source} title={content.tradeDesk}>
              {copy.cta.button}
              <ArrowUpRight size={18} />
            </TradeDeskButton>
            {/* Not a <p>: the article's call-to-action paragraph rule (bold, 17 px) is unlayered and would win. */}
            <small className="block w-full text-sm text-ink-muted">{copy.cta.note}</small>
          </aside>
        </article>
        {content.support && (
          <div className="article-col pt-10">
            <CommercialSupport support={content.support} className="" />
          </div>
        )}
        <nav id="related" aria-labelledby="related-title" className="article-col pt-10">
          <h2 id="related-title" className={cn(styles.heading, 'text-xl font-bold text-navy')}>{copy.related}</h2>
          <ul className="flex flex-col gap-2 pt-4">
            {links.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
                  {label}
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <ScopedFooter addressLabel={content.footer.address} />
      <TradeDeskHost lang="en" />
    </>
  );
}
