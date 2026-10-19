import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { productPhotos } from '@/data/productPhotos';

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
          <Link className="text-link" to="/trade-solutions">{lang === 'vi' ? 'Tất cả sản phẩm' : 'All products'}<ArrowUpRight size={18} /></Link>
        </div>
        <div className="commodity-grid">
          {commodities.map((c) => {
            const p = productPhotos[c.id];
            return (
              <Link key={c.id} to={`/products/${c.id}`} className={`commodity ${c.size}`}>
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
