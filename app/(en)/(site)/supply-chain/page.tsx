import { pageMetadata } from '@/next/seo';
import { SupplyChainView } from '@/views/supply-chain/SupplyChainView';
import { supplyChainMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/supply-chain', ...supplyChainMeta('en') });

export default function Page() {
  return <SupplyChainView lang="en" />;
}
