import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageMeta } from '@/components/common/PageMeta';
import { Contact } from '@/features/inquiries/Contact';
import { copy } from '@/data/hmv';

// Inner-page frame: meta tags, heading band, page content, then the contact CTA.
// `seo` overrides the meta title/description when they differ from the visible heading (CMS pages).
export function DetailLayout({ lang, title, description, seo, contactCta = true, children }) {
  const t = copy[lang];
  return (
    <>
      <PageMeta lang={lang} title={seo?.title || title} description={seo?.description || description} />
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
