import { loadArticleList } from '@/next/content';
import { pageMetadata } from '@/next/seo';
import { LATEST_ARTICLES, HomeView } from '@/views/home/HomeView';
import { homeMeta, siteJsonLd } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/', ...homeMeta('vi') });

export default async function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteJsonLd() }} />
      <HomeView lang="vi" articles={await loadArticleList('vi', LATEST_ARTICLES)} />
    </>
  );
}
