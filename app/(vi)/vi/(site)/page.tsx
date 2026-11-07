import { listBundledArticles } from '@/features/articles/bundled';
import { pageMetadata } from '@/next/seo';
import { HomeView } from '@/views/home/HomeView';
import { homeMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/', ...homeMeta('vi') });

export default function Page() {
  return <HomeView lang="vi" articles={listBundledArticles('vi', { pageSize: 3 })} />;
}
