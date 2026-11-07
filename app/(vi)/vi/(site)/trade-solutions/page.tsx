import { pageMetadata } from '@/next/seo';
import { TradeSolutionsView } from '@/views/trade-solutions/TradeSolutionsView';
import { tradeSolutionsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/trade-solutions', ...tradeSolutionsMeta('vi') });

export default function Page() {
  return <TradeSolutionsView lang="vi" />;
}
