// Vite page adapter. The Vite site is locale-free: the 404 stays in English, as before.
import { PageMeta } from '@/components/common/PageMeta';
import { useLang } from '@/i18n/LanguageContext';
import { notFoundMeta } from '../meta';
import { NotFoundView } from './NotFoundView';

export function NotFoundPage() {
  const lang = useLang();
  return (
    <>
      <PageMeta lang={lang} {...notFoundMeta} />
      <NotFoundView title={notFoundMeta.title} homeHref="/" />
    </>
  );
}
