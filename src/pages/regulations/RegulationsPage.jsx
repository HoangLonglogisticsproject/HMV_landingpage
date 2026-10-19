import { DetailLayout } from '@/components/layout/DetailLayout';
import { Regulations } from '@/features/regulations/Regulations';
import { regulationCopy } from '@/data/regulations';
import { useLang } from '@/i18n/LanguageContext';

export function RegulationsPage() {
  const lang = useLang();
  const c = regulationCopy[lang];
  return (
    <DetailLayout lang={lang} title={c.title} description={c.intro}>
      <Regulations lang={lang} />
    </DetailLayout>
  );
}
