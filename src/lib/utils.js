import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Image imports are URL strings in Vite and { src, width, height } objects in Next.js.
// ponytail: plain <img> in both builds; next/image comes with the images PR (docs/architecture/MIGRATION_ROADMAP.md).
export const assetSrc = image => (typeof image === 'string' ? image : image.src);
