import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy, stages, photos, photoCopy } from '@/data/hmv';
export function Operations({ lang, full = false }) {
  const [active, setActive] = useState(0);
  const t = copy[lang];
  const item = stages[active];
  const captions = photoCopy[lang];
  const images = [
    {
      src: photos.farmTeam,
      label: captions.farmTeam,
      width: 1308,
      height: 1600,
    },
    { src: photos.farm, label: captions.farm, width: 1280, height: 960 },
    {
      src: photos.fruitWeighing,
      label: captions.weighing,
      width: 960,
      height: 1280,
    },
    { src: photos.factory, label: t.visit, width: 960, height: 1280 },
    {
      src: photos.discussion,
      label: t.materialVisit,
      width: 900,
      height: 1600,
    },
    { src: photos.opening, label: captions.opening, width: 1200, height: 1600 },
  ];
  const image = images[active];
  return (
    <section className="section-pad chain-section" id="supply">
      <div className="content-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.chainLabel}</p>
            <h2>{t.chainTitle}</h2>
          </div>
          <p>{t.chainText}</p>
        </div>
        <div className="chain-tabs" role="tablist" aria-label={t.supply}>
          {stages.map((s, i) => (
            <Button
              key={s.id}
              variant="ghost"
              role="tab"
              id={`tab-${s.id}`}
              aria-selected={active === i}
              aria-controls={`panel-${s.id}`}
              tabIndex={active === i ? 0 : -1}
              onKeyDown={e => {
                if (
                  ['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)
                ) {
                  e.preventDefault();
                  const next =
                    e.key === 'Home'
                      ? 0
                      : e.key === 'End'
                        ? 5
                        : (active + (e.key === 'ArrowRight' ? 1 : 5)) % 6;
                  setActive(next);
                  document.getElementById(`tab-${stages[next].id}`)?.focus();
                }
              }}
              onClick={() => setActive(i)}
              className={`chain-tab ${active === i ? 'selected' : ''}`}
            >
              <span className="stage-number">0{i + 1}</span>
              <span>{s[lang]}</span>
              <ChevronRight size={16} />
            </Button>
          ))}
        </div>
        <div
          className="chain-panel"
          role="tabpanel"
          id={`panel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          tabIndex={0}
        >
          <figure>
            <img
              src={image.src}
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
              alt={image.label}
            />
            <figcaption>{image.label}</figcaption>
            {item.id === 'origin' && (
              <img
                className="origin-inset"
                src={photos.grower}
                width={960}
                height={1280}
                loading="lazy"
                decoding="async"
                alt={captions.grower}
              />
            )}
          </figure>
          <div>
            <p className="eyebrow">0{active + 1} / 06</p>
            <h3>{item[lang]}</h3>
            <p className="stage-tagline">
              {lang === 'vi' ? item.shortVi : item.shortEn}
            </p>
            <p>{lang === 'vi' ? item.viText : item.enText}</p>
            {!full && (
              <Button asChild variant="text" size="text">
                <Link to={`/${lang}/supply-chain`}>
                  {t.detail}
                  <ArrowUpRight />
                </Link>
              </Button>
            )}
          </div>
        </div>
        <p className="commercial-note">{t.processNote}</p>
        {full && (
          <div className="stage-details">
            {stages.map((s, i) => (
              <article id={s.id} key={s.id}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{s[lang]}</h3>
                  <p>{lang === 'vi' ? s.viText : s.enText}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
