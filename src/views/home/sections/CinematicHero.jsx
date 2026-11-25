'use client';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { focusQuickRfq } from '@/features/inquiries/focus';
import { openTradeDesk } from '@/features/trade-desk/open';
import { track } from '@/lib/analytics';
import macroOcean from '@/assets/hmv-macro-ocean.webp';
import fruitFarmPhoto from '@/assets/fruitFarm.webp';
import Image from '@/lib/image';

// The hero: what HMV is, its photography, and the buyer's first move, two lanes. The primary one (I know what I need)
// takes the buyer to the Quick RFQ, which is the section right below (views/home/HomeView, features/inquiries/
// HomeQuickRfq: never over the photograph); the secondary (I need help) opens the HMV Trade Desk.
export function CinematicHero({ lang }) {
  const vi = lang === 'vi';
  return (
    <header className="day-hero">
      <div className="content-width day-grid">
        <div className="day-copy min-[901px]:self-start">
          <p className="day-kicker">HMV GLOBAL · VIETNAM → EUROPE & USA</p>
          {vi ? <h1>Bám rễ từ đất lành.<span>Vươn tầm ra thế giới.</span></h1> : <h1>Rooted in the land.<span>Connecting the world.</span></h1>}
          <p className="day-sub">{vi ? 'Nông sản cao cấp. Chuỗi cung ứng tích hợp liền mạch.' : 'Premium Agri-Commodities. Seamless Integrated Supply Chain.'}</p>
          {/* The primary lane (I know what I need) takes the buyer to the Quick RFQ; the secondary (I need help) opens the HMV Trade Desk. */}
          <div className="day-actions">
            <Button type="button" size="lg" className="day-cta" onClick={() => { track('home_supply_plan_click', { source: 'hero', locale: lang }); focusQuickRfq(); }}>{vi ? 'Nhận phương án cung ứng' : 'Get Supply Proposal'}<ArrowRight size={18} /></Button>
            <button type="button" className="text-link" onClick={() => openTradeDesk({ source: 'home_hero_assisted' })}>{vi ? 'Cần tư vấn? Trao đổi với HMV Trade Desk' : 'Need guidance? Ask HMV Trade Desk'}<ArrowUpRight size={18} /></button>
          </div>
        </div>
        <div className="day-visual">
          {/* The LCP image. Up to 430px the stage is 280px tall (22-mobile-insights-footer.css), so the cover crop of this 4:3
              photograph paints 373 CSS px wide on the narrowest phones and the box on a 412px one (372). 365px is that
              width rounded down to the largest srcset step Lighthouse's phone (DPR 1.75) takes: 640w, 67 kB (lab LCP 2.3 s),
              instead of 750w, 78 kB (2.7 s) for the full 372: 2% fewer pixels than painted there, none at DPR 2 (750w) and
              DPR 3 (1200w), which tests/next/home-journey.desktop.spec.js checks. Wider screens use the box width.
              Change it only with a new measurement (architecture §11). */}
          <Image className="day-farm" src={fruitFarmPhoto} alt={vi ? 'Vườn chanh dây dưới nắng tại Việt Nam' : 'Sunlit passion fruit farm in Vietnam'} width={1280} height={960} sizes="(max-width: 430px) 365px, (max-width: 900px) calc(100vw - 40px), 820px" loading="eager" fetchPriority="high" decoding="async" />
          <figure className="day-ocean glass"><Image src={macroOcean} alt={vi ? 'Tàu container chở nông sản trên đại dương xanh' : 'Container ship carrying agricultural cargo across the blue ocean'} width={2400} height={1729} sizes="(max-width: 900px) 48vw, (max-width: 1280px) 18vw, 230px" loading="lazy" decoding="async" /><figcaption>{vi ? 'Từ vườn đến cảng' : 'Farm to port'}</figcaption></figure>
          <div className="day-chip glass"><strong>01</strong>{vi ? 'Vùng trồng Việt Nam' : 'Vietnamese origins'}</div>
        </div>
      </div>
    </header>
  );
}
