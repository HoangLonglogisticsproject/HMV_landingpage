'use client';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openTradeDesk } from '@/features/trade-desk/open';
import macroOcean from '@/assets/hmv-macro-ocean.webp';
import fruitFarmPhoto from '@/assets/fruitFarm.webp';
import Image from '@/lib/image';

export function CinematicHero({ lang }) {
  const vi = lang === 'vi';
  return (
    <header className="day-hero">
      <div className="content-width day-grid">
        <div className="day-copy">
          <p className="day-kicker">HMV GLOBAL · VIETNAM → EUROPE & USA</p>
          {vi ? <h1>Bám rễ từ đất lành.<span>Vươn tầm ra thế giới.</span></h1> : <h1>Rooted in the land.<span>Connecting the world.</span></h1>}
          <p className="day-sub">{vi ? 'Nông sản cao cấp. Chuỗi cung ứng tích hợp liền mạch.' : 'Premium Agri-Commodities. Seamless Integrated Supply Chain.'}</p>
          {/* The HMV Trade Desk is the primary conversion path; both open it. */}
          <div className="day-actions">
            <Button type="button" size="lg" className="day-cta" onClick={() => openTradeDesk({ source: 'home_hero' })}>{vi ? 'Nhận phương án cung ứng' : 'Request a Supply Plan'}<ArrowUpRight size={18} /></Button>
            <button type="button" className="text-link" onClick={() => openTradeDesk({ source: 'home_hero_secondary' })}>{vi ? 'Trao đổi yêu cầu với HMV' : 'Discuss Your Requirements'}<ArrowUpRight size={18} /></button>
          </div>
        </div>
        <div className="day-visual">
          {/* The LCP image. Its phone size, 420px, is a measured trade-off (architecture §11): its box is 372 CSS px and
              its cover crop paints 481. 481 made the LCP request 1080w (Lighthouse mobile LCP 4.1 s), the box width
              under-delivers on sharp phones; 420 keeps 750w at DPR 1.75 (3.5 s) and the full 1280 px source at DPR
              2.6-3, which tests/next/images.spec.js checks. Change it only with a new measurement. */}
          <Image className="day-farm" src={fruitFarmPhoto} alt={vi ? 'Vườn chanh dây dưới nắng tại Việt Nam' : 'Sunlit passion fruit farm in Vietnam'} width={1280} height={960} sizes="(max-width: 540px) 420px, (max-width: 900px) calc(100vw - 40px), 820px" loading="eager" fetchPriority="high" decoding="async" />
          <figure className="day-ocean glass"><Image src={macroOcean} alt={vi ? 'Tàu container chở nông sản trên đại dương xanh' : 'Container ship carrying agricultural cargo across the blue ocean'} width={2400} height={1729} sizes="(max-width: 900px) 48vw, (max-width: 1280px) 18vw, 230px" loading="lazy" decoding="async" /><figcaption>{vi ? 'Từ vườn đến cảng' : 'Farm to port'}</figcaption></figure>
          <div className="day-chip glass"><strong>01</strong>{vi ? 'Vùng trồng Việt Nam' : 'Vietnamese origins'}</div>
        </div>
      </div>
    </header>
  );
}
