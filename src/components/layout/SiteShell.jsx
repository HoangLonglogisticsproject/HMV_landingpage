import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { SupportChatWidget } from '@/features/support-chat/SupportChatWidget';

// Site chrome around page content: navigation, <main>, footer and the support chat.
export function SiteShell({ lang, className, children }) {
  return (
    <>
      <Navigation lang={lang} />
      <main id="main-content" className={className}>
        {children}
      </main>
      <Footer lang={lang} />
      <SupportChatWidget lang={lang} />
    </>
  );
}
