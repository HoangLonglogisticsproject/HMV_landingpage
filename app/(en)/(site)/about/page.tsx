import { loadPage } from '@/next/content';
import { pageMetadata } from '@/next/seo';
import { AboutView } from '@/views/about/AboutView';
import { aboutMeta } from '@/views/meta';

// Not published in this language (CMS): the page explains it, with noindex.
export async function generateMetadata() {
  const state = await loadPage('about', 'en');
  return pageMetadata({ lang: 'en', path: '/about', noindex: state.status !== 'ready', ...aboutMeta('en', state) });
}

export default async function Page() {
  return <AboutView lang="en" state={await loadPage('about', 'en')} />;
}
