'use client';
import { X } from 'lucide-react';
import { LightboxPreview, PreviewDialog } from '@/components/common/Lightbox';
import Image from '@/lib/image';

// The supply-evidence photograph at full frame, in a native modal dialog (components/common/Lightbox): the same
// optimized file as the grid, whole (object-fit: contain), fitted to the viewport, with its caption.
export function SupplyEvidencePreview({ closeLabel }) {
  return (
    <LightboxPreview>
      {(image, close) => (
        <PreviewDialog key={image.src} className="supply-evidence-preview" label={image.caption} close={close}>
          <button type="button" className="supply-evidence-preview-close" onClick={close} aria-label={closeLabel}>
            <X size={20} />
          </button>
          <figure>
            <Image src={image.src} width={image.width} height={image.height} sizes="(max-width: 1140px) calc(100vw - 40px), 1100px" alt={image.alt} />
            <figcaption>{image.caption}</figcaption>
          </figure>
        </PreviewDialog>
      )}
    </LightboxPreview>
  );
}
