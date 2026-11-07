import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Sprout,
  Leaf,
  CircleDot,
  Wheat,
  Flower2,
  Layers,
} from 'lucide-react';
import { copy, products } from '@/data/hmv';
import { productPhotos } from '@/data/productPhotos';
const icons = [Flower2, Leaf, Sprout, Wheat, CircleDot, Layers];
export function ProductPortfolio({ lang }) {
  const t = copy[lang];
  return (
    <section className="section-pad portfolio-section" id="products">
      <div className="content-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.productsLabel}</p>
            <h2 className="whitespace-pre-line">{t.productsTitle}</h2>
          </div>
          <p>{t.productsText}</p>
        </div>
        <div className="product-grid">
          {products.map((p, i) => {
            const Icon = icons[i];
            const photo = productPhotos[p.id];
            return (
              <Link
                className={`product-item ${photo ? 'product-with-photo' : ''}`}
                key={p.id}
                to={`/products/${p.id}`}
              >
                {photo && (
                  <img
                    className="product-photo"
                    src={photo.src}
                    width={photo.width}
                    height={photo.height}
                    loading="lazy"
                    decoding="async"
                    alt={lang === 'vi' ? photo.altVi : photo.altEn}
                  />
                )}
                <div className="product-top">
                  <Icon size={32} strokeWidth={1.4} />
                  <span>{p.category}</span>
                </div>
                <h3>{p[lang]}</h3>
                <p>{lang === 'vi' ? p.subVi : p.subEn}</p>
                <span className="product-link">
                  {t.more}
                  <ArrowUpRight size={19} />
                </span>
              </Link>
            );
          })}
        </div>
        <p className="commercial-note">{t.confirmed}</p>
      </div>
    </section>
  );
}
