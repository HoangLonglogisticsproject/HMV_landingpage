'use client';
import { X } from 'lucide-react';
import { LightboxPreview } from '@/components/common/Lightbox';
import Image from '@/lib/image';

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
