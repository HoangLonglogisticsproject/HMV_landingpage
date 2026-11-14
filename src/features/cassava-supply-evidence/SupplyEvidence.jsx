import Image from '@/lib/image';

// `sizes` of the supply-evidence photographs (.supply-evidence): the lead in the 1.2fr column of .content-width, the
// others in the 1fr column; one column at 700 px and below.
const EVIDENCE_SIZES = [
  '(max-width: 600px) calc(100vw - 40px), (max-width: 700px) calc(100vw - 64px), (max-width: 1100px) calc((100vw - 88px) * 0.55), (max-width: 1255px) calc((100vw - 120px) * 0.55), 620px',
  '(max-width: 600px) calc(100vw - 40px), (max-width: 700px) calc(100vw - 64px), (max-width: 1100px) calc((100vw - 88px) * 0.46), (max-width: 1255px) calc((100vw - 120px) * 0.46), 517px',
];

// HMV photographs of the cassava product, stock and container loading (data/cassavaEvidence.js): the lead beside the
// others. Lazy like every image below the hero. Used by the EN/VI cassava page (views/products/ProductLanding) and the
// Chinese one (views/products/CassavaChinaView).
export function SupplyEvidence({ evidence, lang }) {
  const c = evidence.copy[lang];
  return (
    <section className="section-pad landing-alt supply-evidence-section" id="supply-evidence">
      <div className="content-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{c.eyebrow}</p>
            <h2>{c.title}</h2>
          </div>
          <p>{c.text}</p>
        </div>
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
}
