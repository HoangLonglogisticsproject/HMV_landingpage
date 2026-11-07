import { bundledPage } from '@/features/pages/bundled';
import { pageMetadata } from '@/next/seo';
import { AboutView } from '@/views/about/AboutView';
import { aboutMeta } from '@/views/meta';

// ponytail: bundled copy only (CMS_CONTENT stays off); the server CMS transport comes with the CMS PR.
const state = bundledPage('about', 'en');

export const metadata = pageMetadata({ lang: 'en', path: '/about', ...aboutMeta('en', state) });

export default function Page() {
  return <AboutView lang="en" state={state} />;
}
