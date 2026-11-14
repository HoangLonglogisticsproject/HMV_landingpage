import { ArrowDown, ArrowUpRight, Check, ClipboardList, MapPin } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { address } from '@/data/hmv';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { TradeDeskHost } from '@/features/trade-desk/TradeDeskHost';
import { localizePath } from '@/i18n/routes';
import { Cards, Heading } from './ProductLanding';

// The dried cassava chips page in a page-scoped locale (i18n/routes.js PAGE_LOCALES), Next.js only: the chrome and the
// sections of CassavaChinaView (zh-CN) and CassavaKoreaView (ko), which order them. `c` is the page copy
// (data/cassavaChina.js, data/cassavaKorea.js); `source` prefixes the analytics source of its calls to action.
// Its own chrome instead of SiteShell: the site navigation and footer link to pages that exist in English and
// Vietnamese only, so the header links to sections of this page and to this page in its other languages. The HMV
// Trade Desk opens in English (it has no Chinese or Korean copy; each page says so next to its calls to action).
const PRODUCT = 'dried-cassava-chips';
const LANGUAGES = [['en', 'English'], ['vi', 'Tiếng Việt'], ['zh-CN', '简体中文'], ['ko', '한국어']];

function Header({ c, locale, source }) {
  return (
    <header className="site-nav scoped-nav">
      <div className="nav-inner">
        <div className="nav-left">
          <a href="/" hrefLang="en" className="wordmark" aria-label="HMV Global">
            <BrandLogo />
          </a>
        </div>
        <nav className="nav-center" aria-label={c.nav.label}>
          {c.nav.items.map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
        </nav>
        <div className="nav-right">
          <ul className="scoped-langs" aria-label={c.nav.languages}>
            {LANGUAGES.map(([lang, label]) => (
              <li key={lang}>
                <a href={localizePath(`/products/${PRODUCT}`, lang)} hrefLang={lang} lang={lang} aria-current={lang === locale ? 'page' : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          {/* The wrapper sizes and hides the button: the shared .nav-support-btn rules are !important. */}
          <div className="scoped-nav-desk">
            <TradeDeskButton variant="brand" className="nav-support-btn" product={PRODUCT} source={`${source}_nav`} title={c.tradeDesk}>
              <ClipboardList size={15} />
              <span>HMV Trade Desk</span>
            </TradeDeskButton>
          </div>
        </div>
      </div>
    </header>
  );
}

/** The page in `locale`: its header, the sections (children), its footer and the HMV Trade Desk (English). */
export function ScopedPage({ c, locale, source, children }) {
  return (
    <>
      <Header c={c} locale={locale} source={source} />
      <main id="main-content">{children}</main>
      <footer className="site-footer premium-footer scoped-footer">
        <div className="content-width">
          <p className="pf-row">
            <MapPin size={16} />
            {c.footer.address} · {address}
          </p>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} HMV Global</span>
          </div>
        </div>
      </footer>
      <TradeDeskHost lang="en" />
    </>
  );
}

/** The hero: copy and calls to action, the page's evidence panel (children) beside them, the trust points below. */
export function ScopedHero({ c, source, children }) {
  const { hero } = c;
  return (
    <section className="money-hero" id="overview" aria-labelledby="scoped-title">
      <div className="content-width money-hero-grid">
        <div className="money-hero-copy">
          <p className="money-eyebrow">{hero.eyebrow}</p>
          <h1 id="scoped-title">{hero.h1}</h1>
          <p className="money-lead">{hero.lead}</p>
          {hero.support && <p className="scoped-support">{hero.support}</p>}
          <div className="money-actions">
            <TradeDeskButton size="lg" className="day-cta" product={PRODUCT} source={`${source}_hero`} title={c.tradeDesk}>
              {hero.cta}
              <ArrowUpRight size={18} />
            </TradeDeskButton>
            <a className="text-link" href="#quality">
              {hero.secondary}
              <ArrowDown size={16} />
            </a>
          </div>
        </div>
        <div className="money-hero-media">{children}</div>
        <ul className="money-trust">
          {hero.trust.map(item => (
            <li key={item}>
              <Check size={16} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const pad = alt => (alt ? 'section-pad landing-alt' : 'section-pad');

/** A heading and its cards: the applications, or the manufacturer use cases. */
export function ScopedCards({ content, id, alt = false }) {
  return (
    <section className={pad(alt)} id={id}>
      <div className="content-width">
        <Heading eyebrow={content.eyebrow} title={content.title} />
        <Cards items={content.items} />
      </div>
    </section>
  );
}

/** Why buyers work with HMV, then the regional supply network (below the buyer value, never in the hero). */
export function ScopedCapability({ c, children }) {
  return (
    <section className="section-pad" id="capability">
      <div className="content-width">
        <Heading eyebrow={c.audience.eyebrow} title={c.audience.title} />
        <Cards items={c.audience.items} />
        <aside className="scoped-network" aria-labelledby="scoped-network-title">
          <h3 id="scoped-network-title">{c.network.title}</h3>
          <p>{c.network.text}</p>
        </aside>
        {children}
      </div>
    </section>
  );
}

/** The Intertek sample results, with the disclaimer as the heading's text and the report as the source. */
export function ScopedQuality({ quality }) {
  return (
    <section className="section-pad landing-alt" id="quality">
      <div className="content-width">
        <Heading eyebrow={quality.eyebrow} title={quality.title} text={quality.note} />
        <div className="landing-table-wrap">
          <table className="landing-table">
            <thead>
              <tr>
                {quality.head.map(h => <th key={h} scope="col">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {quality.rows.map(([name, value]) => (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="commercial-note">{quality.source}</p>
      </div>
    </section>
  );
}

export function ScopedWorkflow({ workflow, alt = true }) {
  return (
    <section className={pad(alt)} id="workflow">
      <div className="content-width">
        <Heading eyebrow={workflow.eyebrow} title={workflow.title} />
        <ol className="landing-steps">
          {workflow.steps.map((s, i) => (
            <li key={s.title}>
              <span>0{i + 1}</span>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** The RFQ: what to prepare, and the HMV Trade Desk (English, as the note says). */
export function ScopedRfq({ c, source }) {
  return (
    <section className="rfq-section" id="rfq" aria-labelledby="scoped-rfq-title">
      <div className="content-width rfq-grid">
        <div className="rfq-info">
          <p className="eyebrow">{c.rfq.eyebrow}</p>
          {/* Phrases: the heading breaks between them, never inside a word. */}
          <h2 id="scoped-rfq-title">
            {c.rfq.title.map(phrase => <span key={phrase} className="scoped-phrase">{phrase}</span>)}
          </h2>
          <p className="rfq-lead">{c.rfq.lead}</p>
        </div>
        <div className="rfq-form glass scoped-rfq-card">
          <p className="scoped-rfq-prepare">{c.rfq.prepare}</p>
          <ul className="landing-checks">
            {c.rfq.items.map(item => (
              <li key={item}>
                <Check size={18} />
                {item}
              </li>
            ))}
          </ul>
          <TradeDeskButton size="lg" className="day-cta" product={PRODUCT} source={`${source}_rfq`} title={c.tradeDesk}>
            {c.rfq.cta}
            <ArrowUpRight size={18} />
          </TradeDeskButton>
          <p className="commercial-note">{c.rfq.note}</p>
        </div>
      </div>
    </section>
  );
}

/** A static teaser: the market intelligence page does not exist yet, so nothing links to it. */
export function ScopedMarket({ market }) {
  return (
    <section className="section-pad scoped-market" aria-labelledby="scoped-market-title">
      <div className="content-width">
        <p className="eyebrow">{market.eyebrow}</p>
        <h2 id="scoped-market-title">{market.title}</h2>
        <p>{market.text}</p>
      </div>
    </section>
  );
}
