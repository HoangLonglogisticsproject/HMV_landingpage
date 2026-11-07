// Vite page adapter. Keeps the Vite site's delayed smooth scroll to the #hash target, which the client-rendered
// content needs; on Next.js the sections are in the server HTML and the browser scrolls to the fragment itself.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageMeta } from '@/components/common/PageMeta';
import { useLang } from '@/i18n/LanguageContext';
import { logisticsMeta } from '../meta';
import { LogisticsView } from './LogisticsView';

export function LogisticsHubPage() {
  const lang = useLang();
  const { hash } = useLocation();
  useEffect(() => {
    const el = hash && document.getElementById(hash.replace('#', ''));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
  }, [hash]);
  return (
    <>
      <PageMeta lang={lang} {...logisticsMeta(lang)} />
      <LogisticsView lang={lang} />
    </>
  );
}
