import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { photos } from '@/data/hmv';
import { articles } from '@/data/articles';
const dims = { farm: [1280, 960], factory: [768, 1024], farmTeam: [1308, 1600] };

const posts = articles.map((a) => ({ ...a, img: photos[a.image], w: dims[a.image][0], h: dims[a.image][1] }));

export function LatestInsights({ lang }) {
  const vi = lang === 'vi';
  return (
    <section className="insights-home section-pad" aria-labelledby="insights-title">
      <div className="content-width">
        <div className="section-heading">
          <div><p className="eyebrow">{vi ? 'LATEST INSIGHTS' : 'LATEST INSIGHTS'}</p><h2 id="insights-title">{vi ? 'Tin tức & Insights' : 'News & Insights'}</h2></div>
          <Link className="text-link" to={`/${lang}/insights`}>{vi ? 'Tất cả bài viết' : 'All articles'}<ArrowUpRight size={18} /></Link>
        </div>
        <div className="insight-grid">
          {posts.map((p) => (
            <Link key={p.id} to={`/${lang}/blog/${p.slug[lang]}`} className="insight-card">
              <figure><img src={p.img} alt={p.alt[lang]} width={p.w} height={p.h} loading="lazy" decoding="async" /></figure>
              <div className="insight-meta"><span>{p.category[lang]}</span><time dateTime={p.iso}>{p.date[lang]}</time></div>
              <h3>{p.title[lang]}</h3>
              <em>{vi ? 'Đọc thêm' : 'Read more'}<ArrowUpRight size={16} /></em>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
