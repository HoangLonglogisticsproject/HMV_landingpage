import { ArrowDown, ArrowUpRight, Check, ClipboardList, MapPin } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { address } from '@/data/hmv';
import { cassavaChina as c } from '@/data/cassavaChina';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { TradeDeskHost } from '@/features/trade-desk/TradeDeskHost';
import { localizePath } from '@/i18n/routes';
import { Cards, Heading, Photo } from './ProductLanding';
import { EvidencePanel } from './ProductMoneyHero';

// The Simplified Chinese dried cassava chips page (data/cassavaChina.js), Next.js only. Its own chrome instead of
// SiteShell: the site navigation and footer link to pages that have no Chinese version, so this header links only to
// sections of this page and to the page's own EN/VI/ZH versions. The HMV Trade Desk opens in English (its copy has
// no Chinese yet; the page says so next to each call to action).
const PRODUCT = 'dried-cassava-chips';
const LANGUAGES = [['en', 'English'], ['vi', 'Tiếng Việt'], ['zh-CN', '简体中文']];

function Header() {
  return (
    <header className="site-nav zh-nav">
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
          <ul className="zh-langs" aria-label={c.nav.languages}>
            {LANGUAGES.map(([lang, label]) => (
              <li key={lang}>
                <a href={localizePath(`/products/${PRODUCT}`, lang)} hrefLang={lang} lang={lang} aria-current={lang === 'zh-CN' ? 'page' : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <TradeDeskButton variant="brand" className="nav-support-btn" product={PRODUCT} source="zh_nav" title={c.tradeDesk}>
            <ClipboardList size={15} />
            <span>HMV Trade Desk</span>
          </TradeDeskButton>
        </div>
      </div>
    </header>
  );
}

export function CassavaChinaView() {
  const { hero } = c;
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="money-hero" id="overview" aria-labelledby="zh-title">
          <div className="content-width money-hero-grid">
            <div className="money-hero-copy">
              <p className="money-eyebrow">{hero.eyebrow}</p>
              <h1 id="zh-title">{hero.h1}</h1>
              <p className="money-lead">{hero.lead}</p>
              <div className="money-actions">
                <TradeDeskButton size="lg" className="day-cta" product={PRODUCT} source="zh_hero" title={c.tradeDesk}>
                  {hero.cta}
                  <ArrowUpRight size={18} />
                </TradeDeskButton>
                <a className="text-link" href="#quality">
                  {hero.secondary}
                  <ArrowDown size={16} />
                </a>
              </div>
            </div>
            <div className="money-hero-media">
              <EvidencePanel figures={c.figures} intertek={c.intertek} />
            </div>
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

        <section className="section-pad" id="capability">
          <div className="content-width">
            <Heading eyebrow={c.audience.eyebrow} title={c.audience.title} />
            <Cards items={c.audience.items} />
            <aside className="zh-network" aria-labelledby="zh-network-title">
              <h3 id="zh-network-title">{c.network.title}</h3>
              <p>{c.network.text}</p>
            </aside>
          </div>
        </section>

        <section className="section-pad landing-alt" id="quality">
          <div className="content-width">
            <Heading eyebrow={c.quality.eyebrow} title={c.quality.title} text={c.quality.note} />
            <div className="zh-quality">
              <div>
                <div className="landing-table-wrap">
                  <table className="landing-table">
                    <thead>
                      <tr>
                        {c.quality.head.map(h => <th key={h} scope="col">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {c.quality.rows.map(([name, value]) => (
                        <tr key={name}>
                          <th scope="row">{name}</th>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="commercial-note">{c.quality.source}</p>
              </div>
              <div>
                <Photo photo={c.quality.photo} lang="zh" sizes="(max-width: 900px) calc(100vw - 40px), 400px" />
                <p className="commercial-note">{c.quality.photoNote}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="content-width">
            <Heading eyebrow={c.applications.eyebrow} title={c.applications.title} />
            <Cards items={c.applications.items} />
          </div>
        </section>

        <section className="section-pad landing-alt" id="workflow">
          <div className="content-width">
            <Heading eyebrow={c.workflow.eyebrow} title={c.workflow.title} />
            <ol className="landing-steps">
              {c.workflow.steps.map((s, i) => (
                <li key={s.title}>
                  <span>0{i + 1}</span>
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rfq-section" id="rfq" aria-labelledby="zh-rfq-title">
          <div className="content-width rfq-grid">
            <div className="rfq-info">
              <p className="eyebrow">{c.rfq.eyebrow}</p>
              <h2 id="zh-rfq-title">
                {c.rfq.title.map(phrase => <span key={phrase} className="zh-phrase">{phrase}</span>)}
              </h2>
              <p className="rfq-lead">{c.rfq.lead}</p>
            </div>
            <div className="rfq-form glass zh-rfq-card">
              <p className="zh-rfq-prepare">{c.rfq.prepare}</p>
              <ul className="landing-checks">
                {c.rfq.items.map(item => (
                  <li key={item}>
                    <Check size={18} />
                    {item}
                  </li>
                ))}
              </ul>
              <TradeDeskButton size="lg" className="day-cta" product={PRODUCT} source="zh_rfq" title={c.tradeDesk}>
                {c.rfq.cta}
                <ArrowUpRight size={18} />
              </TradeDeskButton>
              <p className="commercial-note">{c.rfq.note}</p>
            </div>
          </div>
        </section>

        {/* A static teaser: the market intelligence page does not exist yet, so nothing links to it. */}
        <section className="section-pad zh-market" aria-labelledby="zh-market-title">
          <div className="content-width">
            <p className="eyebrow">{c.market.eyebrow}</p>
            <h2 id="zh-market-title">{c.market.title}</h2>
            <p>{c.market.text}</p>
          </div>
        </section>
      </main>
      <footer className="site-footer premium-footer zh-footer">
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
