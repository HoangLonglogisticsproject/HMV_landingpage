import { ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { Link } from '@/lib/navigation';
import { copy, stages, photoCopy } from '@/data/hmv';
import { productPhotos } from '@/data/productPhotos';
import { productPages } from '@/data/productPages';
import { productMeta } from '../meta';
import { ProductLanding } from './ProductLanding';
import Image from '@/lib/image';

// Product page body, shared by both builds. `product` is undefined for an unknown id on the Vite site only.
// Products with buyer-page content (data/productPages.js) get the full page; the others the generic one.
export function ProductView({ lang, product }) {
  const page = product && productPages[product.id];
  if (page) return <ProductLanding lang={lang} product={product} page={page} />;
  const t = copy[lang];
  const photo = product && productPhotos[product.id];
  return (
    <DetailLayout lang={lang} {...productMeta(lang, product)} title={product ? product[lang] : t.notfound}>
      {product && (
        <section className="section-pad">
          <div className="content-width product-detail">
            <div>
              {photo && (
                <figure className="product-detail-photo">
                  <Image
                    src={photo.src}
                    width={photo.width}
                    height={photo.height}
                    sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1280px) 45vw, 530px"
                    loading="eager"
                    fetchPriority="high"
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
