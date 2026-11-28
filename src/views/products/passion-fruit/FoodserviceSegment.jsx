import { ArrowDown, ArrowRight, Check, CakeSlice, ClipboardList, ConciergeBell, CupSoda, Handshake, Leaf, ListChecks, MessageSquareText, Package } from 'lucide-react';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { PRODUCT_ID, passionFruitPages } from '@/data/passionFruitPages';
import { passionFruitMedia as media } from '@/data/passionFruitMedia';
import { CtaBanner, Eyebrow, Faq, Figure, Partnership, Photo, SectionTitle, SegmentNav, ValueStrip } from './parts';
import styles from './PassionFruit.module.css';

// Foodservice & Luxury Hospitality: one warm cream page from the hero to the closing banner, led by the fruit and what a kitchen or
// a bar can do with it, before any logistics. A Playfair Display serif for the headings (self-hosted, this page only), hairlines,
// thin line icons and large photographs; botanical green only in type, buttons and icons, never in a full-width block. The hero is
// the AI-generated macro of whole and halved golden fruit with a pulp-detail inset; the applications are AI-generated
// illustrations of a beverage, a dessert and a plated dish (said in their captions and in a note under them).

const display = cn(styles.heading, styles.serif, 'font-medium text-(--pf-ink)');
const solid = 'h-12 rounded-none bg-(--pf-accent) px-7 text-sm font-semibold text-[#f3efe3] hover:bg-(--pf-accent)/90';
const textLink = 'inline-flex min-h-11 items-center gap-2 border-b border-(--pf-gold) text-sm font-semibold text-(--pf-ink) no-underline outline-offset-4 outline-(--pf-ink) focus-visible:outline-2';

const VALUE_ICONS = [Leaf, ListChecks, ConciergeBell, Handshake];
const STEP_ICONS = [MessageSquareText, Package, ClipboardList];
// The photograph, the line icon and where the frame is centred, for each application card (`id` in data/passionFruitPages.js). The
// dessert is a portrait, so the plate (the lower middle) is kept; the others are landscape.
const APPLICATIONS = {
  beverages: { photo: media.signatureDrinks, icon: CupSoda, position: 'object-[50%_50%]' },
  desserts: { photo: media.refinedDessert, icon: CakeSlice, position: 'object-[50%_58%]' },
  culinary: { photo: media.luxuryCulinary, icon: ConciergeBell, position: 'object-[50%_50%]' },
};

const Rule = ({ className }) => <span aria-hidden="true" className={cn('block h-px w-12 bg-(--pf-gold)', className)} />;

// The hero: the heading, the brand line, the primary call to action and the ingredient, whole and halved, in the first screen of a
// laptop and of a phone (where the photograph comes first, the call to action next). The macro is a portrait: the frame crops it to
// a landscape window that keeps the cut fruit, centred a little below the middle. The pulp detail overlaps its lower left from
// 1024 px, where the copy column leaves room; it is left out below that.
function Hero({ lang, c }) {
  const { hero } = c;
  return (
    <header className="bg-(--pf-bg) pt-6 pb-10 sm:pt-10 sm:pb-12">
      <div className="content-width grid items-center gap-6 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] lg:gap-14">
        <div className="lg:order-1">
          <Eyebrow className="flex items-center gap-3 text-(--pf-gold-ink)">
            <Rule />
            {hero.eyebrow}
          </Eyebrow>
          <h1 className={cn(display, 'mt-4 text-[27px] leading-[1.18] font-semibold text-balance sm:text-[38px] lg:mt-5 lg:text-[40px]')}>{hero.title}</h1>
          <p className={cn(styles.serif, 'mt-3 text-[17px] leading-snug font-medium text-(--pf-gold-ink) sm:text-xl')}>{hero.tagline}</p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-(--pf-muted) sm:text-lg lg:mt-5">{hero.lead}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <TradeDeskButton size="lg" product={PRODUCT_ID} segment="foodservice" source="pf_foodservice_hero" className={solid}>
              {hero.primary}
              <ArrowRight />
            </TradeDeskButton>
            <a href="#applications" className={textLink}>
              {hero.secondary}
              <ArrowDown aria-hidden="true" size={16} />
            </a>
          </div>
        </div>
        <figure className="relative order-first m-0 lg:order-2">
          <div className={cn(styles.fadeLeft, 'aspect-[16/10] overflow-hidden bg-(--pf-soft) sm:aspect-[3/2] lg:aspect-[6/5]')}>
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

// The centerpiece (#applications): three photographic cards on one ratio, a hairline and the illustration label under each.
function Applications({ lang, c }) {
  const { applications } = c;
  return (
    <section id="applications" className="content-width scroll-mt-4 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow className="inline-flex items-center gap-3 text-(--pf-gold-ink)">
          <Rule className="w-8" />
          {applications.eyebrow}
          <Rule className="w-8" />
        </Eyebrow>
        <SectionTitle className={cn(display, 'mt-4 text-[30px] sm:text-[40px]')}>{applications.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{applications.text}</p>
      </div>
      <ol className="m-0 mt-10 grid gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {applications.items.map(({ id, title, text }) => {
          const { photo, icon: Icon, position } = APPLICATIONS[id];
          return (
            <li key={id} className="flex list-none flex-col">
              <div className="aspect-[5/4] overflow-hidden rounded-xl bg-(--pf-soft)">
                <Photo photo={photo} lang={lang} sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 340px, 370px" className={position} />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Icon aria-hidden="true" size={24} strokeWidth={1.5} className="shrink-0 text-(--pf-gold-ink)" />
                <h3 className={cn(display, 'text-xl leading-snug')}>{title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-(--pf-muted)">{text}</p>
              <span aria-hidden="true" className="mt-3 block h-px w-full bg-(--pf-gold)/60" />
              <p className="mt-2 text-xs leading-snug text-(--pf-muted)">{photo.caption[lang]}</p>
            </li>
          );
        })}
      </ol>
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-(--pf-muted)">{applications.note}</p>
    </section>
  );
}

// Origin and ingredient in one section, on the cleared documentary orchard photograph (the growing area, not a venue).
function Origin({ lang, c }) {
  const { origin } = c;
  return (
    <section className="content-width grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
      <Figure photo={media.orchard} lang={lang} ratio="aspect-[4/3] rounded-xl" sizes="(max-width: 1023px) calc(100vw - 32px), 640px" />
      <div>
        <Eyebrow className="flex items-center gap-3 text-(--pf-gold-ink)">
          <Rule className="w-8" />
          {origin.eyebrow}
        </Eyebrow>
        <SectionTitle className={cn(display, 'mt-4 text-[30px] sm:text-[38px]')}>{origin.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{origin.text}</p>
        <ul className="m-0 mt-5 grid gap-2 p-0">
          {origin.points.map(point => (
            <li key={point} className="flex list-none items-center gap-3 text-[15px] text-(--pf-ink)">
              <Check aria-hidden="true" size={18} strokeWidth={1.75} className="shrink-0 text-(--pf-gold-ink)" />
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-x-8">
          <TradeDeskButton variant="link" product={PRODUCT_ID} segment="foodservice" source="pf_foodservice_specs" className={cn(textLink, 'h-auto rounded-none px-0 py-0 hover:no-underline')}>
            {origin.specs}
          </TradeDeskButton>
          <Link to="/products/passion-fruit#orchard" className={textLink}>
            {origin.link}
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ c }) {
  return (
    <section id="faq" className="content-width scroll-mt-4 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionTitle className={cn(display, 'text-[28px] sm:text-[36px]')}>{c.faq.title}</SectionTitle>
          <p className="mt-3 text-base text-(--pf-muted)">{c.faq.text}</p>
        </div>
        <Faq items={c.faq.items} className="mt-8" />
      </div>
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
      <Origin lang={lang} c={c} />
      <Partnership c={c.partnership} icons={STEP_ICONS} segment="foodservice" source="pf_foodservice_partnership" titleClass={display} buttonClassName={solid} />
      <FaqSection c={c} />
      <CtaBanner id="pf-fs-cta" c={c.cta} photo={media.foodservicePulp} lang={lang} segment="foodservice" source="pf_foodservice_cta" titleClass={display} buttonClassName={solid} position="object-[50%_55%]" />
    </div>
  );
}
