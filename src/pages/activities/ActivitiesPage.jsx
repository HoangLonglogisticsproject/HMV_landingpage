import { DetailLayout } from '@/components/layout/DetailLayout';
import { copy } from '@/data/hmv';
import { useLang } from '@/i18n/LanguageContext';
import { Activities } from './Activities';
import { LogisticsAction } from './LogisticsAction';

export function ActivitiesPage() {
  const lang = useLang();
  const t = copy[lang];
  return (
    <DetailLayout lang={lang} title={t.activities} description={t.fieldText}>
      <Activities lang={lang} full />
      <LogisticsAction lang={lang} />
    </DetailLayout>
  );
}
