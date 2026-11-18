import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import { Document } from '@/next/Document';

export { rootMetadata as metadata } from '@/next/seo';
export const viewport: Viewport = { themeColor: '#0042a2' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <Document lang="vi">{children}</Document>;
}
