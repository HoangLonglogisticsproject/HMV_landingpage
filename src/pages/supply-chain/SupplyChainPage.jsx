import { DetailLayout } from '@/components/layout/DetailLayout';
import { copy } from '@/data/hmv';
import { useLang } from '@/i18n/LanguageContext';
import { SupplyChainPillars } from './SupplyChainPillars';
import { Operations } from './Operations';

export function SupplyChainPage() {
  const lang = useLang();
  const t = copy[lang];
  return (
    <DetailLayout lang={lang} title={t.supply} description={t.chainText}>
      <SupplyChainPillars lang={lang} />
      <Operations lang={lang} full />
    </DetailLayout>
  );
}
