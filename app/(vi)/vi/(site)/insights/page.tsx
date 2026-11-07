import { listBundledArticles } from '@/features/articles/bundled';
import { pageMetadata } from '@/next/seo';
import { INSIGHTS_PAGE_SIZE, InsightsView } from '@/views/insights/InsightsView';
import { insightsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/insights', ...insightsMeta('vi') });

export default function Page() {
  return <InsightsView lang="vi" articles={listBundledArticles('vi', { pageSize: INSIGHTS_PAGE_SIZE })} />;
}
