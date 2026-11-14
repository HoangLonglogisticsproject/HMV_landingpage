'use client';
import { X } from 'lucide-react';
import { LightboxPreview } from '@/components/common/Lightbox';
import Image from '@/lib/image';

// The supply-evidence photograph at full frame: the same optimized file as the grid, whole (object-fit: contain),
// fitted to the viewport, with its caption. The backdrop, the button and Escape (LightboxPreview) close it.
// The dialog holds the close button (focused on open), the photograph and its caption. It is not positioned, so the
// button sits in the backdrop's corner; the dialog is only as large as the photograph, so a click beside it closes.
export function SupplyEvidencePreview({ closeLabel }) {
  return (
    <LightboxPreview>
      {(image, close) => (
        <div className="supply-evidence-preview" role="presentation" onClick={e => e.target === e.currentTarget && close()}>
          <div role="dialog" aria-modal="true" aria-label={image.caption}>
            <button type="button" className="supply-evidence-preview-close" onClick={close} aria-label={closeLabel} autoFocus>
              <X size={20} />
            </button>
            <figure>
              <Image src={image.src} width={image.width} height={image.height} sizes="(max-width: 1140px) calc(100vw - 40px), 1100px" alt={image.alt} />
              <figcaption>{image.caption}</figcaption>
            </figure>
          </div>
        </div>
      )}
    </LightboxPreview>
  );
}
