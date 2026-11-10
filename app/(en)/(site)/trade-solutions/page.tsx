import { pageMetadata } from '@/next/seo';
import { TradeSolutionsView } from '@/views/trade-solutions/TradeSolutionsView';
import { tradeSolutionsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/trade-solutions', ...tradeSolutionsMeta('en') });

export default function Page() {
  return <TradeSolutionsView lang="en" />;
}
