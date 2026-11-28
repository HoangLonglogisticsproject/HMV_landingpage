import { ArrowRight, BadgeCheck, Check, Headset, MessageSquareText, Package, Sprout, Handshake, ShieldCheck } from 'lucide-react';
import { QuickRfq } from '@/features/inquiries/QuickRfq';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { cn } from '@/lib/utils';
import { PRODUCT_ID, passionFruitPages } from '@/data/passionFruitPages';
import { passionFruitMedia as media } from '@/data/passionFruitMedia';
import { FocusRfqButton } from './FocusRfqButton';
import { Faq, Figure, Photo, SectionTitle, SegmentNav } from './parts';
import styles from './PassionFruit.module.css';

// International Buyers: the approved Export layout (specs/references/passion-fruit-approved-ui.png), with its sections in
// the mockup's order. The page's one request form is the production Quick RFQ, fixed to this product.

const STRIP_ICONS = [Sprout, BadgeCheck, Package, Headset];
const WHY_ICONS = [Sprout, ShieldCheck, Package, Handshake];
const WHY_TONES = ['bg-emerald-50 text-emerald-700', 'bg-sky-50 text-sky-700', 'bg-emerald-50 text-emerald-700', 'bg-sky-50 text-sky-700'];
const button = 'h-12 rounded-full px-6 text-[15px] font-semibold';

// Four photographs of the product's journey, as in the mockup's collage, in an asymmetric grid: the vine and the golden fruit
// above, the sorted fruit wide and an open carton narrow below. The vine and the sorted fruit are documentary photographs;
// the fruit and the carton are illustrative product images. All four are on the first screen (a phone's too), so all four load
// at once: a lazy one there would be the page's largest paint arriving late.
function HeroCollage({ lang }) {
  const tile = 'overflow-hidden rounded-lg bg-(--pf-soft)';
  return (
    <div className="grid aspect-[6/5] grid-cols-6 grid-rows-[11fr_9fr] gap-2.5 sm:gap-3.5">
      <div className={cn(tile, 'col-span-3 rounded-tl-[44px]')}>
        <Photo photo={media.vine} lang={lang} sizes="(max-width: 1023px) 50vw, 300px" eager />
      </div>
      <div className={cn(tile, 'col-span-3 rounded-tr-[44px]')}>
        <Photo photo={media.scene} lang={lang} sizes="(max-width: 1023px) 50vw, 300px" eager />
      </div>
      <div className={cn(tile, 'col-span-4')}>
        <Photo photo={media.sorting} lang={lang} sizes="(max-width: 1023px) 70vw, 400px" eager />
      </div>
      <div className={cn(tile, 'col-span-2 rounded-br-[44px]')}>
        <Photo photo={media.carton} lang={lang} sizes="(max-width: 1023px) 35vw, 200px" eager />
      </div>
    </div>
  );
}

// Heading, collage, then the lead and the two calls to action: on a phone in that order, so the product and both calls to
// action are on the first screen; from 1024 px the heading and the lead stack beside the collage.
function Hero({ lang, c }) {
  const [first, accent, last] = c.hero.title;
  return (
    <header className="bg-(--pf-bg) pt-5 pb-6 sm:pt-8 sm:pb-8">
      <div className="content-width grid items-center gap-x-12 gap-y-5 lg:grid-cols-[minmax(0,11fr)_minmax(0,12fr)] lg:grid-rows-[1fr_1fr]">
        <div className="lg:self-end">
          <h1 className={cn(styles.heading, styles.display, "font-['Plus_Jakarta_Sans'] text-[34px] leading-[1.08] font-extrabold text-(--pf-ink) sm:text-5xl lg:text-[44px]")}>
            <span className="block">{first} </span>
            <span className="block text-(--pf-accent)">{accent} </span>
            <span className="block">{last}</span>
          </h1>
          <span aria-hidden="true" className="mt-4 block h-1 w-14 rounded-full bg-(--pf-accent)" />
        </div>
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <HeroCollage lang={lang} />
        </div>
        <div className="lg:self-start">
          <p className="max-w-md text-[15px] leading-relaxed text-(--pf-ink) sm:text-lg">{c.hero.lead}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <FocusRfqButton size="lg" className={cn(button, 'bg-(--pf-accent) text-white hover:bg-(--pf-accent)/90')}>
              {c.hero.primary}
              <ArrowRight />
            </FocusRfqButton>
            <TradeDeskButton size="lg" variant="outline" product={PRODUCT_ID} segment="export" source="pf_export_hero" className={cn(button, 'border-2 border-(--pf-ink) bg-white text-(--pf-ink)')}>
              <MessageSquareText />
              {c.hero.secondary}
            </TradeDeskButton>
          </div>
        </div>
      </div>
    </header>
  );
}

function Strip({ c }) {
  return (
    <section className="content-width pt-6 pb-6 sm:pb-10">
      <ul className="m-0 grid rounded-2xl bg-(--pf-soft) p-2 sm:grid-cols-2 lg:grid-cols-4 lg:p-4">
        {c.strip.map(({ title, text }, i) => {
          const Icon = STRIP_ICONS[i];
          return (
            <li key={title} className="flex list-none gap-3 p-3 lg:border-l lg:border-(--pf-line) lg:first:border-l-0">
              <Icon aria-hidden="true" size={30} className="mt-0.5 shrink-0 text-(--pf-accent)" strokeWidth={1.5} />
              <div>
                <p className="text-[15px] leading-snug font-bold text-(--pf-ink)">{title}</p>
                <p className="text-[13px] leading-snug text-(--pf-muted)">{text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Why({ c }) {
  return (
    <section className="content-width py-10 sm:py-14">
      <SectionTitle className="text-center">
        {c.why.title}
        <span className="text-(--pf-accent)">{c.why.accent}</span>
      </SectionTitle>
      <ul className="m-0 mt-8 grid gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {c.why.items.map(({ title, text }, i) => {
          const Icon = WHY_ICONS[i];
          return (
            <li key={title} className="list-none rounded-2xl border border-(--pf-line) bg-white p-5 shadow-sm">
              <span aria-hidden="true" className={cn('grid size-11 place-items-center rounded-xl', WHY_TONES[i])}>
                <Icon size={22} />
              </span>
              <h3 className={cn(styles.heading, 'mt-4 text-[17px] leading-snug font-bold text-(--pf-ink)')}>{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--pf-muted)">{text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Orchard({ lang, c }) {
  // The tiles are narrow portrait frames over wide photographs: the browser paints the photograph at its height, hence the large slot.
  const sizes = '(max-width: 639px) 100vw, 700px';
  const treeSizes = '(max-width: 639px) 500px, 700px';
  return (
    <section id="orchard" className="content-width grid scroll-mt-4 items-center gap-6 py-8 sm:py-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,8fr)] lg:gap-10">
      <div>
        <SectionTitle>{c.orchard.title}</SectionTitle>
        <span aria-hidden="true" className="mt-3 block h-1 w-10 rounded-full bg-(--pf-accent)" />
        <p className="mt-4 text-[15px] leading-relaxed text-(--pf-ink)">{c.orchard.text}</p>
        <p className="mt-2 text-xs text-(--pf-muted)">{c.orchard.note}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="col-span-2 aspect-[4/3] overflow-hidden rounded-xl sm:col-span-1 sm:aspect-[3/4]">
          <Photo photo={media.vine} lang={lang} sizes={sizes} />
        </div>
        <div className="aspect-[3/4] overflow-hidden rounded-xl">
          <Photo photo={media.orchard} lang={lang} sizes={sizes} />
        </div>
        <div className="aspect-[3/4] overflow-hidden rounded-xl">
          <Photo photo={media.onTree} lang={lang} sizes={treeSizes} className="object-[72%_50%]" />
        </div>
      </div>
    </section>
  );
}

function Quality({ lang, c }) {
  return (
    <section id="quality" className="content-width grid scroll-mt-4 items-center gap-6 py-8 sm:py-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
      <Figure photo={media.display} lang={lang} ratio="aspect-[8/5] rounded-2xl" sizes="(max-width: 1023px) calc(100vw - 32px), 640px" />
      <div>
        <SectionTitle>{c.quality.title}</SectionTitle>
        <span aria-hidden="true" className="mt-3 block h-1 w-10 rounded-full bg-(--pf-accent)" />
        <p className="mt-4 text-[15px] leading-relaxed text-(--pf-ink)">{c.quality.text}</p>
        <ul className="m-0 mt-4 grid gap-2 p-0">
          {c.quality.points.map(point => (
            <li key={point} className="flex list-none items-start gap-2.5 text-[15px] text-(--pf-ink)">
              <Check aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--pf-accent)" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Only confirmed facts are shown. What the buyer may still ask for is one request, not a table of empty rows.
function Specs({ c }) {
  const { specs } = c;
  return (
    <section id="specifications" className="content-width scroll-mt-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-(--pf-line) p-5 sm:p-8">
        <SectionTitle className="text-2xl sm:text-[28px]">{specs.title}</SectionTitle>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-(--pf-muted)">{specs.text}</p>
        <dl className="m-0 mt-6 grid gap-x-8 sm:grid-cols-3">
          {specs.facts.map(([term, value]) => (
            <div key={term} className="border-t-2 border-(--pf-accent) py-3">
              <dt className="text-xs font-semibold text-(--pf-muted)">{term}</dt>
              <dd className="m-0 mt-0.5 text-lg font-bold text-(--pf-ink)">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-(--pf-soft) p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[15px] leading-relaxed text-(--pf-ink)">{specs.more}</p>
          <TradeDeskButton size="lg" product={PRODUCT_ID} segment="export" source="pf_export_specs" className={cn(button, 'shrink-0 bg-(--pf-accent) text-white hover:bg-(--pf-accent)/90')}>
            {specs.cta}
            <ArrowRight />
          </TradeDeskButton>
        </div>
      </div>
    </section>
  );
}

function Sorting({ lang, c }) {
  return (
    <section id="sorting" className="content-width grid scroll-mt-4 items-center gap-6 py-8 sm:py-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,8fr)] lg:gap-10">
      <div>
        <SectionTitle>{c.sorting.title}</SectionTitle>
        <span aria-hidden="true" className="mt-3 block h-1 w-10 rounded-full bg-(--pf-accent)" />
        <p className="mt-4 text-[15px] leading-relaxed text-(--pf-ink)">{c.sorting.text}</p>
      </div>
      <Figure photo={media.sorting} lang={lang} ratio="aspect-[21/10] rounded-2xl" sizes="(max-width: 1023px) calc(100vw - 32px), 780px" />
    </section>
  );
}

function Packing({ lang, c }) {
  return (
    <section id="packing" className="content-width grid scroll-mt-4 gap-6 py-8 sm:py-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-10">
      <div>
        <SectionTitle>{c.packing.title}</SectionTitle>
        <span aria-hidden="true" className="mt-3 block h-1 w-10 rounded-full bg-(--pf-accent)" />
        <p className="mt-4 text-[15px] leading-relaxed text-(--pf-ink)">{c.packing.text}</p>
        <ul className="m-0 mt-4 grid gap-2 p-0">
          {c.packing.points.map(point => (
            <li key={point} className="flex list-none items-start gap-2.5 text-[15px] text-(--pf-ink)">
              <Check aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--pf-accent)" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Figure photo={media.carton} lang={lang} ratio="aspect-[3/4] rounded-2xl" sizes="(max-width: 639px) calc(100vw - 32px), 360px" />
        <Figure photo={media.neutralCartons} lang={lang} ratio="aspect-[4/3] rounded-2xl" sizes="(max-width: 639px) calc(100vw - 32px), 320px" />
      </div>
    </section>
  );
}

function Process({ c }) {
  return (
    <section className="content-width py-8 sm:py-12">
      <SectionTitle>{c.process.title}</SectionTitle>
      <ol className="m-0 mt-6 grid gap-5 p-0 sm:grid-cols-2 lg:grid-cols-5">
        {c.process.steps.map(({ title, text }, i) => (
          <li key={title} className="list-none border-t-2 border-(--pf-accent) pt-3">
            <span className="text-xs font-bold text-(--pf-accent)">
              {c.process.stepLabel} {i + 1}
            </span>
            <h3 className={cn(styles.heading, 'mt-1 text-base leading-snug font-bold text-(--pf-ink)')}>{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-(--pf-muted)">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FaqSection({ c }) {
  return (
    <section id="faq" className="content-width grid scroll-mt-4 gap-6 py-8 sm:py-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
      <div>
        <SectionTitle>{c.faq.title}</SectionTitle>
        <span aria-hidden="true" className="mt-3 block h-1 w-10 rounded-full bg-(--pf-accent)" />
        <p className="mt-4 text-[15px] leading-relaxed text-(--pf-ink)">{c.faq.text}</p>
      </div>
      <Faq items={c.faq.items} />
    </section>
  );
}

// The full-width conversion band: the page's own words on the left, the production Quick RFQ on the right.
function Conversion({ lang, c }) {
  return (
    <section id="rfq" aria-labelledby="pf-rfq-title" className="relative mt-6 scroll-mt-4 overflow-hidden bg-[#0b2a4a] py-12 text-white sm:py-16">
      <div aria-hidden="true" className="absolute inset-0 opacity-25">
        {/* A tall band on a phone paints the wide photograph far past the viewport: the slot says so. */}
        <Photo photo={media.onTree} lang={lang} sizes="(max-width: 1023px) 1000px, 100vw" />
      </div>
      <div className="relative content-width grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12">
        <div>
          <h2 id="pf-rfq-title" className={cn(styles.heading, styles.display, "font-['Plus_Jakarta_Sans'] text-4xl leading-tight font-extrabold sm:text-[44px]")}>
            {c.cta.title}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/90">{c.cta.text}</p>
          <p className="mt-5 flex items-center gap-2.5 text-sm font-semibold text-[#f5e08a]">
            <Headset aria-hidden="true" size={22} />
            {c.cta.desk}
          </p>
        </div>
        <div className={cn(styles.legacy, 'rounded-2xl bg-white p-4 text-(--pf-ink) shadow-lg sm:p-6')}>
          <QuickRfq lang={lang} product={PRODUCT_ID} segment="export" source="pf_export" />
        </div>
      </div>
    </section>
  );
}

export function ExportSegment({ lang }) {
  const c = passionFruitPages[lang].export;
  return (
    <div className={cn(styles.export, 'bg-(--pf-bg) text-(--pf-ink)')}>
      <Hero lang={lang} c={c} />
      <SegmentNav lang={lang} active="export" />
      <Strip c={c} />
      <Why c={c} />
      <Orchard lang={lang} c={c} />
      <Quality lang={lang} c={c} />
      <Specs c={c} />
      <Sorting lang={lang} c={c} />
      <Packing lang={lang} c={c} />
      <Process c={c} />
      <FaqSection c={c} />
      <Conversion lang={lang} c={c} />
    </div>
  );
}
