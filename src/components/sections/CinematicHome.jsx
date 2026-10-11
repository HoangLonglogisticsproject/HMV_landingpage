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
            <Link className="text-link" to={`/${lang}/contact`}>{vi ? 'Yêu cầu báo giá' : 'Request a quote'}<ArrowUpRight size={18} /></Link>
          </div>
        </div>
        <div className="day-visual">
          <img className="day-farm" src={photos.farm} alt={vi ? 'Vườn chanh dây dưới nắng tại Việt Nam' : 'Sunlit passion fruit farm in Vietnam'} width={1280} height={960} fetchPriority="high" decoding="async" />
          <figure className="day-ocean glass"><img src={macroOcean.url} alt={vi ? 'Tàu container chở nông sản trên đại dương xanh' : 'Container ship carrying agricultural cargo across the blue ocean'} width={2400} height={1729} loading="lazy" decoding="async" /><figcaption>{vi ? 'Từ vườn đến cảng' : 'Farm to port'}</figcaption></figure>
          <div className="day-chip glass"><strong>01</strong>{vi ? 'Vùng trồng Việt Nam' : 'Vietnamese origins'}</div>
        </div>
      </div>
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
  const nodes = lang === 'vi'
    ? [['Vùng trồng', 'Kết nối người trồng, quy cách và mùa vụ.'], ['Chế biến', 'Đối tác sơ chế, đóng gói hoặc chế biến theo yêu cầu.'], ['Cảng xuất', 'Chứng từ và điều phối giao hàng xuất khẩu.']]
    : [['Farm', 'Grower sourcing, specification and season planning.'], ['Processing', 'Partner packing or processing to buyer requirements.'], ['Port', 'Export documentation and delivery coordination.']];
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
        <ol className="chain-nodes">{nodes.map((n, i) => <li key={n[0]} tabIndex={0} className="glass"><span>0{i + 1}</span><strong>{n[0]}</strong><em role="tooltip">{n[1]}</em></li>)}</ol>
        <ul className="trust-list">{trust.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="reach-note">{lang === 'vi' ? 'Bản đồ minh họa thị trường mục tiêu, không phải tuyến hàng đã vận hành.' : 'Illustrative target markets, not a record of operated routes.'}</p>
      </div>
    </section>
  );
}

const sampleReviews = [
  ['John D.', { vi: 'Nhập khẩu nông sản (Đức)', en: 'Agri-produce importer (Germany)' }, { vi: 'HMV Global cung cấp chất lượng chanh dây cực kỳ ổn định. Chuỗi cung ứng của họ giúp chúng tôi an tâm tuyệt đối.', en: 'HMV Global delivers remarkably consistent passion fruit quality. Their supply chain gives us complete peace of mind.' }],
  ['Sarah W.', { vi: 'Chuỗi siêu thị (Mỹ)', en: 'Supermarket chain (USA)' }, { vi: 'Truy xuất nguồn gốc rõ ràng và quy trình đóng gói chuyên nghiệp. Đối tác chiến lược đáng tin cậy.', en: 'Clear traceability and professional packing. A strategic partner we can rely on.' }],
  ['Marc L.', { vi: 'Nhà phân phối trái cây (Pháp)', en: 'Fruit distributor (France)' }, { vi: 'Trao đổi nhanh, quy cách rõ ràng và phản hồi đúng hẹn ở mọi khâu.', en: 'Fast communication, clear specifications and on-time responses at every step.' }],
  ['Emma K.', { vi: 'Nhà sản xuất thực phẩm (Hà Lan)', en: 'Food manufacturer (Netherlands)' }, { vi: 'Một đầu mối duy nhất cho nguồn hàng, chứng từ và giao hàng — đúng điều chúng tôi cần.', en: 'One point of contact for sourcing, documents and delivery — exactly what we needed.' }],
];

export function PartnerCommunity({ lang }) {
  const vi = lang === 'vi';
  const row = [...sampleReviews, ...sampleReviews];
  return (
    <section className="partner-community section-pad" aria-labelledby="partner-title">
      <div className="content-width">
        <p className="eyebrow">{vi ? 'CỘNG ĐỒNG ĐỐI TÁC' : 'PARTNER COMMUNITY'}</p>
        <h2 id="partner-title">{vi ? 'Cộng đồng Đối tác' : 'Partner Community'}</h2>
        <p className="sample-badge">{vi ? 'Nội dung mẫu minh họa — sẽ thay bằng đánh giá thật của đối tác' : 'Sample placeholder content — to be replaced with real partner reviews'}</p>
      </div>
      <div className="marquee"><div className="marquee-track">
        {row.map(([n, r, q], i) => (
          <figure key={i} className="review-card" aria-hidden={i >= sampleReviews.length || undefined}>
            <blockquote>“{q[lang]}”</blockquote>
            <figcaption><span className="review-avatar">{n[0]}</span><span><strong>{n}</strong><em>{r[lang]}</em></span></figcaption>
          </figure>
        ))}
      </div></div>
    </section>
  );
}
