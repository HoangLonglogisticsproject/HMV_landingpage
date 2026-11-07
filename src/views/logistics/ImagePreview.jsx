'use client';
import { X } from 'lucide-react';
import { LightboxPreview } from '@/components/common/Lightbox';

// The Logistics photo preview: the photo with its tag and title.
export function ImagePreview() {
  return (
    <LightboxPreview>
      {(image, close) => (
        <div className="pack-lightbox" onClick={close}>
          <div
            className="pack-lightbox-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="pack-lightbox-close"
              onClick={close}
              aria-label="Close image preview"
            >
              <X size={20} />
            </button>
            <img src={image.src} alt={image.title} />
            <div className="pack-lightbox-caption">
              <strong>{image.tag}</strong> · {image.title}
            </div>
          </div>
        </div>
      )}
    </LightboxPreview>
  );
}
