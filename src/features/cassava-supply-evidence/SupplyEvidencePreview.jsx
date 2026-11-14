'use client';
import { X } from 'lucide-react';
import { LightboxPreview } from '@/components/common/Lightbox';
import Image from '@/lib/image';

// The supply-evidence photograph at full frame: the same optimized file as the grid, whole (object-fit: contain),
// fitted to the viewport, with its caption. The backdrop, the button and Escape (LightboxPreview) close it.
export function SupplyEvidencePreview({ closeLabel }) {
  return (
    <LightboxPreview>
      {(image, close) => (
        <div className="supply-evidence-preview" role="presentation" onClick={e => e.target === e.currentTarget && close()}>
          <button type="button" className="supply-evidence-preview-close" onClick={close} aria-label={closeLabel} autoFocus>
            <X size={20} />
          </button>
          <figure role="dialog" aria-modal="true" aria-label={image.caption}>
            <Image src={image.src} width={image.width} height={image.height} sizes="(max-width: 1140px) calc(100vw - 40px), 1100px" alt={image.alt} />
            <figcaption>{image.caption}</figcaption>
          </figure>
        </div>
      )}
    </LightboxPreview>
  );
}
