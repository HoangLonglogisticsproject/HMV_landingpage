import { ArrowDown, ArrowRight, Apple, CalendarDays, Gem, Gift, Handshake, Package, PackageOpen, ShieldCheck, Store, TrendingUp } from 'lucide-react';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { PRODUCT_ID, passionFruitPages } from '@/data/passionFruitPages';
import { passionFruitMedia as media } from '@/data/passionFruitMedia';
import { CtaBanner, Eyebrow, Faq, Figure, Partnership, Photo, SectionTitle, SegmentNav, ValueStrip } from './parts';
import styles from './PassionFruit.module.css';

// Premium Retail Business: product-led, on one warm ivory page from the hero to the closing banner, with deep blue only in type,
// buttons and icons and champagne-gold hairlines (no full-width dark block). The fruit's appearance and its presentation come
// before the farm. The hero is an AI-generated gift-carton concept, labelled as such; the carton and net photographs elsewhere are
// market references. Never an HMV pack, and there are no prices or shopping controls.

const title = cn(styles.heading, styles.display, 'font-semibold text-(--pf-ink)');
const solid = 'h-12 rounded-md bg-(--pf-accent) px-7 text-sm font-semibold text-[#f3efe3] hover:bg-(--pf-accent)/90';
const textLink = 'inline-flex min-h-11 items-center gap-2 border-b border-(--pf-gold) text-sm font-semibold text-(--pf-ink) no-underline outline-offset-4 outline-(--pf-ink) focus-visible:outline-2';

const VALUE_ICONS = [Gem, Store, PackageOpen, ShieldCheck, CalendarDays];
const PACKAGING_ICONS = [ShieldCheck, Package, Store];
const OPPORTUNITY_ICONS = [Store, Apple, Gift];
const STEP_ICONS = [TrendingUp, Package, Handshake];

function Hero({ lang, c }) {
  const { hero } = c;
  return (
    <header className="bg-(--pf-bg) pt-6 pb-10 sm:pt-12 sm:pb-14">
      <div className="content-width grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
        <div className="relative z-10">
          <Eyebrow className="flex items-center gap-3 text-(--pf-gold-ink)">
            <span aria-hidden="true" className="block h-px w-10 bg-(--pf-gold)" />
            {hero.eyebrow}
          </Eyebrow>
          <h1 className={cn(title, 'mt-5 text-[30px] leading-[1.14] text-balance sm:text-[40px] lg:text-[42px]')}>{hero.title}</h1>
          <p className={cn(styles.heading, 'mt-3 text-xl leading-snug font-semibold text-(--pf-gold-ink) sm:text-2xl')}>{hero.tagline}</p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-(--pf-muted) sm:mt-5 sm:text-lg">{hero.lead}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-7 sm:gap-y-4">
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
          <div className={cn(styles.fadeLeft, 'aspect-[16/10] overflow-hidden bg-(--pf-soft) sm:aspect-[4/3]')}>
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

/** A mosaic tile: a photograph filling its frame and a small label with its caption. */
function Tile({ photo, lang, className, sizes, position }) {
  return (
    <figure className={cn('relative m-0 overflow-hidden rounded-xl bg-(--pf-soft)', className)}>
      <Photo photo={photo} lang={lang} sizes={sizes} className={cn('absolute inset-0', position)} />
      <figcaption className="absolute bottom-2 left-2 max-w-[85%] rounded-md bg-(--pf-bg)/90 px-2 py-1 text-[11px] leading-snug text-(--pf-muted)">{photo.caption[lang]}</figcaption>
    </figure>
  );
}

// Packaging and presentation: the three formats on the left, an asymmetric mosaic on the right: the concept (large), the nets and
// the divided carton (the carton's inset in the hero is a small view of the same photograph).
function Packaging({ lang, c }) {
  const { packaging } = c;
  return (
    <section id="packaging" className="content-width grid scroll-mt-4 items-center gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
      <div>
        <Eyebrow className="flex items-center gap-3 text-(--pf-gold-ink)">
          <span aria-hidden="true" className="block h-px w-8 bg-(--pf-gold)" />
          {packaging.eyebrow}
        </Eyebrow>
        <SectionTitle className={cn(title, 'mt-4 text-[28px] sm:text-[36px]')}>{packaging.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{packaging.text}</p>
        <ul className="m-0 mt-6 grid gap-4 p-0">
          {packaging.items.map(({ title: name, text }, i) => {
            const Icon = PACKAGING_ICONS[i];
            return (
              <li key={name} className="flex list-none items-start gap-3 border-t border-(--pf-line) pt-4">
                <Icon aria-hidden="true" size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-(--pf-gold-ink)" />
                <div>
                  <h3 className={cn(styles.heading, 'text-base leading-snug font-semibold text-(--pf-ink)')}>{name}</h3>
                  <p className="mt-0.5 text-[15px] leading-relaxed text-(--pf-muted)">{text}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-(--pf-muted)">{packaging.note}</p>
      </div>
      <div className="grid gap-3 sm:aspect-[5/4] sm:grid-cols-[3fr_2fr] sm:grid-rows-2">
        <Tile photo={media.premiumPackaging} lang={lang} sizes="(max-width: 639px) calc(100vw - 32px), 720px" className="aspect-[4/3] sm:row-span-2 sm:aspect-auto" position="object-[65%_50%]" />
        <Tile photo={media.nets} lang={lang} sizes="(max-width: 639px) calc(100vw - 32px), 300px" className="aspect-[4/3] sm:aspect-auto" />
        <Tile photo={media.carton} lang={lang} sizes="(max-width: 639px) calc(100vw - 32px), 300px" className="aspect-[4/3] sm:aspect-auto" position="object-[50%_40%]" />
      </div>
    </section>
  );
}

function Opportunities({ lang, c }) {
  const { opportunities } = c;
  return (
    <section className="content-width grid items-center gap-8 border-t border-(--pf-line) py-14 sm:py-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
      <Figure photo={media.display} lang={lang} ratio="aspect-[16/10] rounded-xl" sizes="(max-width: 1023px) calc(100vw - 32px), 640px" />
      <div>
        <Eyebrow className="flex items-center gap-3 text-(--pf-gold-ink)">
          <span aria-hidden="true" className="block h-px w-8 bg-(--pf-gold)" />
          {opportunities.eyebrow}
        </Eyebrow>
        <SectionTitle className={cn(title, 'mt-4 text-[28px] sm:text-[36px]')}>{opportunities.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{opportunities.text}</p>
        <ul className="m-0 mt-6 grid gap-4 p-0">
          {opportunities.items.map(({ title: name, text }, i) => {
            const Icon = OPPORTUNITY_ICONS[i];
            return (
              <li key={name} className="flex list-none items-start gap-3 border-t border-(--pf-line) pt-4">
                <Icon aria-hidden="true" size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-(--pf-gold-ink)" />
                <div>
                  <h3 className={cn(styles.heading, 'text-base leading-snug font-semibold text-(--pf-ink)')}>{name}</h3>
                  <p className="mt-0.5 text-[15px] leading-relaxed text-(--pf-muted)">{text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Origin({ lang, c }) {
  const { origin } = c;
  const hrefs = ['/products/passion-fruit#orchard', '/products/passion-fruit#specifications'];
  return (
    <section className="content-width grid items-center gap-8 border-t border-(--pf-line) py-14 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
      <div className="lg:order-1">
        <Eyebrow className="flex items-center gap-3 text-(--pf-gold-ink)">
          <span aria-hidden="true" className="block h-px w-8 bg-(--pf-gold)" />
          {origin.eyebrow}
        </Eyebrow>
        <SectionTitle className={cn(title, 'mt-4 text-[28px] sm:text-[36px]')}>{origin.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{origin.text}</p>
        <div className="mt-5 flex flex-wrap gap-x-8">
          {origin.links.map((label, i) => (
            <Link key={label} to={hrefs[i]} className={textLink}>
              {label}
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          ))}
        </div>
      </div>
      <Figure photo={media.sorting} lang={lang} ratio="aspect-[16/9] rounded-xl" className="lg:order-2" sizes="(max-width: 1023px) calc(100vw - 32px), 680px" />
    </section>
  );
}

function FaqSection({ c }) {
  return (
    <section id="faq" className="content-width grid scroll-mt-4 gap-8 border-t border-(--pf-line) py-14 sm:py-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
      <div>
        <SectionTitle className={cn(title, 'text-[28px] sm:text-[34px]')}>{c.faq.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{c.faq.text}</p>
      </div>
      <Faq items={c.faq.items} />
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
      <Packaging lang={lang} c={c} />
      <Opportunities lang={lang} c={c} />
      <Origin lang={lang} c={c} />
      <Partnership c={c.partnership} icons={STEP_ICONS} segment="retail" source="pf_retail_partnership" titleClass={title} buttonClassName={solid} className="border-t border-(--pf-line)" />
      <FaqSection c={c} />
      <CtaBanner id="pf-retail-cta" c={c.cta} photo={media.onTree} lang={lang} segment="retail" source="pf_retail_cta" titleClass={title} buttonClassName={solid} position="object-[50%_35%]" photoFirst />
    </div>
  );
}
