import { loadPage, sitePagePaths } from '@/next/content';
import { pageMetadata } from '@/next/seo';
import { AboutView } from '@/views/about/AboutView';
import { aboutMeta } from '@/views/meta';

// Not published in this language (CMS): the page explains it, with noindex. hreflang lists the published languages.
export async function generateMetadata() {
  const [state, languages] = await Promise.all([loadPage('about', 'vi'), sitePagePaths('/about')]);
  return pageMetadata({ lang: 'vi', path: '/about', languages, noindex: state.status !== 'ready', ...aboutMeta('vi', state) });
}

export default async function Page() {
  return <AboutView lang="vi" state={await loadPage('about', 'vi')} />;
}
