import { ZoomIn } from 'lucide-react';
import { Lightbox, ZoomTrigger } from '@/components/common/Lightbox';
import Image from '@/lib/image';
import { cn } from '@/lib/utils';
import { SupplyEvidencePreview } from './SupplyEvidencePreview';

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

// `sizes` of the gallery's photographs: the lead in the 1.5fr column, the others in the 1fr column, of the content
// beside the section heading (views/products/CassavaProcurement Section) from 1024 px; one column below 640 px.
const GALLERY_SIZES = [
  '(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 60px) * 0.6), (max-width: 1239px) calc((100vw - 352px) * 0.6), 532px',
  '(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 60px) * 0.4), (max-width: 1239px) calc((100vw - 352px) * 0.4), 356px',
];

// HMV photographs of the cassava product, stock and container loading (data/cassavaEvidence.js), without a section:
// the page gives the heading. The lead photograph, landscape, beside the other two stacked; each caption a label on the
// photograph. Lazy like every image below the hero; each opens larger on click, Enter or Space (SupplyEvidencePreview),
// the page staying server-rendered. The frames' aspect ratios fix every size, so nothing shifts while the lazy images
// load. Used by the cassava procurement page in every language (views/products/CassavaProcurement).
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
