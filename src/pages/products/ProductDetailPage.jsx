import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { copy, products, stages, photoCopy } from '@/data/hmv';
import { productPhotos } from '@/data/productPhotos';
import { useLang } from '@/i18n/LanguageContext';

export function ProductDetailPage() {
  const lang = useLang();
  const { id } = useParams();
  const t = copy[lang];
  const product = products.find(p => p.id === id);
  const photo = productPhotos[id];
  return (
    <DetailLayout
      lang={lang}
      title={product?.[lang] || t.notfound}
      description={
        product ? (lang === 'vi' ? product.subVi : product.subEn) : t.chainText
      }
    >
      {product && (
        <section className="section-pad">
          <div className="content-width product-detail">
            <div>
              {photo && (
                <figure className="product-detail-photo">
                  <img
                    src={photo.src}
                    width={photo.width}
                    height={photo.height}
                    loading="lazy"
                    decoding="async"
                    alt={lang === 'vi' ? photo.altVi : photo.altEn}
                  />
                  <figcaption>
                    {lang === 'vi' ? photo.sourceVi : photo.sourceEn}
                    {photo.sourceUrl && (
                      <>
                        {' '}
                        ·{' '}
                        <a
                          href={photo.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {photo.credit}
                        </a>
                        {photo.licenseUrl && (
                          <>
                            {' '}
                            ·{' '}
                            <a
                              href={photo.licenseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {lang === 'vi' ? 'Giấy phép' : 'License'}
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </figcaption>
                </figure>
              )}
              <p className="eyebrow">
                {t.productsLabel} / {product.category}
              </p>
              <h2>{t.specTitle}</h2>
              <p className="body-copy">{t.productsText}</p>
              <ul>
                {product.specs.map(s => (
                  <li key={s}>
                    <Check size={18} />
                    {s.split(' / ')[lang === 'vi' ? 1 : 0]}
                  </li>
                ))}
              </ul>
              <p className="commercial-note">{t.specNote}</p>
              <p className="commercial-note">{photoCopy[lang].organic}</p>
              <Button asChild size="lg" variant="brand">
                <Link to={`/contact?product=${encodeURIComponent(product.en)}`}>
                  {t.ask}
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
            <div className="product-route">
              <p className="eyebrow">{t.chainLabel}</p>
              {stages.map((s, i) => (
                <Link key={s.id} to={`/supply-chain#${s.id}`}>
                  <span>0{i + 1}</span>
                  {s[lang]}
                  <ArrowUpRight size={16} />
                </Link>
              ))}
              <p className="commercial-note">{t.confirmed}</p>
            </div>
          </div>
        </section>
      )}
    </DetailLayout>
  );
}
