import { DetailLayout } from '@/components/layout/DetailLayout';
import { Regulations } from '@/features/regulations/Regulations';
import { ArticleGrid } from '@/features/articles/ArticleGrid';
import { insightsMeta } from '../meta';

// ponytail: first 100 (the CMS maximum page size); add pagination UI when EcoNews outgrows it.
export const INSIGHTS_PAGE_SIZE = 100;

// EcoNews page body, shared by both builds. `articles` is the EcoNews list state (bundled, or the CMS in CMS mode).
export function InsightsView({ lang, articles }) {
  return (
    <DetailLayout lang={lang} {...insightsMeta(lang)}>
      <section className="section-pad">
        <div className="content-width">
          <ArticleGrid state={articles} lang={lang} aboveFold />
        </div>
      </section>
      <Regulations lang={lang} limit={3} />
    </DetailLayout>
  );
}
