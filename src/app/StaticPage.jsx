import { PageMeta } from '@/components/common/PageMeta';
import { useLang } from '@/i18n/LanguageContext';

// Vite page adapter for pages whose content depends on the language only: the head tags and the shared view.
// MIGRATION-ONLY: delete at cleanup (Next.js routes render the views directly).
export function StaticPage({ view: View, meta }) {
  const lang = useLang();
  return (
    <>
      <PageMeta lang={lang} {...meta(lang)} />
      <View lang={lang} />
    </>
  );
}
