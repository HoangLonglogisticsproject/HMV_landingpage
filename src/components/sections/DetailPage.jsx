import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageMeta } from '@/components/common/PageMeta';
import { CompanyStory } from './CompanyStory';
import { SupplyChainPillars } from './SupplyChainPillars';
import { Operations } from './Operations';
import { Features } from './Features';
import { Activities } from './Activities';
import { LogisticsAction } from './LogisticsAction';
import { Contact } from './Contact';
import { Regulations } from './Regulations';
import { regulationCopy } from '@/data/regulations';
import { copy, products, stages } from '@/data/hmv';
import { productPhotos } from '@/data/productPhotos';
import { photoCopy } from '@/data/hmv';
import { articles, articleSlug } from '@/data/articles';
import { photos } from '@/data/hmv';
export function DetailPage({ lang, page }) {
  const { id } = useParams();
  const t = copy[lang];
  const product = products.find(p => p.id === id);
  const photo = productPhotos[id];
  const title =
    page === 'about'
      ? t.about
      : page === 'supply-chain'
        ? t.supply
        : page === 'trade-solutions'
          ? t.trade
          : page === 'activities'
            ? t.activities
            : page === 'contact'
              ? t.contact
              : page === 'insights'
                ? 'EcoNews'
                : page === 'regulations'
                  ? regulationCopy[lang].title
                  : product?.[lang] || t.notfound;
  const description =
    page === 'activities'
      ? t.fieldText
      : page === 'contact'
        ? t.contactText
        : page === 'about'
          ? t.storyText
          : page === 'regulations'
            ? regulationCopy[lang].intro
            : page === 'insights'
              ? lang === 'vi'
                ? 'Bản tin EcoNews: Góc nhìn về chuỗi cung ứng xanh, năng lượng điện gió và nông nghiệp xuất khẩu bền vững.'
                : 'EcoNews: Perspectives on green supply chains, clean energy, and sustainable agriculture.'
              : page === 'product' && product
                ? lang === 'vi'
                  ? product.subVi
                  : product.subEn
                : t.chainText;
  return (
    <>
      <PageMeta lang={lang} title={title} description={description} />
      <header className="detail-heading">
        <div className="content-width">
          <Link className="back-link" to="/">
            <ArrowLeft size={15} />
            {t.back}
          </Link>
          <p className="eyebrow">HMV GLOBAL · CONNECTING THE WORLD</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      {page === 'about' && <CompanyStory lang={lang} full />}
      {page === 'supply-chain' && (
        <>
          <SupplyChainPillars lang={lang} />
          <Operations lang={lang} full />
        </>
      )}
      {page === 'trade-solutions' && (
        <>
          <section className="section-pad">
            <div className="content-width">
              <p className="eyebrow">{t.businessLabel}</p>
              <h2>{t.businessTitle}</h2>
              <p className="body-copy">{t.businessText}</p>
              <div className="business-grid">
                {[stages[1], stages[3], stages[2], stages[4]].map(s => (
                  <article key={s.id}>
                    <h3>{s[lang]}</h3>
                    <p>{lang === 'vi' ? s.viText : s.enText}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <Features lang={lang} />
        </>
      )}
      {page === 'insights' && (
        <section className="section-pad">
          <div className="content-width">
            <div className="insight-grid">
              {articles.map(p => (
                <Link
                  key={p.id}
                  to={`/blog/${articleSlug(p)}`}
                  className="insight-card"
                >
                  <figure>
                    <img
                      src={photos[p.image]}
                      alt={p.alt[lang]}
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                  <div className="insight-meta">
                    <span>{p.category[lang]}</span>
                    <time dateTime={p.iso}>{p.date[lang]}</time>
                  </div>
                  <h3>{p.title[lang]}</h3>
                  <em>
                    {lang === 'vi' ? 'Đọc tiếp' : 'Read more'}
                    <ArrowUpRight size={16} />
                  </em>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {page === 'insights' && <Regulations lang={lang} limit={3} />}
      {page === 'regulations' && <Regulations lang={lang} />}
      {page === 'activities' && (
        <>
          <Activities lang={lang} full />
          <LogisticsAction lang={lang} />
        </>
      )}
      {page === 'contact' && <Contact lang={lang} full />}
      {page === 'product' && product && (
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
      {page !== 'contact' && <Contact lang={lang} />}
    </>
  );
}
