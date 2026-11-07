import { bundledPage } from '@/features/pages/bundled';
import { pageMetadata } from '@/next/seo';
import { AboutView } from '@/views/about/AboutView';
import { aboutMeta } from '@/views/meta';

// ponytail: bundled copy only (CMS_CONTENT stays off); the server CMS transport comes with the CMS PR.
const state = bundledPage('about', 'vi');

export const metadata = pageMetadata({ lang: 'vi', path: '/about', ...aboutMeta('vi', state) });

export default function Page() {
  return <AboutView lang="vi" state={state} />;
}
