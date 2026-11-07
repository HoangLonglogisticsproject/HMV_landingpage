import { listBundledArticles } from '@/features/articles/bundled';
import { pageMetadata } from '@/next/seo';
import { INSIGHTS_PAGE_SIZE, InsightsView } from '@/views/insights/InsightsView';
import { insightsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/insights', ...insightsMeta('en') });

export default function Page() {
  return <InsightsView lang="en" articles={listBundledArticles('en', { pageSize: INSIGHTS_PAGE_SIZE })} />;
}
