import { Check } from 'lucide-react';
import { ProductRfq } from '@/features/inquiries/ProductRfq';
import Image from '@/lib/image';
import { ProductMoneyHero } from './ProductMoneyHero';

// Section heading: eyebrow, h2 and an optional intro line. Also used by CassavaChinaView.
export const Heading = ({ eyebrow, title, text }) => (
  <div className="section-heading">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
    {text && <p>{text}</p>}
  </div>
);

export const Cards = ({ items }) => (
  <div className="business-grid landing-grid">
    {items.map(item => (
      <article key={item.title}>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </article>
    ))}
  </div>
);

export const Photo = ({ photo, lang, sizes }) => (
  <figure className="landing-photo">
    <Image src={photo.src} width={photo.width} height={photo.height} sizes={sizes} loading="lazy" decoding="async" alt={photo.caption[lang]} />
    <figcaption>{photo.caption[lang]}</figcaption>
  </figure>
);

// `sizes` of the supply-evidence photographs (.supply-evidence): the lead in the 1.2fr column of .content-width, the
// others in the 1fr column; one column at 700 px and below.
const EVIDENCE_SIZES = [
  '(max-width: 600px) calc(100vw - 40px), (max-width: 700px) calc(100vw - 64px), (max-width: 1100px) calc((100vw - 88px) * 0.55), (max-width: 1255px) calc((100vw - 120px) * 0.55), 620px',
  '(max-width: 600px) calc(100vw - 40px), (max-width: 700px) calc(100vw - 64px), (max-width: 1100px) calc((100vw - 88px) * 0.46), (max-width: 1255px) calc((100vw - 120px) * 0.46), 517px',
];

// HMV photographs of the product, stock and container loading (data/cassavaEvidence.js): the lead beside the others.
// Lazy like every image below the hero. Also used by CassavaChinaView.
export const SupplyEvidence = ({ evidence, lang }) => {
  const c = evidence.copy[lang];
  return (
    <section className="section-pad landing-alt supply-evidence-section" id="supply-evidence">
      <div className="content-width">
        <Heading eyebrow={c.eyebrow} title={c.title} text={c.text} />
        <div className="supply-evidence">
          {evidence.photos.map((p, i) => (
            <figure key={p.id}>
              <div className="supply-evidence-frame">
                <Image src={p.src} width={p.width} height={p.height} sizes={EVIDENCE_SIZES[Math.min(i, 1)]} loading="lazy" decoding="async" alt={p.alt[lang]} />
              </div>
              <figcaption>{p.caption[lang]}</figcaption>
            </figure>
          ))}
        </div>
        <p className="commercial-note">{c.note}</p>
      </div>
    </section>
  );
};

// A product page built for buyers (data/productPages.js): its own hero (ProductMoneyHero), then buyer requirements,
// supply evidence, quality results, evidence, the requirements to agree, applications, workflow, images and the
// product RFQ. Sections without content are left out; backgrounds alternate in the order the sections appear on
// either page, the supply evidence sharing the quality results' background.
export function ProductLanding({ lang, product, page }) {
  const c = page[lang];
  return (
    <>
      <ProductMoneyHero lang={lang} product={product} page={page} />

      <section className="section-pad">
        <div className="content-width">
          <Heading {...c.audience} />
          <Cards items={c.audience.items} />
        </div>
      </section>

      {page.supplyEvidence && <SupplyEvidence evidence={page.supplyEvidence} lang={lang} />}

      {c.quality && (
        <section className="section-pad landing-alt" id="quality">
          <div className="content-width">
            <Heading {...c.quality} />
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
            <p className="commercial-note">{c.quality.note}</p>
          </div>
        </section>
      )}

      {c.evidence && (
        <section className="section-pad landing-alt">
          <div className="content-width product-detail">
            <div>
              <Heading eyebrow={c.evidence.eyebrow} title={c.evidence.title} />
              <ul className="landing-checks">
                {c.evidence.items.map(item => (
                  <li key={item}>
                    <Check size={18} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="commercial-note">{c.evidence.note}</p>
            </div>
            {page.evidencePhoto && <Photo photo={page.evidencePhoto} lang={lang} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1280px) 45vw, 530px" />}
          </div>
        </section>
      )}

      {c.requirements && (
        <section className="section-pad" id="requirements">
          <div className="content-width">
            <Heading {...c.requirements} />
            <Cards items={c.requirements.items} />
            <p className="commercial-note">{c.requirements.note}</p>
          </div>
        </section>
      )}

      {c.applications && (
        <section className="section-pad">
          <div className="content-width">
            <Heading {...c.applications} />
            <Cards items={c.applications.items} />
          </div>
        </section>
      )}

      <section className="section-pad landing-alt">
        <div className="content-width">
          <Heading {...c.workflow} />
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

      {page.gallery?.length > 0 && (
        <section className="section-pad">
          <div className="content-width">
            <Heading {...c.gallery} />
            <div className="landing-gallery">
              {page.gallery.map(p => (
                // ponytail: widths of a one- or two-image gallery (auto-fit 240px columns, 24px gap, .content-width
                // breakpoints; one image is capped at a column's 568px); 3+ images need their own sizes.
                <Photo key={p.src} photo={p} lang={lang} sizes={page.gallery.length > 1 ? '(max-width: 543px) calc(100vw - 40px), (max-width: 600px) calc(50vw - 32px), (max-width: 1100px) calc(50vw - 44px), (max-width: 1255px) calc(50vw - 60px), 568px' : '(max-width: 631px) calc(100vw - 40px), 568px'} />
              ))}
            </div>
            <p className="commercial-note">{c.gallery.note}</p>
          </div>
        </section>
      )}

      <ProductRfq lang={lang} product={product} text={c.rfq} fields={page.rfqFields} />
    </>
  );
}
