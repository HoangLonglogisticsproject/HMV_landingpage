'use client';
import { createContext, useContext, useState } from 'react';

// Image preview for server-rendered galleries: the page stays a server component; only the thumbnails
// (`ZoomTrigger`) and the page's own preview markup (`LightboxPreview`) run on the client.
const LightboxContext = createContext(null);

export function Lightbox({ children }) {
  const [image, setImage] = useState(null);
  return <LightboxContext.Provider value={{ image, setImage }}>{children}</LightboxContext.Provider>;
}

export function ZoomTrigger({ image, className, title, children }) {
  const { setImage } = useContext(LightboxContext);
  return (
    <div className={className} title={title} onClick={() => setImage(image)}>
      {children}
    </div>
  );
}

/** Renders `children(image, close)` while an image is open. */
export function LightboxPreview({ children }) {
  const { image, setImage } = useContext(LightboxContext);
  return image ? children(image, () => setImage(null)) : null;
}
