import { pageMetadata } from '@/next/seo';
import { PackagingView } from '@/views/packaging-logistics/PackagingView';
import { packagingMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/packaging-logistics', ...packagingMeta('vi') });

export default function Page() {
  return <PackagingView lang="vi" />;
}
