// Vite page adapter.
import { PageMeta } from '@/components/common/PageMeta';
import { useLang } from '@/i18n/LanguageContext';
import { contactMeta } from '../meta';
import { ContactView } from './ContactView';

export function ContactPage() {
  const lang = useLang();
  return (
    <>
      <PageMeta lang={lang} {...contactMeta(lang)} />
      <ContactView lang={lang} />
    </>
  );
}
