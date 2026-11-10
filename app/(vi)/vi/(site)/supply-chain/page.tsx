import { pageMetadata } from '@/next/seo';
import { SupplyChainView } from '@/views/supply-chain/SupplyChainView';
import { supplyChainMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/supply-chain', ...supplyChainMeta('vi') });

export default function Page() {
  return <SupplyChainView lang="vi" />;
}
