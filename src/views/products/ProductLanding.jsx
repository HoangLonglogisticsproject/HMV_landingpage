import { Check } from 'lucide-react';
import { ProductRfq } from '@/features/inquiries/ProductRfq';
import Image from '@/lib/image';
import { ProductMoneyHero } from './ProductMoneyHero';

// Section heading: eyebrow, h2 and an optional intro line.
const Heading = ({ eyebrow, title, text }) => (
  <div className="section-heading">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
    {text && <p>{text}</p>}
  </div>
);

const Cards = ({ items }) => (
  <div className="business-grid landing-grid">
    {items.map(item => (
      <article key={item.title}>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
      </article>
    ))}
  </div>
);

const Photo = ({ photo, lang, sizes }) => (
  <figure className="landing-photo">
    <Image src={photo.src} width={photo.width} height={photo.height} sizes={sizes} loading="lazy" decoding="async" alt={photo.caption[lang]} />
    <figcaption>{photo.caption[lang]}</figcaption>
  </figure>
);

// A product page built for buyers (data/productPages.js): its own hero (ProductMoneyHero), then buyer requirements,
// quality results, evidence, the requirements to agree, applications, workflow, images and the product RFQ. Sections
// without content are left out; backgrounds alternate in the order the sections appear on either page.
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

      {page.gallery.length > 0 && (
        <section className="section-pad">
          <div className="content-width">
            <Heading {...c.gallery} />
            <div className="landing-gallery">
              {page.gallery.map(p => (
                <Photo key={p.src} photo={p} lang={lang} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1280px) 30vw, 380px" />
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
