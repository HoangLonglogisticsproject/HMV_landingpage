import { DetailLayout } from '@/components/layout/DetailLayout';
import { Regulations } from '@/features/regulations/Regulations';
import { ArticleGrid } from '@/features/articles/ArticleGrid';
import { useArticleList } from '@/features/articles/hooks';
import { useLang } from '@/i18n/LanguageContext';

export function InsightsPage() {
  const lang = useLang();
  // ponytail: first 100 (the CMS maximum page size); add pagination UI when EcoNews outgrows it.
  const state = useArticleList(lang, { pageSize: 100 });
  return (
    <DetailLayout
      lang={lang}
      title="EcoNews"
      description={
        lang === 'vi'
          ? 'Bản tin EcoNews: Góc nhìn về chuỗi cung ứng xanh, năng lượng điện gió và nông nghiệp xuất khẩu bền vững.'
          : 'EcoNews: Perspectives on green supply chains, clean energy, and sustainable agriculture.'
      }
    >
      <section className="section-pad">
        <div className="content-width">
          <ArticleGrid state={state} lang={lang} />
        </div>
      </section>
      <Regulations lang={lang} limit={3} />
    </DetailLayout>
  );
}
