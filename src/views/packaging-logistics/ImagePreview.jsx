'use client';
import { X } from 'lucide-react';
import { LightboxPreview } from '@/components/common/Lightbox';
import Image from '@/lib/image';

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
            <Image src={image} alt="Packaging & Freight Evidence" sizes="(max-width: 960px) 100vw, 960px" />
          </div>
        </div>
      )}
    </LightboxPreview>
  );
}
