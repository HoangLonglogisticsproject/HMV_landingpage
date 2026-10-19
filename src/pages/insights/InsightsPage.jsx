import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { Regulations } from '@/features/regulations/Regulations';
import { photos } from '@/data/hmv';
import { articles, articleSlug } from '@/data/articles';
import { useLang } from '@/i18n/LanguageContext';

export function InsightsPage() {
  const lang = useLang();
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
          <div className="insight-grid">
            {articles.map(p => (
              <Link
                key={p.id}
                to={`/blog/${articleSlug(p)}`}
                className="insight-card"
              >
                <figure>
                  <img
                    src={photos[p.image]}
                    alt={p.alt[lang]}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <div className="insight-meta">
                  <span>{p.category[lang]}</span>
                  <time dateTime={p.iso}>{p.date[lang]}</time>
                </div>
                <h3>{p.title[lang]}</h3>
                <em>
                  {lang === 'vi' ? 'Đọc tiếp' : 'Read more'}
                  <ArrowUpRight size={16} />
                </em>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Regulations lang={lang} limit={3} />
    </DetailLayout>
  );
}
