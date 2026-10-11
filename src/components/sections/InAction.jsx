import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { photos } from '@/data/hmv';

// Bento grid of real HMV photographs; a unified grade keeps mixed lighting cohesive.
const blocks = [
  { key: 'field', size: 'bento-large', src: photos.farmTeam, w: 1308, h: 1600, en: 'Hands-on approach at the origin.', vi: 'Trực tiếp có mặt tại vùng nguyên liệu.' },
  { key: 'expand', size: 'bento-medium', src: photos.openingFlowers, w: 1199, h: 1600, en: 'Expanding our ecosystem & partnerships.', vi: 'Mở rộng hệ sinh thái & quan hệ đối tác.' },
  { key: 'network', size: 'bento-medium', src: photos.gathering, w: 1024, h: 768, en: 'Building lasting global relationships.', vi: 'Xây dựng quan hệ lâu dài.' },
  { key: 'team', size: 'bento-small', src: photos.forest, w: 1058, h: 770, en: 'A driven and united team.', vi: 'Một tập thể gắn kết.' },
];

export function InAction({ lang }) {
  return (
    <section className="section-pad in-action">
      <div className="content-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{lang === 'vi' ? 'HMV GLOBAL TRONG THỰC TẾ' : 'HMV GLOBAL IN ACTION'}</p>
            <h2>{lang === 'vi' ? 'Người thật. Việc thật.' : 'Real people. Real work.'}</h2>
          </div>
          <Button asChild variant="text" size="text"><Link to={`/${lang}/activities`}>{lang === 'vi' ? 'Tìm hiểu thêm' : 'Learn more'}<ArrowUpRight /></Link></Button>
        </div>
        <div className="bento-grid">
          {blocks.map((b) => (
            <figure key={b.key} className={`bento-item ${b.size}`}>
              <img src={b.src} alt={b[lang]} width={b.w} height={b.h} loading="lazy" decoding="async" />
              <figcaption>{b[lang]}</figcaption>
            </figure>
          ))}
        </div>
        <p className="commercial-note">{lang === 'vi' ? 'Ảnh do HMV cung cấp.' : 'Photos supplied by HMV.'}</p>
      </div>
    </section>
  );
}
