import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import fruitFarmPhoto from '@/assets/fruitFarm.jpg';
import journeyWeighing from '@/assets/fruitWeighing.jpg';
import journeyFactory from '@/assets/visitfactory.jfif';

const steps = [
  { src: fruitFarmPhoto, w: 1280, h: 960, en: ['Origins', 'Direct, farm-level connections with Vietnamese growers.'], vi: ['Vùng trồng', 'Kết nối trực tiếp với người trồng tại vùng nguyên liệu.'] },
  { src: journeyWeighing, w: 960, h: 1280, en: ['Quality Control', 'Products checked against the buyer’s specification.'], vi: ['Kiểm soát chất lượng', 'Kiểm tra sản phẩm theo quy cách của người mua.'] },
  { src: journeyFactory, w: 838, h: 739, en: ['Global Trade', 'Processing partners, documentation and delivery coordinated for export.'], vi: ['Thương mại toàn cầu', 'Điều phối đối tác chế biến, chứng từ và giao hàng xuất khẩu.'] },
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
          <Link className="text-link" to="/supply-chain">{lang === 'vi' ? 'Xem toàn bộ chuỗi cung ứng' : 'See the full supply chain'}<ArrowUpRight size={18} /></Link>
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
