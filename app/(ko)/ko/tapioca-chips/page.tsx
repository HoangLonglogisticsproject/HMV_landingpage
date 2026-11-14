import { cassavaKorea } from '@/data/cassavaKorea';
import { pageMetadata } from '@/next/seo';
import { CassavaKoreaView } from '@/views/products/CassavaKoreaView';

// The dried cassava chips page in Korean (타피오카 칩): one hreflang set with its EN, VI and Chinese versions.
export const metadata = pageMetadata({ lang: 'ko', path: '/products/dried-cassava-chips', ...cassavaKorea.seo });

export default function Page() {
  return <CassavaKoreaView />;
}
