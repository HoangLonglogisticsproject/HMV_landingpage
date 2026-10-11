import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { photos } from '@/data/hmv';
import macroOcean from '@/assets/hmv-macro-ocean.webp.asset.json';
import { productPhotos } from '@/data/productPhotos';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function CinematicHero({ lang }) {
  const go = () => document.getElementById('value-journey')?.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' });
  return (
    <header className="cine-hero">
      <img src={macroOcean.url} alt={lang === 'vi' ? 'Góc nhìn từ trên cao của tàu container trên đại dương xanh' : 'Aerial view of a container ship crossing the blue ocean'} width={2400} height={1729} fetchPriority="high" decoding="async" />
      <div className="cine-shade" />
      <div className="cine-inner content-width">
        <p className="cine-kicker">HMV GLOBAL · VIETNAM → EUROPE & USA</p>
        <h1>HMV GLOBAL</h1>
        <p className="cine-sub" lang="en"><span>Premium Agri-Commodities.</span><span>Seamless Integrated Supply Chain.</span></p>
        <Button type="button" variant="secondary" size="lg" className="cine-cta" onClick={go}>{lang === 'vi' ? 'Khám phá hệ sinh thái' : 'Explore Our Ecosystem'}<ArrowDown size={18} /></Button>
      </div>
      <p className="cine-credit">{lang === 'vi' ? 'Ảnh minh họa thương mại toàn cầu' : 'Global trade stock imagery'} · <a href="https://unsplash.com/photos/an-aerial-view-of-a-cargo-ship-in-the-ocean-0A7YwYhZhWw" target="_blank" rel="noopener noreferrer">Bent Van Aeken / Unsplash</a></p>
    </header>
  );
}

const steps = [
  { src: photos.farm, w: 1280, h: 960, en: ['Origins', 'Direct, farm-level connections with Vietnamese growers.'], vi: ['Vùng trồng', 'Kết nối trực tiếp với người trồng tại vùng nguyên liệu.'] },
  { src: photos.fruitWeighing, w: 960, h: 1280, en: ['Quality Control', 'Products checked against the buyer’s specification.'], vi: ['Kiểm soát chất lượng', 'Kiểm tra sản phẩm theo quy cách của người mua.'] },
  { src: photos.factory, w: 768, h: 1024, en: ['Global Trade', 'Processing partners, documentation and delivery coordinated for export.'], vi: ['Thương mại toàn cầu', 'Điều phối đối tác chế biến, chứng từ và giao hàng xuất khẩu.'] },
];

export function ValueJourney({ lang }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))), { rootMargin: '-45% 0px -45% 0px' });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <section id="value-journey" className="journey-split">
      <div className="content-width journey-grid">
        <div className="journey-sticky">
          <p className="eyebrow">{lang === 'vi' ? 'HÀNH TRÌNH GIÁ TRỊ' : 'THE VALUE JOURNEY'}</p>
          <ol>
            {steps.map((s, i) => (
              <li key={i} className={active === i ? 'on' : ''}>
                <span>0{i + 1}</span>
                <div><h3>{s[lang][0]}</h3><p>{s[lang][1]}</p></div>
              </li>
            ))}
          </ol>
          <Link className="text-link" to={`/${lang}/supply-chain`}>{lang === 'vi' ? 'Xem toàn bộ chuỗi cung ứng' : 'See the full supply chain'}<ArrowUpRight size={18} /></Link>
        </div>
        <div className="journey-media">
          {steps.map((s, i) => (
            <figure key={i} data-i={i} ref={(el) => (refs.current[i] = el)} className={active === i ? 'on' : ''}>
              <img src={s.src} alt={s[lang][0]} width={s.w} height={s.h} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const commodities = [
  { id: 'passion-fruit', en: 'Passion Fruit', vi: 'Chanh dây', size: 'c-tall' },
  { id: 'bananas', en: 'Cavendish Bananas', vi: 'Chuối Cavendish', size: 'c-wide' },
  { id: 'spices', en: 'Spices', vi: 'Gia vị', size: '' },
  { id: 'tapioca-starch', en: 'Tapioca Starch', vi: 'Tinh bột sắn', size: '' },
];

export function CoreCommodities({ lang }) {
  return (
    <section className="section-pad commodities" id="featured-products">
      <div className="content-width">
        <div className="section-heading">
          <div><p className="eyebrow">{lang === 'vi' ? 'NÔNG SẢN CHỦ LỰC' : 'CORE COMMODITIES'}</p><h2>{lang === 'vi' ? 'Ít hơn. Nhưng đúng.' : 'Fewer products. Done right.'}</h2></div>
          <Link className="text-link" to={`/${lang}/trade-solutions`}>{lang === 'vi' ? 'Tất cả sản phẩm' : 'All products'}<ArrowUpRight size={18} /></Link>
        </div>
        <div className="commodity-grid">
          {commodities.map((c) => {
            const p = productPhotos[c.id];
            return (
              <Link key={c.id} to={`/${lang}/products/${c.id}`} className={`commodity ${c.size}`}>
                <img src={p.src} alt={lang === 'vi' ? p.altVi : p.altEn} width={p.width} height={p.height} loading="lazy" decoding="async" />
                <span className="commodity-label"><strong>{c[lang]}</strong><em>{lang === 'vi' ? 'Xem quy cách' : 'View Specs'}<ArrowUpRight size={16} /></em></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function GlobalReach({ lang }) {
  const vn = [742, 262];
  const dest = [[478, 150, 'EUROPE'], [210, 180, 'USA']];
  const trust = lang === 'vi'
    ? ['Chuỗi cung ứng xuyên suốt', 'Kiểm soát chất lượng chặt chẽ', 'Điều phối chứng từ xuất khẩu', 'Một đầu mối thương mại']
    : ['End-to-End Supply Chain', 'Strict Quality Control', 'Export Documentation Coordination', 'One Commercial Point of Contact'];
  return (
    <section className="global-reach">
      <div className="content-width">
        <p className="eyebrow">{lang === 'vi' ? 'TẦM VƯƠN TOÀN CẦU' : 'GLOBAL REACH'}</p>
        <h2>{lang === 'vi' ? 'Từ Việt Nam đến châu Âu & Hoa Kỳ.' : 'From Vietnam to Europe & the USA.'}</h2>
        <svg viewBox="0 0 900 380" className="reach-map" role="img" aria-label={lang === 'vi' ? 'Kết nối từ Việt Nam đến châu Âu và Hoa Kỳ' : 'Connections from Vietnam to Europe and the USA'}>
          <defs><pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" className="map-dot" /></pattern></defs>
          <path className="map-land" fill="url(#dots)" d="M90 110 C150 60 290 70 330 120 C350 170 300 220 250 240 C220 300 190 330 170 340 C150 280 120 230 90 200 Z M420 90 C470 60 560 70 600 100 C700 80 820 110 850 170 C830 230 760 270 720 280 C680 250 640 220 600 230 C560 260 540 330 500 340 C470 290 470 230 440 200 C420 160 410 120 420 90 Z" />
          {dest.map(([x, y, l]) => (
            <g key={l}>
              <path className="map-arc" d={`M${vn[0]} ${vn[1]} Q ${(vn[0] + x) / 2} ${Math.min(y, vn[1]) - 120} ${x} ${y}`} />
              <circle cx={x} cy={y} r="5" className="map-node" /><text x={x} y={y - 14} className="map-label">{l}</text>
            </g>
          ))}
          <circle cx={vn[0]} cy={vn[1]} r="7" className="map-node origin" /><text x={vn[0] + 12} y={vn[1] + 22} className="map-label">VIETNAM</text>
        </svg>
        <ul className="trust-list">{trust.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="reach-note">{lang === 'vi' ? 'Bản đồ minh họa thị trường mục tiêu, không phải tuyến hàng đã vận hành.' : 'Illustrative target markets, not a record of operated routes.'}</p>
      </div>
    </section>
  );
}
