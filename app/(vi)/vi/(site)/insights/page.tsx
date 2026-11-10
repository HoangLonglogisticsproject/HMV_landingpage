import { loadArticleList } from '@/next/content';
import { pageMetadata } from '@/next/seo';
import { INSIGHTS_PAGE_SIZE, InsightsView } from '@/views/insights/InsightsView';
import { insightsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/insights', ...insightsMeta('vi') });

export default async function Page() {
  return <InsightsView lang="vi" articles={await loadArticleList('vi', INSIGHTS_PAGE_SIZE)} />;
}
