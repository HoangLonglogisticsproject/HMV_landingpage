import { DetailLayout } from '@/components/layout/DetailLayout';
import { Contact } from '@/features/inquiries/Contact';
import { copy } from '@/data/hmv';
import { useLang } from '@/i18n/LanguageContext';

export function ContactPage() {
  const lang = useLang();
  const t = copy[lang];
  return (
    <DetailLayout
      lang={lang}
      title={t.contact}
      description={t.contactText}
      contactCta={false}
    >
      <Contact lang={lang} full />
    </DetailLayout>
  );
}
