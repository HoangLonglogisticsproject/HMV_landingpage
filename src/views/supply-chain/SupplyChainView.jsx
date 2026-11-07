import { DetailLayout } from '@/components/layout/DetailLayout';
import { supplyChainMeta } from '../meta';
import { SupplyChainPillars } from './SupplyChainPillars';
import { Operations } from './Operations';

// Supply chain page body, shared by both builds.
export function SupplyChainView({ lang }) {
  return (
    <DetailLayout lang={lang} {...supplyChainMeta(lang)}>
      <SupplyChainPillars lang={lang} />
      <Operations lang={lang} full />
    </DetailLayout>
  );
}
