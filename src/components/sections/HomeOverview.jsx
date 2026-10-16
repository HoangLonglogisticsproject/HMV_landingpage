import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy, products } from '@/data/hmv';
export function HomeOverview({ lang }) {
  const t = copy[lang];
  return (
    <section className="home-overview section-pad">
      <div className="content-width">
        <div className="overview-row">
          <span className="eyebrow">01 / {t.supply}</span>
          <div>
            <h2>{t.chainTitle}</h2>
            <p>
              {lang === 'vi'
                ? 'Vùng trồng → Chất lượng → Chế biến → Thị trường'
                : 'Origins → Quality → Processing → Markets'}
            </p>
          </div>
          <Button asChild variant="text" size="text">
            <Link to="/supply-chain">
              {t.more}
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="overview-row">
          <span className="eyebrow">02 / {t.trade}</span>
          <div>
            <h2>
              {lang === 'vi'
                ? 'Nông sản Việt. Tầm nhìn quốc tế.'
                : 'Vietnamese origins. Global perspective.'}
            </h2>
            <p>
              {lang === 'vi'
                ? 'Nông sản · Thương mại quốc tế'
                : 'Agriculture · International trade'}
            </p>
          </div>
          <Button asChild variant="text" size="text">
            <Link to="/trade-solutions">
              {t.more}
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="overview-row">
          <span className="eyebrow">
            03 / {lang === 'vi' ? 'NĂNG LƯỢNG' : 'ENERGY'}
          </span>
          <div>
            <h2>
              {lang === 'vi'
                ? 'Gió mở ra một hướng đi mới.'
                : 'A new direction, powered by wind.'}
            </h2>
            <p>
              {lang === 'vi'
                ? 'Điện gió trong hệ sinh thái HMV.'
                : 'Wind energy in the HMV ecosystem.'}
            </p>
          </div>
          <Button asChild variant="text" size="text">
            <Link to="/about">
              {t.more}
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
