import { loadArticleList } from '@/next/content';
import { pageMetadata } from '@/next/seo';
import { INSIGHTS_PAGE_SIZE, InsightsView } from '@/views/insights/InsightsView';
import { insightsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/insights', ...insightsMeta('en') });

export default async function Page() {
  return <InsightsView lang="en" articles={await loadArticleList('en', INSIGHTS_PAGE_SIZE)} />;
}
