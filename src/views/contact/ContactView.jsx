import { DetailLayout } from '@/components/layout/DetailLayout';
import { Contact } from '@/features/inquiries/Contact';
import { copy } from '@/data/hmv';

// Contact page body, shared by both builds.
export function ContactView({ lang }) {
  const t = copy[lang];
  return (
    <DetailLayout lang={lang} title={t.contact} description={t.contactText} contactCta={false}>
      <Contact lang={lang} full />
    </DetailLayout>
  );
}
