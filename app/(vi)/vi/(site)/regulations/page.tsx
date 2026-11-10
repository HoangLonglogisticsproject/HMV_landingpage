import { pageMetadata } from '@/next/seo';
import { RegulationsView } from '@/views/regulations/RegulationsView';
import { regulationsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/regulations', ...regulationsMeta('vi') });

export default function Page() {
  return <RegulationsView lang="vi" />;
}
