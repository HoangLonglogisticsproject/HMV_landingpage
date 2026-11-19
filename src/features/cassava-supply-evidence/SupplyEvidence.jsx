import { ZoomIn } from 'lucide-react';
import { Lightbox, ZoomTrigger } from '@/components/common/Lightbox';
import Image from '@/lib/image';
import { cn } from '@/lib/utils';
import { SupplyEvidencePreview } from './SupplyEvidencePreview';

// `sizes` of the supply-evidence photographs (.supply-evidence): the lead in the 1.2fr column of .content-width, the
// others in the 1fr column; one column at 700 px and below.
const EVIDENCE_SIZES = [
  '(max-width: 600px) calc(100vw - 40px), (max-width: 700px) calc(100vw - 64px), (max-width: 1100px) calc((100vw - 88px) * 0.55), (max-width: 1255px) calc((100vw - 120px) * 0.55), 620px',
  '(max-width: 600px) calc(100vw - 40px), (max-width: 700px) calc(100vw - 64px), (max-width: 1100px) calc((100vw - 88px) * 0.46), (max-width: 1255px) calc((100vw - 120px) * 0.46), 517px',
];

// A photograph that opens larger (components/common/Lightbox) on click, Enter or Space: its frame, the lazy image and
// the zoom icon shown on hover and focus.
function EvidencePhoto({ photo: p, lang, title, sizes, className, imageClassName }) {
  return (
    <ZoomTrigger
      image={{ src: p.src, width: p.width, height: p.height, alt: p.alt[lang], caption: p.caption[lang] }}
      className={cn('supply-evidence-frame', className)}
      title={title}
    >
      <Image src={p.src} width={p.width} height={p.height} sizes={sizes} loading="lazy" decoding="async" alt={p.alt[lang]} className={imageClassName} />
      <span className="supply-evidence-zoom" aria-hidden="true">
        <ZoomIn size={18} />
      </span>
    </ZoomTrigger>
  );
}

// HMV photographs of the cassava product, stock and container loading (data/cassavaEvidence.js): the lead beside the
// others. Lazy like every image below the hero. Each opens larger on click, Enter or Space (components/common/Lightbox):
// the page stays server-rendered, only the triggers and the preview run on the client. Used by the EN/VI cassava page
// (views/products/ProductLanding) and the Korean one (views/products/CassavaKoreaView); the Chinese page shows the same
// photographs in SupplyEvidenceGallery below.
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
                <EvidencePhoto photo={p} lang={lang} title={c.zoom} sizes={EVIDENCE_SIZES[Math.min(i, 1)]} />
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

// `sizes` of the gallery's photographs: the lead in the 1.5fr column, the others in the 1fr column, of the content
// beside the section heading (views/products/CassavaProcurement Section) from 1024 px; one column below 640 px.
const GALLERY_SIZES = [
  '(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 60px) * 0.6), (max-width: 1239px) calc((100vw - 352px) * 0.6), 532px',
  '(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 60px) * 0.4), (max-width: 1239px) calc((100vw - 352px) * 0.4), 356px',
];

// The same photographs and preview as SupplyEvidence, without its section: the page gives the heading. The lead
// photograph, landscape, beside the other two stacked; each caption a label on the photograph. The frames' aspect
// ratios fix every size, so nothing shifts while the lazy images load. Used by the Chinese page (CassavaChinaView).
export function SupplyEvidenceGallery({ evidence, lang }) {
  const c = evidence.copy[lang];
  return (
    <Lightbox>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {evidence.photos.map((p, i) => (
          <figure key={p.id} className={cn('relative', i === 0 && 'sm:row-span-2')}>
            <EvidencePhoto
              photo={p}
              lang={lang}
              title={c.zoom}
              sizes={GALLERY_SIZES[Math.min(i, 1)]}
              className={cn('rounded-xl', i === 0 ? 'aspect-[4/3] sm:aspect-auto sm:h-full' : 'aspect-[2/1]')}
              imageClassName="absolute inset-0 size-full object-cover"
            />
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 rounded-b-xl bg-linear-to-t from-navy/55 to-transparent" />
            <figcaption className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-navy/85 px-2.5 py-1 text-[13px] leading-5 font-medium text-white">
              {p.caption[lang]}
            </figcaption>
          </figure>
        ))}
      </div>
      <SupplyEvidencePreview closeLabel={c.close} />
    </Lightbox>
  );
}
