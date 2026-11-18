'use client';
import { X } from 'lucide-react';
import { LightboxPreview, PreviewDialog } from '@/components/common/Lightbox';
import Image from '@/lib/image';

// The full-viewport overlay as a native modal dialog; the utilities undo the browser's dialog box so `.pack-lightbox`
// lays it out as before.
export const OVERLAY = 'pack-lightbox size-full max-h-none max-w-none text-inherit backdrop:bg-transparent';

// The Logistics photo preview: the photo with its tag and title.
export function ImagePreview() {
  return (
    <LightboxPreview>
      {(image, close) => (
        <PreviewDialog key={image.src} className={OVERLAY} label={image.title} close={close}>
          <div className="pack-lightbox-content">
            <button type="button" className="pack-lightbox-close" onClick={close} aria-label="Close image preview">
              <X size={20} />
            </button>
            <Image src={image.src} alt={image.title} sizes="(max-width: 960px) 100vw, 960px" />
            <div className="pack-lightbox-caption">
              <strong>{image.tag}</strong> · {image.title}
            </div>
          </div>
        </PreviewDialog>
      )}
    </LightboxPreview>
  );
}
