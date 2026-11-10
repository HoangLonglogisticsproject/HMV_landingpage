import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Image imports are URL strings in Vite and { src, width, height } objects in Next.js; data modules store the URL.
// MIGRATION-ONLY: with next/image (PR-08) and without Vite, components take the imported image as is; delete then.
export const assetSrc = image => (typeof image === 'string' ? image : image.src);
