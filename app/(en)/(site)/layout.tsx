import type { ReactNode } from 'react';
import { SiteShell } from '@/components/layout/SiteShell';

// Site chrome for the pages. The 404 (app/global-not-found.tsx) has none, as on the Vite site.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
