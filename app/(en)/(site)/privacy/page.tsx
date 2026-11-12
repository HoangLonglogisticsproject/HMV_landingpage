import { pageMetadata } from '@/next/seo';
import { PrivacyView } from '@/views/privacy/PrivacyView';
import { privacyMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/privacy', ...privacyMeta('en') });

export default function Page() {
  return <PrivacyView lang="en" />;
}
