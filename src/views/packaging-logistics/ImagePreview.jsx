'use client';
import { X } from 'lucide-react';
import { LightboxPreview, PreviewDialog } from '@/components/common/Lightbox';
import { OVERLAY } from '@/views/logistics/ImagePreview';
import Image from '@/lib/image';

// The Packaging photo preview: the photo alone, as a modal dialog.
export function ImagePreview({ lang }) {
  return (
    <LightboxPreview>
      {(image, close) => (
        <PreviewDialog key={image} className={OVERLAY} label="Packaging & Freight Evidence" close={close}>
          <div className="lightbox-content">
            <button type="button" className="lightbox-close" onClick={close} aria-label={lang === 'vi' ? 'Đóng cửa sổ' : 'Close modal'}>
              <X size={20} />
            </button>
            <Image src={image} alt="Packaging & Freight Evidence" sizes="(max-width: 960px) 100vw, 960px" />
          </div>
        </PreviewDialog>
      )}
    </LightboxPreview>
  );
}
