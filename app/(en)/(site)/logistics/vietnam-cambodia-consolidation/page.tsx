import { pageMetadata } from '@/next/seo';
import { ConsolidationView } from '@/views/consolidation/ConsolidationView';
import { consolidationMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/logistics/vietnam-cambodia-consolidation', ...consolidationMeta('en') });

export default function Page() {
  return <ConsolidationView lang="en" />;
}
