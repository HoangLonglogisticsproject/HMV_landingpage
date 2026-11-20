import { pageMetadata } from '@/next/seo';
import { ConsolidationView } from '@/views/consolidation/ConsolidationView';
import { consolidationMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/logistics/vietnam-cambodia-consolidation', ...consolidationMeta('vi') });

export default function Page() {
  return <ConsolidationView lang="vi" />;
}
