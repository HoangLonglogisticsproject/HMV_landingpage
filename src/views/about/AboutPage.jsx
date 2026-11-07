// Vite page adapter: language from context, copy from usePage (bundled, or the CMS from the browser in CMS mode),
// head tags from PageMeta and Helmet.
import { Helmet } from 'react-helmet-async';
import { PageMeta } from '@/components/common/PageMeta';
import { usePage } from '@/features/pages/usePage';
import { useLang } from '@/i18n/LanguageContext';
import { aboutMeta } from '../meta';
import { AboutView } from './AboutView';

export function AboutPage() {
  const lang = useLang();
  const s = usePage('about', lang);
  return (
    <>
      <PageMeta lang={lang} {...aboutMeta(lang, s)} />
      {s.status === 'not-found' && <Helmet><meta name="robots" content="noindex" /></Helmet>}
      <AboutView lang={lang} state={s} />
    </>
  );
}
