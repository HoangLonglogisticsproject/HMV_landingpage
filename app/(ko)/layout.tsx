import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import { Document } from '@/next/Document';

export { rootMetadata as metadata } from '@/next/seo';
export const viewport: Viewport = { themeColor: '#0042a2' };

// Root layout of the page-scoped Korean pages (i18n/routes.js PAGE_LOCALES). No site chrome: each page brings its
// own, linking only to pages that exist.
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <Document lang="ko">{children}</Document>;
}
