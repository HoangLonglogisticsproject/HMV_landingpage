import { Plus } from 'lucide-react';
import Image from '@/lib/image';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { SEGMENTS, passionFruitPages, segmentPath } from '@/data/passionFruitPages';
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
