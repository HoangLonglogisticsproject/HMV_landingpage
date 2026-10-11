import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { photos } from '@/data/hmv';

const posts = [
  { img: photos.farm, w: 1280, h: 960, cat: { vi: 'Thị trường EU', en: 'EU Market' }, date: { vi: 'Tháng 10, 2026', en: 'October 2026' }, title: { vi: 'Xuất khẩu Chanh dây sang Châu Âu: Tiêu chuẩn GlobalGAP và câu chuyện của HMV Global.', en: 'Exporting passion fruit to Europe: GLOBALG.A.P. standards and the HMV Global story.' }, alt: { vi: 'Vườn chanh dây Việt Nam', en: 'Vietnamese passion fruit farm' } },
  { img: photos.factory, w: 768, h: 1024, cat: { vi: 'Chuỗi cung ứng', en: 'Supply Chain' }, date: { vi: 'Tháng 9, 2026', en: 'September 2026' }, title: { vi: 'Tối ưu hóa logistics nông sản nhiệt đới: Giảm thiểu hao hụt từ Vườn đến Cảng.', en: 'Optimising tropical produce logistics: reducing losses from farm to port.' }, alt: { vi: 'Chuyến thăm cơ sở chế biến', en: 'Processing facility visit' } },
  { img: photos.farmTeam, w: 1308, h: 1600, cat: { vi: 'Phát triển bền vững', en: 'Sustainability' }, date: { vi: 'Tháng 9, 2026', en: 'September 2026' }, title: { vi: 'Mô hình nông nghiệp khép kín: Tầm nhìn 2030 của HMV Global.', en: 'A closed-loop agriculture model: HMV Global’s 2030 vision.' }, alt: { vi: 'Đội ngũ HMV tại vùng trồng', en: 'HMV team at the growing area' } },
];

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
            <Link key={p.title.en} to={`/${lang}/insights`} className="insight-card">
              <figure><img src={p.img} alt={p.alt[lang]} width={p.w} height={p.h} loading="lazy" decoding="async" /></figure>
              <div className="insight-meta"><span>{p.cat[lang]}</span><time>{p.date[lang]}</time></div>
              <h3>{p.title[lang]}</h3>
              <em>{vi ? 'Đọc thêm' : 'Read more'}<ArrowUpRight size={16} /></em>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
