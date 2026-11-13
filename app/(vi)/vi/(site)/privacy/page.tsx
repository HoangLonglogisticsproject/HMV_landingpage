import { pageMetadata } from '@/next/seo';
import { PrivacyView } from '@/views/privacy/PrivacyView';
import { privacyMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/privacy', ...privacyMeta('vi') });

export default function Page() {
  return <PrivacyView lang="vi" />;
}
