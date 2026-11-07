import type { Metadata } from 'next';
import { Document } from '@/next/Document';
import { notFoundMeta } from '@/views/meta';
import { NotFoundView } from '@/views/not-found/NotFoundView';

// Every URL without a route: a static, server-rendered 404 (HTTP 404, noindex), the same chrome-less English page
// as the Vite site. With two root layouts there is no single layout for a not-found.tsx; in Next.js 16.4.5 a
// segment not-found.tsx under them is served as a client-rendered error shell, so unmatched URLs use this file
// (experimental.globalNotFound in next.config.ts). See docs/architecture/NEXTJS_TARGET_ARCHITECTURE.md §10.
export const metadata: Metadata = { ...notFoundMeta, title: `${notFoundMeta.title} | HMV Global` };

export default function GlobalNotFound() {
  return (
    <Document lang="en">
      <NotFoundView title={notFoundMeta.title} homeHref="/" />
    </Document>
  );
}
