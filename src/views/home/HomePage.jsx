// Vite page adapter: language from context, EcoNews from the Vite hook, head tags from PageMeta.
import { PageMeta } from '@/components/common/PageMeta';
import { useArticleList } from '@/features/articles/hooks';
import { useLang } from '@/i18n/LanguageContext';
import { homeMeta } from '../meta';
import { HomeView, LATEST_ARTICLES } from './HomeView';

export function HomePage() {
  const lang = useLang();
  const articles = useArticleList(lang, { pageSize: LATEST_ARTICLES });
  return (
    <>
      <PageMeta lang={lang} {...homeMeta(lang)} />
      <HomeView lang={lang} articles={articles} />
    </>
  );
}
