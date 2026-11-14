'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { LightboxPreview } from '@/components/common/Lightbox';
import Image from '@/lib/image';

// The open preview: a native modal <dialog> (showModal), so the page behind it is inert and Tab and Shift+Tab stay in
// it. The Lightbox state stays the one source of truth: the dialog exists while an image is open, and every way out
// (Escape, the button, a click beside the photograph) calls `close`, which unmounts it; LightboxPreview gives focus
// back to the photograph that opened it.
function PreviewDialog({ image, close, closeLabel }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    // Escape: the browser's cancel would close the dialog on its own; the state closes it instead (LightboxPreview
    // also handles that Escape, and a second close is a no-op).
    const onCancel = e => {
      e.preventDefault();
      close();
    };
    // A click on the dialog itself, not on the photograph, its caption or the button: beside the photograph.
    const onClick = e => e.target === dialog && close();
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('click', onClick);
    // Should the browser close it anyway (a repeated Escape), the state follows.
    dialog.addEventListener('close', close);
    dialog.showModal();
    closeRef.current.focus();
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('close', close);
      if (dialog.open) dialog.close();
    };
  }, [close]);
  return (
    <dialog ref={dialogRef} className="supply-evidence-preview" aria-label={image.caption}>
      <button ref={closeRef} type="button" className="supply-evidence-preview-close" onClick={close} aria-label={closeLabel}>
        <X size={20} />
      </button>
      <figure>
        <Image src={image.src} width={image.width} height={image.height} sizes="(max-width: 1140px) calc(100vw - 40px), 1100px" alt={image.alt} />
        <figcaption>{image.caption}</figcaption>
      </figure>
    </dialog>
  );
}

// The supply-evidence photograph at full frame: the same optimized file as the grid, whole (object-fit: contain),
// fitted to the viewport, with its caption.
export function SupplyEvidencePreview({ closeLabel }) {
  return (
    <LightboxPreview>{(image, close) => <PreviewDialog key={image.src} image={image} close={close} closeLabel={closeLabel} />}</LightboxPreview>
  );
}
