import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { SupportChatWidget } from '@/features/support-chat/SupportChatWidget';
import { TradeDesk } from '@/features/trade-desk/TradeDesk';

// Site chrome around page content: navigation, <main>, footer, the support chat and the HMV Trade Desk (closed until a
// call to action opens it).
/** @param {{ lang: 'en' | 'vi', className?: string, children: import('react').ReactNode }} props */
export function SiteShell({ lang, className, children }) {
  return (
    <>
      <Navigation lang={lang} />
      <main id="main-content" className={className}>
        {children}
      </main>
      <Footer lang={lang} />
      <SupportChatWidget lang={lang} />
      <TradeDesk lang={lang} />
    </>
  );
}
