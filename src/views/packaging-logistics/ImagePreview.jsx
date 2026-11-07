'use client';
import { X } from 'lucide-react';
import { LightboxPreview } from '@/components/common/Lightbox';

// The Packaging photo preview: the photo alone, as a modal dialog.
export function ImagePreview({ lang }) {
  return (
    <LightboxPreview>
      {(image, close) => (
        <div
          className="pack-lightbox"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={close}
              aria-label={lang === 'vi' ? 'Đóng cửa sổ' : 'Close modal'}
            >
              <X size={20} />
            </button>
            <img src={image} alt="Packaging & Freight Evidence" />
          </div>
        </div>
      )}
    </LightboxPreview>
  );
}
