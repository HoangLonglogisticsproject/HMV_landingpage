import { ArrowDown, ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';
import { productPhotos } from '@/data/productPhotos';
import Image from '@/lib/image';

// HMV photographs: the growing area, with the cut-fruit product photo inset as its detail.
function HeroPhotos({ lang, main, detail }) {
  return (
    <figure className="money-photos">
      <div className="money-photo-frame">
        <Image
          className="money-photo-main"
          src={main.src}
          width={main.width}
          height={main.height}
          sizes="(max-width: 900px) calc(100vw - 40px), 600px"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          alt={main.caption[lang]}
        />
        <Image
          className="money-photo-detail"
          src={detail.src}
          width={detail.width}
          height={detail.height}
          sizes="(max-width: 900px) 34vw, 190px"
          loading="eager"
          decoding="async"
          alt={lang === 'vi' ? detail.altVi : detail.altEn}
        />
      </div>
      <figcaption>
        {main.caption[lang]} · {lang === 'vi' ? detail.sourceVi : detail.sourceEn}
      </figcaption>
    </figure>
  );
}

// Evidence instead of imagery: HMV network capacity and the Intertek sample reference (no cassava photographs yet).
function EvidencePanel({ figures, intertek }) {
  return (
    <aside className="money-panel" aria-labelledby="money-panel-title">
      <p className="money-panel-label">{figures.eyebrow}</p>
      <h2 id="money-panel-title">{figures.title}</h2>
      <dl className="money-figures">
        {figures.items.map(f => {
          // "50,000 MT/month": the amount leads, the unit follows in the label size.
          const [amount, ...unit] = f.value.split(' ');
          return (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>
                <span className="money-figure-amount">{amount}</span> {unit.join(' ')}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="money-panel-note">{figures.note}</p>
      <div className="money-intertek">
        <h3>{intertek.title}</h3>
        <dl>
          {intertek.results.map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="money-intertek-source">
          <p className="money-intertek-report">{intertek.report}</p>
          <p className="money-panel-note">{intertek.caption}</p>
        </div>
      </div>
    </aside>
  );
}

// The first screen of a buyer page (data/productPages.js): positioning, heading, lead and the RFQ call to action, next to
// HMV photographs or, without them, the evidence panel; then the trust facts. Replaces DetailLayout's heading band on
// these pages only.
export function ProductMoneyHero({ lang, product, page }) {
  const c = page[lang];
  const { hero } = c;
  return (
    <>
      <header className="money-hero">
        <div className="content-width money-hero-grid">
          <div className="money-hero-copy">
            <p className="money-eyebrow">{hero.eyebrow}</p>
            <h1>{c.h1}</h1>
            <p className="money-lead">{c.lead}</p>
            <div className="money-actions">
              <Button asChild size="lg" className="day-cta">
                <a href="#rfq">
                  {c.rfq.title}
                  <ArrowUpRight size={18} />
                </a>
              </Button>
              <a className="text-link" href={`#${hero.secondary.target}`}>
                {hero.secondary.label}
                <ArrowDown size={16} />
              </a>
            </div>
            {c.seeAlso && (
              <p className="money-see-also">
                <Link to={`/products/${c.seeAlso.id}`}>{c.seeAlso.text}</Link>
              </p>
            )}
          </div>
          <div className="money-hero-media">
            {c.figures ? (
              <EvidencePanel figures={c.figures} intertek={hero.intertek} />
            ) : (
              <HeroPhotos lang={lang} main={page.heroPhoto} detail={productPhotos[product.id]} />
            )}
          </div>
          {hero.trust && (
            <ul className="money-trust">
              {hero.trust.map(item => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
      <dl className="money-proof content-width">
        {c.facts.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
