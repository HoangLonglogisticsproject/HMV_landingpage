import { ArrowDown, ArrowRight, CalendarDays, Gem, PackageOpen, ShieldCheck, Store } from 'lucide-react';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { PRODUCT_ID, passionFruitPages } from '@/data/passionFruitPages';
import { passionFruitMedia as media } from '@/data/passionFruitMedia';
import { Eyebrow, Faq, Figure, Numbered, Photo, SectionTitle, SegmentNav, ValueStrip } from './parts';
import styles from './PassionFruit.module.css';

// Premium Retail Business: product-led, on champagne cream and deep blue. The fruit's appearance and its presentation come
// before the farm. The hero is an AI-generated gift-carton concept, labelled as such; the packaging shown elsewhere is a market
// reference. Never an HMV pack, and there are no prices or shopping controls.

const VALUE_ICONS = [PackageOpen, Store, ShieldCheck, Gem, CalendarDays];

const title = cn(styles.heading, styles.display, 'font-semibold text-(--pf-ink)');
const solid = 'h-12 rounded-md bg-(--pf-accent) px-7 text-sm font-semibold text-[#f3efe3] hover:bg-(--pf-accent)/90';
const textLink = 'inline-flex min-h-11 items-center gap-2 border-b border-(--pf-gold) text-sm font-semibold text-(--pf-ink) no-underline outline-offset-4 outline-(--pf-ink) focus-visible:outline-2';

function Hero({ lang, c }) {
  const { hero } = c;
  const sentences = hero.title.split(/(?<=\.)\s+/);
  return (
    <header className="bg-(--pf-bg) pt-8 pb-10 sm:pt-12 sm:pb-14">
      <div className="content-width grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
        <div className="relative z-10">
          <Eyebrow className="flex items-center gap-3 text-(--pf-gold-ink)">
            <span aria-hidden="true" className="block h-px w-10 bg-(--pf-gold)" />
            {hero.eyebrow}
          </Eyebrow>
          <h1 className={cn(title, 'mt-5 text-[34px] leading-[1.12] sm:text-5xl lg:text-[50px]')}>
            {sentences.map((sentence, i) => (
              <span key={sentence} className={cn('block text-balance', i > 0 && 'text-(--pf-gold-ink)')}>{sentence} </span>
            ))}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-(--pf-muted) sm:text-lg">{hero.lead}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            <TradeDeskButton size="lg" product={PRODUCT_ID} segment="retail" source="pf_retail_hero" className={solid}>
              {hero.primary}
              <ArrowRight />
            </TradeDeskButton>
            <a href="#packaging" className={textLink}>
              {hero.secondary}
              <ArrowDown aria-hidden="true" size={16} />
            </a>
          </div>
        </div>
        <figure className="relative order-first m-0 lg:order-none">
          <div className={cn(styles.fadeLeft, 'aspect-[4/3] overflow-hidden bg-(--pf-soft)')}>
            <Photo photo={media.premiumPackaging} lang={lang} sizes="(max-width: 1023px) calc(100vw - 32px), 700px" eager />
          </div>
          <figcaption className="mt-2 text-xs leading-snug text-(--pf-muted) lg:text-right">{media.premiumPackaging.caption[lang]}</figcaption>
          {/* A different photograph and another view of the product: an open twelve-compartment carton, not a crop of the main image. */}
          <div className="absolute bottom-6 left-3 hidden aspect-[4/5] w-[22%] overflow-hidden rounded-xl border-4 border-(--pf-bg) shadow-sm sm:block lg:bottom-9 lg:-left-2">
            <Photo photo={media.carton} lang={lang} sizes="170px" />
          </div>
        </figure>
      </div>
    </header>
  );
}

function Presentation({ lang, c }) {
  const { presentation } = c;
  return (
    <section className="content-width grid gap-8 py-14 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
      <Figure photo={media.pile} lang={lang} ratio="aspect-[4/3]" className="lg:order-2" sizes="(max-width: 1023px) calc((100vw - 32px) * 1.3), 640px" />
      <div className="self-center lg:order-1">
        <Eyebrow className="text-(--pf-gold-ink)">{presentation.eyebrow}</Eyebrow>
        <SectionTitle className={cn(title, 'mt-4 text-[30px] sm:text-[38px]')}>{presentation.title}</SectionTitle>
        <p className="mt-5 text-base leading-relaxed text-(--pf-muted)">{presentation.text}</p>
        <dl className="m-0 mt-6">
          {presentation.facts.map(([term, value]) => (
            <div key={term} className="grid gap-x-6 border-t border-(--pf-line) py-3 last:border-b sm:grid-cols-[9rem_1fr]">
              <dt className="text-xs font-semibold text-(--pf-muted) uppercase">{term}</dt>
              <dd className="m-0 text-[15px] font-medium text-(--pf-ink)">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// The packaging references: the nets and display, and plain divided cartons (the twelve-compartment carton is in the hero), then what each shows. Third-party, so captioned as such.
function Packaging({ lang, c }) {
  const { packaging } = c;
  return (
    <section id="packaging" className="scroll-mt-4 bg-(--pf-soft) py-14 sm:py-20">
      <div className="content-width">
        <div className="max-w-2xl">
          <Eyebrow className="text-(--pf-gold-ink)">{packaging.eyebrow}</Eyebrow>
          <SectionTitle className={cn(title, 'mt-4 text-[30px] sm:text-[38px]')}>{packaging.title}</SectionTitle>
          <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{packaging.text}</p>
        </div>
        <div className="mt-10 grid items-start gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Figure photo={media.nets} lang={lang} ratio="aspect-square" sizes="(max-width: 767px) calc(100vw - 32px), 460px" />
          <Figure photo={media.neutralCartons} lang={lang} ratio="aspect-[4/3]" sizes="(max-width: 767px) calc(100vw - 32px), 640px" />
        </div>
        <ol className="m-0 mt-10 grid gap-x-10 gap-y-6 p-0 sm:grid-cols-3">
          {packaging.items.map((item, i) => <Numbered key={item.title} index={i} {...item} />)}
        </ol>
        <p className="mt-8 max-w-2xl text-sm text-(--pf-muted)">{packaging.note}</p>
      </div>
    </section>
  );
}

function Opportunities({ c }) {
  const { opportunities } = c;
  return (
    <section className="content-width py-14 sm:py-20">
      <Eyebrow className="text-(--pf-gold-ink)">{opportunities.eyebrow}</Eyebrow>
      <SectionTitle className={cn(title, 'mt-4 max-w-2xl text-[30px] sm:text-[38px]')}>{opportunities.title}</SectionTitle>
      <ol className="m-0 mt-10 grid gap-x-10 gap-y-8 p-0 md:grid-cols-3">
        {opportunities.items.map((item, i) => <Numbered key={item.title} index={i} {...item} />)}
      </ol>
    </section>
  );
}

function Origin({ lang, c }) {
  const { origin } = c;
  const hrefs = ['/products/passion-fruit#orchard', '/products/passion-fruit#specifications'];
  return (
    <section className="content-width grid items-center gap-8 pb-14 sm:pb-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
      <Figure photo={media.sorting} lang={lang} ratio="aspect-[2/1]" sizes="(max-width: 1023px) calc(100vw - 32px), 680px" />
      <div>
        <Eyebrow className="text-(--pf-gold-ink)">{origin.eyebrow}</Eyebrow>
        <SectionTitle className={cn(title, 'mt-4 text-[30px] sm:text-[36px]')}>{origin.title}</SectionTitle>
        <p className="mt-5 text-base leading-relaxed text-(--pf-muted)">{origin.text}</p>
        <div className="mt-4 flex flex-wrap gap-x-8">
          {origin.links.map((label, i) => (
            <Link key={label} to={hrefs[i]} className={textLink}>
              {label}
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partnership({ c }) {
  const { partnership } = c;
  return (
    <section className="bg-[#102d43] py-14 text-[#f3efe3] sm:py-20">
      <div className="content-width">
        <Eyebrow className="text-(--pf-gold)">{partnership.eyebrow}</Eyebrow>
        <h2 className={cn(styles.heading, styles.display, 'mt-4 max-w-2xl text-[30px] leading-tight font-semibold sm:text-[38px]')}>{partnership.title}</h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#f3efe3]/80">{partnership.text}</p>
        <ol className="m-0 mt-10 grid gap-x-10 gap-y-7 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {partnership.items.map(({ title: name, text }, i) => (
            <li key={name} className="list-none border-t border-(--pf-gold)/50 pt-4">
              <span className="text-xs font-semibold text-(--pf-gold)">{String(i + 1).padStart(2, '0')}</span>
              <h3 className={cn(styles.heading, 'mt-1 text-lg leading-snug font-semibold')}>{name}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-[#f3efe3]/80">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-[#f3efe3]/70">{partnership.note}</p>
      </div>
    </section>
  );
}

function FaqSection({ c }) {
  return (
    <section id="faq" className="content-width grid scroll-mt-4 gap-8 py-14 sm:py-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
      <div>
        <SectionTitle className={cn(title, 'text-[28px] sm:text-[34px]')}>{c.faq.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{c.faq.text}</p>
      </div>
      <Faq items={c.faq.items} />
    </section>
  );
}

function Cta({ c }) {
  return (
    <section aria-labelledby="pf-retail-cta" className="border-t border-(--pf-line) bg-(--pf-soft) px-4 py-16 text-center sm:py-24">
      <h2 id="pf-retail-cta" className={cn(title, 'mx-auto max-w-3xl text-[30px] leading-tight text-balance sm:text-5xl')}>{c.cta.title}</h2>
      <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-(--pf-muted)">{c.cta.text}</p>
      <TradeDeskButton size="lg" product={PRODUCT_ID} segment="retail" source="pf_retail_cta" className={cn(solid, 'mt-8 px-8')}>
        {c.cta.button}
        <ArrowRight />
      </TradeDeskButton>
    </section>
  );
}

export function RetailSegment({ lang }) {
  const c = passionFruitPages[lang].retail;
  return (
    <div className={cn(styles.retail, 'bg-(--pf-bg) text-(--pf-ink)')}>
      <Hero lang={lang} c={c} />
      <SegmentNav lang={lang} active="retail" />
      <ValueStrip items={c.values} icons={VALUE_ICONS} />
      <Presentation lang={lang} c={c} />
      <Packaging lang={lang} c={c} />
      <Opportunities c={c} />
      <Origin lang={lang} c={c} />
      <Partnership c={c} />
      <FaqSection c={c} />
      <Cta c={c} />
    </div>
  );
}
