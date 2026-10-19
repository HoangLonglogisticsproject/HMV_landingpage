import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import macroOcean from '@/assets/hmv-macro-ocean.png';
import fruitFarmPhoto from '@/assets/fruitFarm.jpg';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function CinematicHero({ lang }) {
  const go = () => document.getElementById('value-journey')?.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' });
  const vi = lang === 'vi';
  return (
    <header className="day-hero">
      <div className="content-width day-grid">
        <div className="day-copy">
          <p className="day-kicker">HMV GLOBAL · VIETNAM → EUROPE & USA</p>
          {vi ? <h1>Bám rễ từ đất lành.<span>Vươn tầm ra thế giới.</span></h1> : <h1>Rooted in the land.<span>Connecting the world.</span></h1>}
          <p className="day-sub">{vi ? 'Nông sản cao cấp. Chuỗi cung ứng tích hợp liền mạch.' : 'Premium Agri-Commodities. Seamless Integrated Supply Chain.'}</p>
          <div className="day-actions">
            <Button type="button" size="lg" className="day-cta" onClick={go}>{vi ? 'Khám phá hệ sinh thái' : 'Explore Our Ecosystem'}<ArrowDown size={18} /></Button>
            <Link className="text-link" to="/contact">{vi ? 'Yêu cầu báo giá' : 'Request a quote'}<ArrowUpRight size={18} /></Link>
          </div>
        </div>
        <div className="day-visual">
          <img className="day-farm" src={fruitFarmPhoto} alt={vi ? 'Vườn chanh dây dưới nắng tại Việt Nam' : 'Sunlit passion fruit farm in Vietnam'} width={1280} height={960} fetchPriority="high" decoding="async" />
          <figure className="day-ocean glass"><img src={macroOcean} alt={vi ? 'Tàu container chở nông sản trên đại dương xanh' : 'Container ship carrying agricultural cargo across the blue ocean'} width={2400} height={1729} loading="lazy" decoding="async" /><figcaption>{vi ? 'Từ vườn đến cảng' : 'Farm to port'}</figcaption></figure>
          <div className="day-chip glass"><strong>01</strong>{vi ? 'Vùng trồng Việt Nam' : 'Vietnamese origins'}</div>
        </div>
      </div>
    </header>
  );
}
