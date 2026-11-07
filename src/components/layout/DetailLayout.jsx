import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { Contact } from '@/features/inquiries/Contact';
import { copy } from '@/data/hmv';

// Inner-page frame: heading band, page content, then the contact CTA. Presentational and shared by both builds:
// head tags come from the framework adapter (Vite: app/ViteDetailLayout.jsx; Next.js: route metadata).
export function DetailLayout({ lang, title, description, contactCta = true, children }) {
  const t = copy[lang];
  return (
    <>
      <header className="detail-heading">
        <div className="content-width">
          <Link className="back-link" to="/">
            <ArrowLeft size={15} />
            {t.back}
          </Link>
          <p className="eyebrow">HMV GLOBAL · CONNECTING THE WORLD</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      {children}
      {contactCta && <Contact lang={lang} />}
    </>
  );
}
