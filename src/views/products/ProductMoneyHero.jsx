import { ArrowDown, ArrowUpRight, Check } from 'lucide-react';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
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

// The first screen of a buyer page (data/productPages.js): positioning, heading, lead and the RFQ call to action, next to
// HMV photographs; then the trust facts. Replaces DetailLayout's heading band on these pages only.
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
              {/* The HMV Trade Desk, with this product preselected; the RFQ (#rfq) stays lower on the page. */}
              <TradeDeskButton size="lg" className="day-cta" product={product.id} source="product_hero">
                {c.rfq.title}
                <ArrowUpRight size={18} />
              </TradeDeskButton>
              <a className="text-link" href={`#${hero.secondary.target}`}>
                {hero.secondary.label}
                <ArrowDown size={16} />
              </a>
            </div>
          </div>
          <div className="money-hero-media">
            <HeroPhotos lang={lang} main={page.heroPhoto} detail={productPhotos[product.id]} />
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
