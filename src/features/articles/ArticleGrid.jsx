import { Link } from '@/lib/navigation';
import { ArrowUpRight } from 'lucide-react';
import Image from '@/lib/image';

const copy = {
  en: { more: 'Read more', loading: 'Loading EcoNews…', empty: 'No EcoNews articles have been published yet.', error: 'EcoNews could not be loaded. Please try again later.' },
  vi: { more: 'Đọc thêm', loading: 'Đang tải EcoNews…', empty: 'Chưa có bài viết EcoNews nào được xuất bản.', error: 'Không thể tải EcoNews. Vui lòng thử lại sau.' },
};

// EcoNews cards for a useArticleList() state, shared by the home section and /insights.
export function ArticleGrid({ state, lang, aboveFold = false }) {
  const t = copy[lang];
  if (state.status === 'loading') {
    return (
      <div className="insight-grid" role="status" aria-busy="true">
        <span className="sr-only">{t.loading}</span>
        {[0, 1, 2].map(i => <div key={i} className="insight-card" aria-hidden="true"><figure /></div>)}
      </div>
    );
  }
  if (state.status !== 'ready') {
    const error = state.status === 'error';
    return <p className="insight-status" role={error ? 'alert' : undefined}>{error ? t.error : t.empty}</p>;
  }
  return (
    <div className="insight-grid">
      {state.items.map((p, i) => (
        <Link key={p.key} to={`/blog/${p.slug}`} className="insight-card">
          <figure>
            {p.image && <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) 46vw, 368px" loading={aboveFold && i === 0 ? 'eager' : 'lazy'} fetchPriority={aboveFold && i === 0 ? 'high' : undefined} decoding="async" />}
          </figure>
          <div className="insight-meta">
            <span>{p.category}</span>
            <time dateTime={p.date.iso}>{p.date.label}</time>
          </div>
          <h3>{p.title}</h3>
          <em>
            {t.more}
            <ArrowUpRight size={16} />
          </em>
        </Link>
      ))}
    </div>
  );
}
