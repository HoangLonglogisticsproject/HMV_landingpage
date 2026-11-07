import { pageMetadata } from '@/next/seo';
import { LogisticsView } from '@/views/logistics/LogisticsView';
import { logisticsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/logistics', ...logisticsMeta('en') });

export default function Page() {
  return <LogisticsView lang="en" />;
}
