// Image port `@/lib/image`, Next.js implementation (tsconfig.json `paths`): next/image, so every image gets a srcset
// for its `sizes`, lazy loading unless the view asks for `loading="eager"`, and the intrinsic size of static imports.
// Shared views import the port, never this file; the Vite build maps the port to src/app/image.jsx.
// Absolute URLs are CMS media, served as they are: optimizing them needs the CMS media host allow-listed in
// next.config (`images.remotePatterns`), which comes with the CMS in production (roadmap PR-13).
import NextImage, { type ImageProps } from 'next/image';

export default function Image(props: ImageProps) {
  const remote = typeof props.src === 'string' && /^https?:\/\//.test(props.src);
  return <NextImage unoptimized={remote} {...props} />;
}
