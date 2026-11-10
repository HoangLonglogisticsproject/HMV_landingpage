'use client';
import { X } from 'lucide-react';
import { LightboxPreview } from '@/components/common/Lightbox';
import Image from '@/lib/image';

// The Packaging photo preview: the photo alone, as a modal dialog.
export function ImagePreview({ lang }) {
  return (
    <LightboxPreview>
      {(image, close) => (
        // A click on the backdrop closes; the keyboard closes with Escape or the button (LightboxPreview).
        <div className="pack-lightbox" role="presentation" onClick={e => e.target === e.currentTarget && close()}>
          <div className="lightbox-content" role="dialog" aria-modal="true" aria-label="Packaging & Freight Evidence">
            <button
              type="button"
              className="lightbox-close"
              onClick={close}
              aria-label={lang === 'vi' ? 'Đóng cửa sổ' : 'Close modal'}
              autoFocus
            >
              <X size={20} />
            </button>
            <Image src={image} alt="Packaging & Freight Evidence" sizes="(max-width: 960px) 100vw, 960px" />
          </div>
        </div>
      )}
    </LightboxPreview>
  );
}
