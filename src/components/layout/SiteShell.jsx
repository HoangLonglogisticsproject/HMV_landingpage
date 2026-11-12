import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { TradeDeskHost } from '@/features/trade-desk/TradeDeskHost';

// Site chrome around page content: navigation, <main>, footer and the HMV Trade Desk host (the desk loads when a call
// to action first opens it).
/** @param {{ lang: 'en' | 'vi', className?: string, children: import('react').ReactNode }} props */
export function SiteShell({ lang, className, children }) {
  return (
    <>
      <Navigation lang={lang} />
      <main id="main-content" className={className}>
        {children}
      </main>
      <Footer lang={lang} />
      <TradeDeskHost lang={lang} />
    </>
  );
}
