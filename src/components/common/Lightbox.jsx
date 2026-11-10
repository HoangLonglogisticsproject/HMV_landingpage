'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// Image preview for server-rendered galleries: the page stays a server component; only the thumbnails
// (`ZoomTrigger`) and the page's own preview markup (`LightboxPreview`) run on the client.
const LightboxContext = createContext(null);

export function Lightbox({ children }) {
  const [image, setImage] = useState(null);
  // The thumbnail that opened the preview, to give focus back when it closes.
  const opener = useRef(null);
  // Stable functions: LightboxPreview's effect then runs only when the image changes.
  const open = useCallback((next, element) => {
    opener.current = element;
    setImage(next);
  }, []);
  const close = useCallback(() => setImage(null), []);
  const restoreFocus = useCallback(() => opener.current?.focus(), []);
  return <LightboxContext.Provider value={{ image, open, close, restoreFocus }}>{children}</LightboxContext.Provider>;
}

/** A thumbnail that opens the preview, by mouse or keyboard (Enter, Space). */
export function ZoomTrigger({ image, className, title, children }) {
  const { open } = useContext(LightboxContext);
  return (
    <div
      className={className}
      title={title}
      role="button"
      tabIndex={0}
      onClick={e => open(image, e.currentTarget)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(image, e.currentTarget);
        }
      }}
    >
      {children}
    </div>
  );
}

/** Renders `children(image, close)` while an image is open; Escape closes it and focus returns to the thumbnail. */
export function LightboxPreview({ children }) {
  const { image, close, restoreFocus } = useContext(LightboxContext);
  useEffect(() => {
    if (!image) return undefined;
    const onKeyDown = e => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreFocus();
    };
  }, [image, close, restoreFocus]);
  return image ? children(image, close) : null;
}
