import { loadArticleList } from '@/next/content';
import { pageMetadata } from '@/next/seo';
import { LATEST_ARTICLES, HomeView } from '@/views/home/HomeView';
import { homeMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/', ...homeMeta('vi') });

export default async function Page() {
  return <HomeView lang="vi" articles={await loadArticleList('vi', LATEST_ARTICLES)} />;
}
