import { DetailLayout } from '@/components/layout/DetailLayout';
import { copy, stages } from '@/data/hmv';
import { tradeSolutionsMeta } from '../meta';
import { ProductPortfolio } from './ProductPortfolio';

// Trade solutions page body, shared by both builds.
export function TradeSolutionsView({ lang }) {
  const t = copy[lang];
  return (
    <DetailLayout lang={lang} {...tradeSolutionsMeta(lang)} title={t.trade}>
      <section className="section-pad">
        <div className="content-width">
          <p className="eyebrow">{t.businessLabel}</p>
          <h2>{t.businessTitle}</h2>
          <p className="body-copy">{t.businessText}</p>
          <div className="business-grid">
            {[stages[1], stages[3], stages[2], stages[4]].map(s => (
              <article key={s.id}>
                <h3>{s[lang]}</h3>
                <p>{lang === 'vi' ? s.viText : s.enText}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ProductPortfolio lang={lang} />
    </DetailLayout>
  );
}
