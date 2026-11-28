import { ArrowDown, ArrowRight, ConciergeBell, Handshake, Leaf, ListChecks } from 'lucide-react';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { PRODUCT_ID, passionFruitPages } from '@/data/passionFruitPages';
import { passionFruitMedia as media } from '@/data/passionFruitMedia';
import { Eyebrow, Faq, Figure, Photo, SectionTitle, SegmentNav, ValueStrip } from './parts';
import styles from './PassionFruit.module.css';

// Foodservice & Luxury Hospitality: an editorial page on cream and botanical green, led by the fruit and what a kitchen or a
// bar can do with it, before any logistics. A Playfair Display serif for the headings (self-hosted, this page only), hairlines,
// thin line icons in the value strip and large photographs. The hero is the AI-generated macro of whole and halved golden fruit
// with a pulp-detail inset; the applications are the centerpiece: AI-generated illustrations of a beverage, a dessert and a plated
// dish, and separated fruit in a carton for the supply card.

const display = cn(styles.heading, styles.serif, 'font-medium text-(--pf-ink)');
const solid = 'h-12 rounded-none bg-(--pf-accent) px-7 text-sm font-semibold text-[#f3efe3] hover:bg-(--pf-accent)/90';

const VALUE_ICONS = [Leaf, ListChecks, ConciergeBell, Handshake];
// The photograph of each application card (`id` in data/passionFruitPages.js) and where its frame is centred: the dessert is a
// portrait, so the plate (the lower middle) is kept; the others are landscape.
const photos = {
  beverages: { photo: media.signatureDrinks, position: 'object-[50%_50%]' },
  desserts: { photo: media.refinedDessert, position: 'object-[50%_58%]' },
  culinary: { photo: media.luxuryCulinary, position: 'object-[50%_50%]' },
  supply: { photo: media.neutralFruit, position: 'object-[50%_50%]' },
};

const Rule = ({ className }) => <span aria-hidden="true" className={cn('block h-px w-12 bg-(--pf-gold)', className)} />;

// The hero: the heading one sentence to a line, the primary call to action and the ingredient, whole and halved, in the first
// screen of a laptop and of a phone (where the photograph comes first, the call to action next).
// The hero: the heading one sentence to a line, the primary call to action and the ingredient, whole and halved, in the first
// screen of a laptop and of a phone (where the photograph comes first, the call to action next). The macro is a portrait: the
// frame crops it to a landscape window that keeps the cut fruit, centred a little below the middle. The pulp detail overlaps its
// lower left from 1024 px, where the copy column leaves room; it is left out below that.
function Hero({ lang, c }) {
  const { hero } = c;
  const sentences = hero.title.split(/(?<=\.)\s+/);
  return (
    <header className="bg-(--pf-bg) pt-6 pb-10 sm:pt-10 sm:pb-12">
      <div className="content-width grid items-center gap-6 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] lg:gap-14">
        <div className="lg:order-1">
          <Eyebrow className="flex items-center gap-3 text-(--pf-gold-ink)">
            <Rule />
            {hero.eyebrow}
          </Eyebrow>
          <h1 className={cn(display, 'mt-4 text-[29px] leading-[1.18] font-semibold sm:text-[42px] lg:mt-5 lg:text-[44px]')}>
            {sentences.map(sentence => <span key={sentence} className="block text-balance">{sentence} </span>)}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-(--pf-muted) sm:text-lg lg:mt-5">{hero.lead}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <TradeDeskButton size="lg" product={PRODUCT_ID} segment="foodservice" source="pf_foodservice_hero" className={solid}>
              {hero.primary}
              <ArrowRight />
            </TradeDeskButton>
            <a href="#applications" className="inline-flex min-h-11 items-center gap-2 border-b border-(--pf-gold) text-sm font-semibold text-(--pf-ink) no-underline outline-offset-4 outline-(--pf-ink) focus-visible:outline-2">
              {hero.secondary}
              <ArrowDown aria-hidden="true" size={16} />
            </a>
          </div>
        </div>
        <figure className="relative order-first m-0 lg:order-2">
          <div className={cn(styles.fadeLeft, 'aspect-[16/11] overflow-hidden bg-(--pf-soft) sm:aspect-[3/2] lg:aspect-[6/5]')}>
            <Photo photo={media.foodserviceHero} lang={lang} sizes="(max-width: 1023px) calc(100vw - 32px), 620px" className="object-[50%_58%]" eager />
          </div>
          <figcaption className="mt-2 text-xs leading-snug text-(--pf-muted) lg:text-right">{media.foodserviceHero.caption[lang]}</figcaption>
          <div className="absolute bottom-7 -left-10 hidden aspect-[4/5] w-[30%] overflow-hidden rounded-xl border-4 border-(--pf-bg) shadow-md lg:block">
            <Photo photo={media.foodservicePulp} lang={lang} sizes="190px" />
          </div>
        </figure>
      </div>
    </header>
  );
}

function Ingredient({ lang, c }) {
  const { ingredient } = c;
  return (
    <section className="content-width grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      <Figure photo={media.pile} lang={lang} ratio="aspect-[16/10]" sizes="(max-width: 1023px) calc(100vw - 32px), 680px" />
      <div>
        <Eyebrow className="text-(--pf-gold-ink)">{ingredient.eyebrow}</Eyebrow>
        <SectionTitle className={cn(display, 'mt-4 text-[32px] sm:text-[40px]')}>{ingredient.title}</SectionTitle>
        <Rule className="mt-5" />
        <p className="mt-5 text-base leading-relaxed text-(--pf-muted)">{ingredient.text}</p>
        <ul className="m-0 mt-5 grid p-0">
          {ingredient.points.map(point => (
            <li key={point} className="list-none border-t border-(--pf-line) py-2.5 text-[15px] text-(--pf-ink) last:border-b">
              {point}
            </li>
          ))}
        </ul>
        <TradeDeskButton variant="link" product={PRODUCT_ID} segment="foodservice" source="pf_foodservice_specs" className="mt-4 h-11 px-0 text-sm font-semibold text-(--pf-ink) underline decoration-(--pf-gold) underline-offset-4">
          {ingredient.link}
        </TradeDeskButton>
      </div>
    </section>
  );
}

function Applications({ lang, c }) {
  const { applications } = c;
  return (
    <section id="applications" className="content-width scroll-mt-4 py-14 sm:py-20">
      <div className="grid gap-10">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div>
            <Eyebrow className="flex items-center gap-3 text-(--pf-gold-ink)">
              <Rule />
              {applications.eyebrow}
            </Eyebrow>
            <SectionTitle className={cn(display, 'mt-4 text-[32px] sm:text-[40px]')}>{applications.title}</SectionTitle>
          </div>
          <p className="max-w-md text-base leading-relaxed text-(--pf-muted)">{applications.text}</p>
        </div>
        <ol className="m-0 grid gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {applications.items.map(({ id, title, text }) => {
            const { photo, position } = photos[id];
            return (
              <li key={id} className="flex list-none flex-col">
                <div className="aspect-[5/4] overflow-hidden rounded-xl bg-(--pf-soft)">
                  <Photo photo={photo} lang={lang} sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 340px, 280px" className={position} />
                </div>
                <h3 className={cn(display, 'mt-4 text-xl leading-snug')}>{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-(--pf-muted)">{text}</p>
                <span aria-hidden="true" className="mt-3 block h-px w-full bg-(--pf-gold)/60" />
                <p className="mt-2 text-xs leading-snug text-(--pf-muted)">{photo.caption[lang]}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Origin({ lang, c }) {
  const { origin } = c;
  return (
    <section className="bg-(--pf-soft) py-14 sm:py-20">
      <div className="content-width">
        <div className="aspect-[4/3] overflow-hidden sm:aspect-[21/9]">
          <Photo photo={media.orchard} lang={lang} sizes="(max-width: 1100px) calc(100vw - 32px), 1160px" />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <Eyebrow className="text-(--pf-gold-ink)">{origin.eyebrow}</Eyebrow>
            <SectionTitle className={cn(display, 'mt-4 text-[30px] sm:text-[36px]')}>{origin.title}</SectionTitle>
          </div>
          <div>
            <p className="text-base leading-relaxed text-(--pf-muted)">{origin.text}</p>
            <Link to="/products/passion-fruit#orchard" className="mt-4 inline-flex min-h-11 items-center gap-2 border-b border-(--pf-gold) text-sm font-semibold text-(--pf-ink) no-underline outline-offset-4 outline-(--pf-ink) focus-visible:outline-2">
              {origin.link}
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Supply({ c }) {
  const { supply } = c;
  return (
    <section className="bg-[#193d2c] py-14 text-[#f3efe3] sm:py-20">
      <div className="content-width">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <Eyebrow className="text-(--pf-gold)">{supply.eyebrow}</Eyebrow>
            <SectionTitle className={cn(display, 'mt-4 text-[32px] text-[#f3efe3] sm:text-[40px]')}>{supply.title}</SectionTitle>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-[#f3efe3]/80 lg:pt-8">{supply.text}</p>
        </div>
        <ol className="m-0 mt-10 grid gap-x-10 gap-y-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {supply.items.map(({ title, text }, i) => (
            <li key={title} className="list-none border-t border-(--pf-gold)/50 pt-4">
              <span className="text-xs font-semibold text-(--pf-gold)">{String(i + 1).padStart(2, '0')}</span>
              <h3 className={cn(styles.heading, 'mt-1 text-lg leading-snug font-semibold')}>{title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-[#f3efe3]/80">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-[#f3efe3]/70">{supply.note}</p>
      </div>
    </section>
  );
}

function FaqSection({ c }) {
  return (
    <section id="faq" className="content-width grid scroll-mt-4 gap-8 py-14 sm:py-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
      <div>
        <SectionTitle className={cn(display, 'text-[30px] sm:text-[36px]')}>{c.faq.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{c.faq.text}</p>
      </div>
      <Faq items={c.faq.items} />
    </section>
  );
}

function Cta({ c }) {
  return (
    <section aria-labelledby="pf-fs-cta" className="bg-[#193d2c] px-4 py-16 text-center text-[#f3efe3] sm:py-24">
      <Rule className="mx-auto" />
      <h2 id="pf-fs-cta" className={cn(styles.heading, styles.serif, 'mx-auto mt-6 max-w-3xl text-[32px] leading-tight font-medium text-balance sm:text-5xl')}>{c.cta.title}</h2>
      <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[#f3efe3]/80">{c.cta.text}</p>
      <TradeDeskButton size="lg" product={PRODUCT_ID} segment="foodservice" source="pf_foodservice_cta" className="mt-8 h-12 rounded-none border border-(--pf-gold) bg-[#f3efe3] px-8 text-sm font-semibold text-[#193d2c] hover:bg-white">
        {c.cta.button}
        <ArrowRight />
      </TradeDeskButton>
    </section>
  );
}

export function FoodserviceSegment({ lang }) {
  const c = passionFruitPages[lang].foodservice;
  return (
    <div className={cn(styles.foodservice, 'bg-(--pf-bg) text-(--pf-ink)')}>
      <Hero lang={lang} c={c} />
      <SegmentNav lang={lang} active="foodservice" />
      <ValueStrip items={c.values} icons={VALUE_ICONS} />
      <Applications lang={lang} c={c} />
      <Ingredient lang={lang} c={c} />
      <Origin lang={lang} c={c} />
      <Supply c={c} />
      <FaqSection c={c} />
      <Cta c={c} />
    </div>
  );
}
