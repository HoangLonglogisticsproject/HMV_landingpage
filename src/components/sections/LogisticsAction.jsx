import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy } from '@/data/hmv';
import { logisticsActivities } from '@/data/logisticsActivities';

export function LogisticsAction({ lang }) {
  const vi = lang === 'vi';
  const t = copy[lang];
  return (
    <section className="section-pad logistics-action" id="logistics-action">
      <div className="content-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{vi ? 'LOGISTICS TRONG THỰC TẾ' : 'LOGISTICS IN ACTION'}</p>
            <h2>{vi ? 'Hiện trường vận hành.' : 'On the ground.'}</h2>
          </div>
          <div>
            <p>
              {vi
                ? 'Hình ảnh thực tế từ cảng, bãi container, nhà máy và phòng điều hành — nơi từng lô hàng được khảo sát, soi chiếu, đóng gói và lên kế hoạch giao nhận.'
                : 'Real moments from ports, container depots, factories and the planning room — where each shipment is inspected, scanned, packed and scheduled.'}
            </p>
            <Button asChild variant="text" size="text">
              <Link to={`/${lang}/logistics`}>
                {vi ? 'Dịch vụ Logistics' : 'Logistics services'}
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
        <div className="logistics-action-grid">
          {logisticsActivities.map((p, i) => (
            <figure key={p.src}>
              <div className="logistics-action-photo">
                <img
                  src={p.src}
                  alt={p[lang]}
                  width={p.width}
                  height={p.height}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>
                <span>{p[lang]}</span>
                <span>0{i + 1}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="commercial-note">{t.photoNote}</p>
      </div>
    </section>
  );
}
