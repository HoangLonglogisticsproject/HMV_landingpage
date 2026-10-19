import { DetailLayout } from '@/components/layout/DetailLayout';
import { copy } from '@/data/hmv';
import { useLang } from '@/i18n/LanguageContext';
import { CompanyStory } from './CompanyStory';

export function AboutPage() {
  const lang = useLang();
  const t = copy[lang];
  return (
    <DetailLayout lang={lang} title={t.about} description={t.storyText}>
      <CompanyStory lang={lang} full />
    </DetailLayout>
  );
}
