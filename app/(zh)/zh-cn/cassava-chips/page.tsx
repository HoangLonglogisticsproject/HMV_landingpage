import { cassavaChina } from '@/data/cassavaChina';
import { pageMetadata } from '@/next/seo';
import { CassavaChinaView } from '@/views/products/CassavaChinaView';

// The dried cassava chips page in Simplified Chinese: one hreflang set with its EN and VI versions.
export const metadata = pageMetadata({ lang: 'zh-CN', path: '/products/dried-cassava-chips', ...cassavaChina.seo });

export default function Page() {
  return <CassavaChinaView />;
}
