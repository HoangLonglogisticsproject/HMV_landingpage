import { ZoomIn } from 'lucide-react';
import { Lightbox, ZoomTrigger } from '@/components/common/Lightbox';
import Image from '@/lib/image';
import { SupplyEvidencePreview } from './SupplyEvidencePreview';

// `sizes` of the supply-evidence photographs (.supply-evidence): the lead in the 1.2fr column of .content-width, the
// others in the 1fr column; one column at 700 px and below.
const EVIDENCE_SIZES = [
  '(max-width: 600px) calc(100vw - 40px), (max-width: 700px) calc(100vw - 64px), (max-width: 1100px) calc((100vw - 88px) * 0.55), (max-width: 1255px) calc((100vw - 120px) * 0.55), 620px',
  '(max-width: 600px) calc(100vw - 40px), (max-width: 700px) calc(100vw - 64px), (max-width: 1100px) calc((100vw - 88px) * 0.46), (max-width: 1255px) calc((100vw - 120px) * 0.46), 517px',
];

// HMV photographs of the cassava product, stock and container loading (data/cassavaEvidence.js): the lead beside the
// others. Lazy like every image below the hero. Each opens larger on click, Enter or Space (components/common/Lightbox):
// the page stays server-rendered, only the triggers and the preview run on the client. Used by the EN/VI cassava page
// (views/products/ProductLanding) and the page-scoped ones (views/products/CassavaChinaView, CassavaKoreaView).
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
        <Lightbox>
          <div className="supply-evidence">
            {evidence.photos.map((p, i) => (
              <figure key={p.id}>
                <ZoomTrigger
                  image={{ src: p.src, width: p.width, height: p.height, alt: p.alt[lang], caption: p.caption[lang] }}
                  className="supply-evidence-frame"
                  title={c.zoom}
                >
                  <Image src={p.src} width={p.width} height={p.height} sizes={EVIDENCE_SIZES[Math.min(i, 1)]} loading="lazy" decoding="async" alt={p.alt[lang]} />
                  <span className="supply-evidence-zoom" aria-hidden="true">
                    <ZoomIn size={18} />
                  </span>
                </ZoomTrigger>
                <figcaption>{p.caption[lang]}</figcaption>
              </figure>
            ))}
          </div>
          <SupplyEvidencePreview closeLabel={c.close} />
        </Lightbox>
        <p className="commercial-note">{c.note}</p>
      </div>
    </section>
  );
}
