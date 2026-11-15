import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { koreaTapiocaMarket as c } from '@/data/koreaTapiocaMarket';
import { ScopedFooter, ScopedHeader } from '@/features/scoped-chrome/ScopedChrome';
import { formatDate, signalFreshness } from './freshness';

// The Korean tapioca market page (data/koreaTapiocaMarket.js), Next.js only: what a Korean factory procurement team
// should watch when sourcing tapioca chips, then links to the supply page (/ko/tapioca-chips) for HMV's evidence.
// Server-rendered text and links, no client code: the calls to action are plain links (no Trade Desk on this page).
// Section ids are stable anchors for the header and for later analytics.

const SectionHeading = ({ eyebrow, title, text }) => (
  <div className="section-heading">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
    </div>
    {text && <p>{text}</p>}
  </div>
);

// Publisher · date, each linking to the original in a new tab.
function Sources({ ids }) {
  return (
    <ul className="market-sources" aria-label={c.monitor.labels.sources}>
      {ids.map(id => {
        const source = c.sources[id];
        return (
          <li key={id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" title={`${source.title} · ${c.methodology.newWindow}`}>
              {source.label} · {formatDate(source.publishedAt)}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// A market signal: its type and freshness as text, its status (text and tone), what the sources say and what it may
// mean for a buyer, kept apart.
function Signal({ signal }) {
  const freshness = signalFreshness(signal, c.sources, c.updatedAt);
  return (
    <article className="market-signal">
      <p className="market-tags">
        <span className={`market-tag market-tag--${signal.type}`}>{c.monitor.types[signal.type]}</span>
        {freshness === 'historical' && <span className="market-tag market-tag--freshness">{c.monitor.freshness.historical}</span>}
      </p>
      <h3>{signal.label}</h3>
      <p className={`market-status market-status--${signal.status}`}>
        <span className="sr-only">{c.monitor.labels.status}: </span>
        {c.monitor.statuses[signal.status]}
      </p>
      <div className="market-evidence">
        <p className="market-label">{c.monitor.labels.evidence}</p>
        <p>{signal.evidence}</p>
      </div>
      <div className="market-implication">
        <p className="market-label">{c.monitor.labels.implication}</p>
        <p>{signal.buyerImplication}</p>
      </div>
      <Sources ids={signal.sources} />
    </article>
  );
}

function CallToAction({ primary, secondary }) {
  return (
    <div className="money-actions">
      <Button asChild size="lg" className="day-cta">
        <a href={primary.href}>
          {primary.label}
          <ArrowRight size={18} />
        </a>
      </Button>
      <a className="text-link" href={secondary.href}>
        {secondary.label}
        <ArrowRight size={16} />
      </a>
    </div>
  );
}

export function TapiocaMarketView() {
  const { hero } = c;
  return (
    <>
      <ScopedHeader nav={c.nav}>
        <a className="nav-support-btn" href={c.nav.action.href}>
          <span>{c.nav.action.label}</span>
          <ArrowUpRight size={15} />
        </a>
      </ScopedHeader>
      <main id="main-content">
        <section className="market-hero" aria-labelledby="market-title">
          <div className="content-width">
            <p className="money-eyebrow">{hero.eyebrow}</p>
            <h1 id="market-title">{hero.h1}</h1>
            <p className="money-lead">{hero.lead}</p>
            <p className="market-updated">
              {hero.updated}: <time dateTime={c.updatedAt}>{formatDate(c.updatedAt)}</time>
            </p>
            <p className="market-disclaimer">{hero.disclaimer}</p>
            <CallToAction primary={hero.primary} secondary={hero.secondary} />
          </div>
        </section>

        <section className="section-pad" id="market-monitor">
          <div className="content-width">
            <SectionHeading {...c.monitor} />
            <div className="market-signals">
              {c.signals.map(signal => <Signal key={signal.id} signal={signal} />)}
            </div>
          </div>
        </section>

        <section className="section-pad landing-alt" id="procurement-brief">
          <div className="content-width">
            <SectionHeading eyebrow={c.brief.eyebrow} title={c.brief.title} text={c.brief.intro} />
            <ol className="market-brief">
              {c.brief.points.map((point, i) => (
                <li key={point}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <p>{point}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section-pad" id="market-drivers">
          <div className="content-width">
            <SectionHeading eyebrow={c.drivers.eyebrow} title={c.drivers.title} />
            <div className="business-grid landing-grid market-drivers">
              {c.drivers.items.map(item => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  {item.sources.length > 0 && <Sources ids={item.sources} />}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad landing-alt" id="manufacturer-checklist">
          <div className="content-width">
            <SectionHeading title={c.checklist.title} />
            <ul className="landing-checks market-checklist">
              {c.checklist.items.map(item => (
                <li key={item}>
                  <Check size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-pad" id="supply-evidence-links">
          <div className="content-width">
            <SectionHeading eyebrow={c.evidence.eyebrow} title={c.evidence.title} />
            <div className="business-grid landing-grid market-evidence-links">
              {c.evidence.items.map(item => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <a className="text-link" href={item.link.href}>
                    {item.link.label}
                    <ArrowRight size={16} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad landing-alt" id="source-methodology">
          <div className="content-width">
            <SectionHeading eyebrow={c.methodology.eyebrow} title={c.methodology.title} />
            <ul className="market-method">
              {c.methodology.points.map(point => <li key={point}>{point}</li>)}
            </ul>
            <h3 className="market-source-title">{c.methodology.sourcesTitle}</h3>
            <ul className="market-source-list">
              {Object.values(c.sources).map(source => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.label} · {formatDate(source.publishedAt)}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <span>{source.title}</span>
                  {/* The tier stays internal: next to a company filing, "A등급" reads like a credit or official rating. */}
                  <span className="market-source-meta">{c.methodology.sourceTypes[source.sourceType]}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-pad market-cta" aria-labelledby="market-cta-title">
          <div className="content-width">
            <h2 id="market-cta-title">{c.cta.title}</h2>
            <p>{c.cta.text}</p>
            <CallToAction primary={c.cta.primary} secondary={c.cta.secondary} />
          </div>
        </section>
      </main>
      <ScopedFooter addressLabel={c.footer.address} />
    </>
  );
}
