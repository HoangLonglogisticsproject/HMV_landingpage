import { ArrowRight, Plus } from 'lucide-react';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import Image from '@/lib/image';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { PRODUCT_ID, SEGMENTS, passionFruitPages, segmentPath } from '@/data/passionFruitPages';
import styles from './PassionFruit.module.css';

// What the three golden passion fruit pages share: the segment navigation, a photograph, a section heading, the FAQ.
// Colors come from the page's palette (PassionFruit.module.css); layout is Tailwind utilities.

/** The three buyer segments as real links, the page's own marked as current. Below each page's hero. */
export function SegmentNav({ lang, active }) {
  const { nav } = passionFruitPages[lang];
  return (
    <nav aria-label={nav.label} className="border-y border-(--pf-line) bg-(--pf-bg)">
      <ul className="content-width m-auto grid max-w-3xl grid-cols-3 p-0">
        {SEGMENTS.map(segment => {
          const current = segment === active;
          return (
            <li key={segment} className="list-none">
              <Link
                to={segmentPath(segment)}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  '-mb-px flex min-h-12 items-center justify-center border-b-2 px-2 py-3 text-center text-[13px] leading-tight no-underline outline-offset-[-3px] outline-(--pf-ink) focus-visible:outline-2 sm:text-sm',
                  current ? 'border-(--pf-ink) font-bold text-(--pf-ink)' : 'border-transparent font-medium text-(--pf-muted) hover:text-(--pf-ink)',
                )}
              >
                {nav.items[segment]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A photograph from data/passionFruitMedia.js, at its real size, with `sizes` for the layout slot it fills. */
export function Photo({ photo, lang, sizes, className, eager = false }) {
  return (
    <Image
      src={photo.src}
      width={photo.width}
      height={photo.height}
      sizes={sizes}
      alt={photo.alt[lang]}
      className={cn('h-full w-full object-cover', className)}
      {...(eager ? { loading: 'eager', fetchPriority: 'high' } : { loading: 'lazy' })}
      decoding="async"
    />
  );
}

/** A photograph with its caption underneath. `ratio`: the frame's aspect-ratio utility. */
export function Figure({ photo, lang, sizes, ratio, className, eager }) {
  return (
    <figure className={className}>
      <div className={cn('overflow-hidden', ratio)}>
        <Photo photo={photo} lang={lang} sizes={sizes} eager={eager} />
      </div>
      <figcaption className="mt-2 text-xs leading-snug text-(--pf-muted)">{photo.caption[lang]}</figcaption>
    </figure>
  );
}

/** An h2 with the room the page's scroll padding gives an anchor. `leading-tight` comes last: tailwind-merge drops a leading that precedes a later text size. */
export function SectionTitle({ id, className, children }) {
  return (
    <h2 id={id} className={cn(styles.heading, styles.display, 'scroll-mt-4 text-[28px] font-bold text-pretty text-(--pf-ink) sm:text-[34px]', className, 'leading-tight')}>
      {children}
    </h2>
  );
}

export function Eyebrow({ className, children }) {
  return <p className={cn(styles.tracked, 'text-[11px] font-semibold uppercase', className)}>{children}</p>;
}

/** Questions and answers as native disclosure widgets: keyboard operable and readable without JavaScript. */
export function Faq({ items, className }) {
  return (
    <div className={cn(styles.faq, 'grid gap-2', className)}>
      {items.map(({ title, text }) => (
        <details key={title} className="group rounded-lg border border-(--pf-line) bg-(--pf-soft)">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-4 py-3 text-left text-[15px] font-semibold text-(--pf-ink) outline-offset-2 outline-(--pf-ink) focus-visible:outline-2">
            {title}
            <Plus aria-hidden="true" size={18} className={cn(styles.plus, 'shrink-0')} />
          </summary>
          <p className="px-4 pb-4 text-[15px] leading-relaxed text-(--pf-muted)">{text}</p>
        </details>
      ))}
    </div>
  );
}

/** A numbered list item: a figure, a title and a line, ruled above. */
export function Numbered({ index, title, text }) {
  return (
    <li className="list-none border-t border-(--pf-line) pt-4">
      <span className="text-xs font-semibold text-(--pf-gold-ink)">{String(index + 1).padStart(2, '0')}</span>
      <h3 className={cn(styles.heading, 'mt-1 text-lg leading-snug font-semibold text-(--pf-ink)')}>{title}</h3>
      {text && <p className="mt-1 text-[15px] leading-relaxed text-(--pf-muted)">{text}</p>}
    </li>
  );
}

/** A row of short commercial points under the segment navigation: a line icon, a title and a line, thin vertical rules between them. */
export function ValueStrip({ items, icons, label, className }) {
  return (
    <section aria-label={label} className={cn('content-width', className)}>
      <ul className="m-0 grid gap-x-6 gap-y-6 p-0 py-8 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:gap-x-0">
        {items.map(({ title, text }, i) => {
          const Icon = icons[i];
          return (
            <li key={title} className="flex list-none items-start gap-3 lg:px-5 lg:first:pl-0 lg:last:pr-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-(--pf-line)">
              <Icon aria-hidden="true" size={26} strokeWidth={1.5} className="mt-0.5 shrink-0 text-(--pf-gold-ink)" />
              <div>
                <p className="text-[15px] leading-snug font-semibold text-(--pf-ink)">{title}</p>
                <p className="mt-1 text-[13px] leading-snug text-(--pf-muted)">{text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The cooperation steps of a segment page, on the page's own background: an icon, a numbered title and a line per step under a
 * fine gold rule, an arrow between steps from 1024 px, one call to action to the Trade Desk (`segment`, `source`) and a note.
 * `titleClass`: the segment's heading style; `buttonClassName`: its button.
 */
export function Partnership({ c, icons, segment, source, titleClass, buttonClassName, className }) {
  return (
    <section className={cn('content-width py-14 sm:py-20', className)}>
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow className="inline-flex items-center gap-3 text-(--pf-gold-ink)">
          <span aria-hidden="true" className="block h-px w-8 bg-(--pf-gold)" />
          {c.eyebrow}
          <span aria-hidden="true" className="block h-px w-8 bg-(--pf-gold)" />
        </Eyebrow>
        <SectionTitle className={cn(titleClass, 'mt-4 text-[30px] sm:text-[38px]')}>{c.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed text-(--pf-muted)">{c.text}</p>
      </div>
      <ol className="m-0 mt-12 grid gap-x-14 gap-y-8 p-0 lg:grid-cols-3">
        {c.steps.map(({ title, text }, i) => {
          const Icon = icons[i];
          return (
            <li key={title} className="relative flex list-none items-start gap-4 border-t border-(--pf-gold)/60 pt-6">
              <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-(--pf-soft) text-(--pf-gold-ink)">
                <Icon size={22} strokeWidth={1.5} />
              </span>
              <div>
                <h3 className={cn(styles.heading, titleClass, 'text-xl leading-snug')}>
                  <span className="text-(--pf-gold-ink)">{String(i + 1).padStart(2, '0')}.</span> {title}
                </h3>
                <p className="mt-1 text-[15px] leading-relaxed text-(--pf-muted)">{text}</p>
              </div>
              {i < c.steps.length - 1 && <ArrowRight aria-hidden="true" size={18} className="absolute top-8 -right-[37px] hidden text-(--pf-gold) lg:block" />}
            </li>
          );
        })}
      </ol>
      <div className="mt-10 text-center">
        <TradeDeskButton size="lg" product={PRODUCT_ID} segment={segment} source={source} className={buttonClassName}>
          {c.cta}
          <ArrowRight />
        </TradeDeskButton>
        <p className="mt-4 text-sm text-(--pf-muted)">{c.note}</p>
      </div>
    </section>
  );
}

/**
 * The closing banner of a segment page: a compact panel on the page's soft tone with the heading, a line, the call to action
 * to the Trade Desk and a photograph that fades into it (on the left with `photoFirst`). No second dark block.
 */
export function CtaBanner({ id, c, photo, lang, segment, source, titleClass, buttonClassName, position, photoFirst = false }) {
  return (
    <section aria-labelledby={id} className="content-width pb-14 sm:pb-20">
      <div className="grid overflow-hidden rounded-2xl border border-(--pf-line) bg-(--pf-soft) md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className={cn('flex flex-col items-start justify-center p-8 sm:p-12', photoFirst && 'md:order-2')}>
          <h2 id={id} className={cn(styles.heading, titleClass, 'text-[28px] leading-tight text-balance text-(--pf-ink) sm:text-[36px]')}>{c.title}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-(--pf-muted)">{c.text}</p>
          <TradeDeskButton size="lg" product={PRODUCT_ID} segment={segment} source={source} className={cn(buttonClassName, 'mt-6')}>
            {c.button}
            <ArrowRight />
          </TradeDeskButton>
        </div>
        <div className={cn('relative min-h-56 md:min-h-72', photoFirst && 'md:order-1')}>
          <Photo photo={photo} lang={lang} sizes="(max-width: 767px) calc(100vw - 32px), 480px" className={cn('absolute inset-0', position)} />
          <span aria-hidden="true" className={cn('absolute inset-y-0 hidden w-1/3 from-(--pf-soft) to-transparent md:block', photoFirst ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r')} />
        </div>
      </div>
    </section>
  );
}
