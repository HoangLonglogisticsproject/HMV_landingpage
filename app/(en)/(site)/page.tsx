import { listBundledArticles } from '@/features/articles/bundled';
import { pageMetadata } from '@/next/seo';
import { LATEST_ARTICLES, HomeView } from '@/views/home/HomeView';
import { homeMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/', ...homeMeta('en') });

export default function Page() {
  return <HomeView lang="en" articles={listBundledArticles('en', { pageSize: LATEST_ARTICLES })} />;
}
