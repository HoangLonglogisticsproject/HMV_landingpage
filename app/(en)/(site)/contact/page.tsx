import { pageMetadata } from '@/next/seo';
import { ContactView } from '@/views/contact/ContactView';
import { contactMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/contact', ...contactMeta('en') });

export default function Page() {
  return <ContactView lang="en" />;
}
