import { ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { ProductRfq } from '@/features/inquiries/ProductRfq';
import { Link } from '@/lib/navigation';
import { productPhotos } from '@/data/productPhotos';
import Image from '@/lib/image';

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

// A product page built for buyers (data/productPages.js): hero, buyer requirements, evidence, figures, the requirements
// to agree, workflow, images and the product RFQ. Sections without content are left out.
export function ProductLanding({ lang, product, page }) {
  const c = page[lang];
  const hero = productPhotos[product.id];
  return (
    <DetailLayout lang={lang} title={c.h1} description={c.lead} contactCta={false}>
      <section className="section-pad">
        <div className={`content-width ${hero ? 'product-detail' : ''}`}>
          {hero && (
            <figure className="product-detail-photo">
              <Image
                src={hero.src}
                width={hero.width}
                height={hero.height}
                sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1280px) 45vw, 530px"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                alt={lang === 'vi' ? hero.altVi : hero.altEn}
              />
              <figcaption>{lang === 'vi' ? hero.sourceVi : hero.sourceEn}</figcaption>
            </figure>
          )}
          <div>
            <dl className="landing-facts">
              {c.facts.map(([term, value]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <Button asChild size="lg" variant="brand">
              <a href="#rfq">
                {c.rfq.title}
                <ArrowUpRight />
              </a>
            </Button>
            {c.seeAlso && (
              <p className="commercial-note">
                <Link to={`/products/${c.seeAlso.id}`}>{c.seeAlso.text}</Link>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section-pad landing-alt">
        <div className="content-width">
          <Heading {...c.audience} />
          <Cards items={c.audience.items} />
        </div>
      </section>

      {c.figures && (
        <section className="section-pad">
          <div className="content-width">
            <Heading {...c.figures} />
            <dl className="landing-figures">
              {c.figures.items.map(f => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className="commercial-note">{c.figures.note}</p>
          </div>
        </section>
      )}

      {c.quality && (
        <section className="section-pad landing-alt">
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
            <p className="commercial-note">{c.quality.note}</p>
          </div>
        </section>
      )}

      {c.evidence && (
        <section className="section-pad">
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
        <section className="section-pad landing-alt">
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

      <section className="section-pad">
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
        <section className="section-pad landing-alt">
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
    </DetailLayout>
  );
}
