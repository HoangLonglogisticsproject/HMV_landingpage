import { pageMetadata } from '@/next/seo';
import { PackagingView } from '@/views/packaging-logistics/PackagingView';
import { packagingMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/packaging-logistics', ...packagingMeta('en') });

export default function Page() {
  return <PackagingView lang="en" />;
}
