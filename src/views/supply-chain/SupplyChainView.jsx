import { DetailLayout } from '@/components/layout/DetailLayout';
import { copy } from '@/data/hmv';
import { supplyChainMeta } from '../meta';
import { SupplyChainPillars } from './SupplyChainPillars';
import { Operations } from './Operations';

// Supply chain page body, shared by both builds.
export function SupplyChainView({ lang }) {
  return (
    <DetailLayout lang={lang} {...supplyChainMeta(lang)} title={copy[lang].supply}>
      <SupplyChainPillars lang={lang} />
      <Operations lang={lang} full />
    </DetailLayout>
  );
}
