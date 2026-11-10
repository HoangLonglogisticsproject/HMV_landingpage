// Vite page adapter: EcoNews from the Vite hook (bundled, or the CMS from the browser in CMS mode).
import { PageMeta } from '@/components/common/PageMeta';
import { useArticleList } from '@/features/articles/hooks';
import { useLang } from '@/i18n/LanguageContext';
import { insightsMeta } from '../meta';
import { INSIGHTS_PAGE_SIZE, InsightsView } from './InsightsView';

export function InsightsPage() {
  const lang = useLang();
  const articles = useArticleList(lang, { pageSize: INSIGHTS_PAGE_SIZE });
  return (
    <>
      <PageMeta lang={lang} {...insightsMeta(lang)} />
      <InsightsView lang={lang} articles={articles} />
    </>
  );
}
