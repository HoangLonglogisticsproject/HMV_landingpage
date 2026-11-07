import { pageMetadata } from '@/next/seo';
import { RegulationsView } from '@/views/regulations/RegulationsView';
import { regulationsMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/regulations', ...regulationsMeta('en') });

export default function Page() {
  return <RegulationsView lang="en" />;
}
