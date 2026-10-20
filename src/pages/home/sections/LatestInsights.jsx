import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ArticleGrid } from '@/features/articles/ArticleGrid';
import { useArticleList } from '@/features/articles/hooks';

export function LatestInsights({ lang }) {
  const vi = lang === 'vi';
  const state = useArticleList(lang, { pageSize: 3 });
  return (
    <section
      className="insights-home section-pad"
      aria-labelledby="insights-title"
    >
      <div className="content-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">HMV ECONEWS</p>
            <h2 id="insights-title">EcoNews</h2>
          </div>
          <Link className="text-link" to="/insights">
            {vi ? 'Xem tất cả EcoNews' : 'All EcoNews articles'}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <ArticleGrid state={state} lang={lang} />
      </div>
    </section>
  );
}
