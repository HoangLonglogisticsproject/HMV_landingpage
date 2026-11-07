import { loadArticleList } from '@/next/content';
import { pageMetadata } from '@/next/seo';
import { LATEST_ARTICLES, HomeView } from '@/views/home/HomeView';
import { homeMeta, siteJsonLd } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/', ...homeMeta('en') });

export default async function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteJsonLd() }} />
      <HomeView lang="en" articles={await loadArticleList('en', LATEST_ARTICLES)} />
    </>
  );
}
