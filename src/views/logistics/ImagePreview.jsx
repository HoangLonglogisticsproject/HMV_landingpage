'use client';
import { X } from 'lucide-react';
import { LightboxPreview } from '@/components/common/Lightbox';
import Image from '@/lib/image';

// The Logistics photo preview: the photo with its tag and title.
export function ImagePreview() {
  return (
    <LightboxPreview>
      {(image, close) => (
        // A click on the backdrop closes; the keyboard closes with Escape or the button (LightboxPreview).
        <div className="pack-lightbox" role="presentation" onClick={e => e.target === e.currentTarget && close()}>
          <div className="pack-lightbox-content" role="dialog" aria-modal="true" aria-label={image.title}>
            <button
              className="pack-lightbox-close"
              onClick={close}
              aria-label="Close image preview"
              autoFocus
            >
              <X size={20} />
            </button>
            <Image src={image.src} alt={image.title} sizes="(max-width: 960px) 100vw, 960px" />
            <div className="pack-lightbox-caption">
              <strong>{image.tag}</strong> · {image.title}
            </div>
          </div>
        </div>
      )}
    </LightboxPreview>
  );
}
