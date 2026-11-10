import { pageMetadata } from '@/next/seo';
import { ContactView } from '@/views/contact/ContactView';
import { contactMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/contact', ...contactMeta('vi') });

export default function Page() {
  return <ContactView lang="vi" />;
}
