import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import { Document } from '@/next/Document';
import { rootMetadata } from '@/next/seo';

export const metadata = rootMetadata;
export const viewport: Viewport = { themeColor: '#0042a2' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <Document lang="vi">{children}</Document>;
}
