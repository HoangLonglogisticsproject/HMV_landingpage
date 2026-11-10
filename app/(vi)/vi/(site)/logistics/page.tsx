import { pageMetadata } from '@/next/seo';
import { LogisticsView } from '@/views/logistics/LogisticsView';
import { logisticsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/logistics', ...logisticsMeta('vi') });

export default function Page() {
  return <LogisticsView lang="vi" />;
}
