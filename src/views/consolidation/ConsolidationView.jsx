import {
  ArrowDown,
  ArrowRight,
  Boxes,
  Check,
  CircleAlert,
  Factory,
  FileText,
  MapPin,
  Plus,
  Repeat,
  Route,
  Store,
  Truck,
  Warehouse,
} from 'lucide-react';
import { vnCambodiaConsolidation } from '@/data/vnCambodiaConsolidation';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { RouteAssessmentForm } from './RouteAssessmentForm';
import styles from './Consolidation.module.css';

// The Vietnam–Cambodia consolidation page body (data/vnCambodiaConsolidation.js), shared by both builds, in the site's
// chrome: who it is for, when consolidation fits, the workflow, the corridor and its route assessment, what HMV needs,
// the boundaries, questions, then the route assessment form (the page's one conversion). Server-rendered text and
// links; the form is the client island. /logistics stays the logistics hub: the hero and the corridor link back to it.
// Tailwind utilities on the HMV tokens; `styles.heading` lets them size the headings.

const WIDTH = 'mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10';
const H2 = cn(styles.heading, 'text-[22px] leading-[1.3] font-bold text-balance text-navy sm:text-2xl');
const H3 = cn(styles.heading, 'text-base leading-snug font-semibold text-navy');
const CARD = 'rounded-xl border border-border/70 bg-white';
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const AUDIENCE_ICONS = [Factory, Truck, Store, Repeat];
const CORRIDOR_ICONS = [MapPin, Route, FileText, Boxes];
/** The form's anchor; the calls to action link to it. */
export const FORM_ID = 'route-assessment';

/** A section: its heading and intro above the content, which takes the full width (the workflow's nine steps). */
function Section({ id, title, text, children }) {
  const heading = `${id}-title`;
  return (
    <section id={id} aria-labelledby={heading} className={cn(WIDTH, 'flex flex-col gap-5 py-10 lg:py-12')}>
      <header className="flex max-w-[720px] flex-col gap-2">
        <h2 id={heading} className={H2}>
          {title}
        </h2>
        {text && <p className="text-[15px] leading-relaxed text-ink-muted">{text}</p>}
      </header>
      {children}
    </section>
  );
}

function Checks({ items, className }) {
  return (
    <ul className={cn('flex flex-col gap-2 text-sm leading-snug text-ink', className)}>
      {items.map(item => (
        <li key={item} className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Cards of a title and a text, each with its icon (by position: the copy has one order in both languages). */
function Cards({ items, icons }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => {
        const Icon = icons[i];
        return (
          <li key={item.title} className={cn(CARD, 'flex gap-3 p-4 sm:p-5')}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className={H3}>{item.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{item.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Hero({ c }) {
  const { hero } = c;
  return (
    <section
      id="overview"
      aria-labelledby="consolidation-title"
      className="bg-[radial-gradient(70%_60%_at_90%_0%,#e2edfa_0%,transparent_70%),linear-gradient(to_bottom,#ffffff,#f8fafc)]"
    >
      <div className={cn(WIDTH, 'grid gap-8 pt-6 pb-12 sm:pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12 lg:pb-16')}>
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold text-(--farm-green-ink)">{hero.eyebrow}</p>
          <h1 id="consolidation-title" className={cn(styles.heading, 'text-[28px] leading-[1.25] font-bold text-balance text-navy sm:text-[36px] xl:text-[42px]')}>
            {hero.h1}
          </h1>
          <p className="max-w-[640px] text-[15px] leading-[1.85] text-ink-muted sm:text-base">{hero.lead}</p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`#${FORM_ID}`}
              className={cn('inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px_rgb(0_66_162/0.8)] hover:bg-brand-dark', FOCUS)}
            >
              {hero.cta}
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
            <Link
              to="/logistics"
              className={cn('inline-flex min-h-12 items-center gap-2 rounded-lg border border-border bg-white px-5 text-[15px] font-semibold text-navy hover:border-brand/50 hover:text-brand', FOCUS)}
            >
              {hero.secondary}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid gap-x-5 gap-y-2 text-sm font-medium text-ink sm:grid-cols-2">
            {hero.points.map(point => (
              <li key={point} className="flex items-center gap-1.5">
                <Check className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <aside aria-labelledby="assessment-panel-title" className="flex flex-col gap-4 rounded-2xl bg-navy p-6 text-white shadow-[0_28px_56px_-32px_rgb(0_29_89/0.8)] sm:p-7">
          <span className="flex size-10 items-center justify-center rounded-lg bg-white/10 text-cyan-light">
            <Warehouse className="size-5" aria-hidden="true" />
          </span>
          <h2 id="assessment-panel-title" className={cn(styles.heading, 'text-lg leading-snug font-semibold text-white')}>
            {hero.panel.title}
          </h2>
          <ul className="flex flex-col gap-2.5 text-sm text-white/85">
            {hero.panel.items.map(it => (
              <li key={it} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-cyan-light" aria-hidden="true" />
                {it}
              </li>
            ))}
          </ul>
          <p className="border-t border-white/15 pt-3 text-xs leading-relaxed text-white/70">{hero.panel.note}</p>
        </aside>
      </div>
    </section>
  );
}

function Fit({ fit }) {
  return (
    <Section id="when-to-consolidate" title={fit.title} text={fit.text}>
      <div className="grid gap-3 md:grid-cols-2">
        {[fit.ltl, fit.ftl].map((side, i) => (
          <div key={side.title} className={cn(CARD, 'flex flex-col gap-3 p-4 sm:p-5', i === 0 && 'border-brand/40')}>
            <h3 className={H3}>{side.title}</h3>
            <Checks items={side.items} />
          </div>
        ))}
      </div>
      <p className="text-sm text-ink-muted">{fit.note}</p>
    </Section>
  );
}

function Workflow({ workflow }) {
  return (
    <Section id="workflow" title={workflow.title} text={workflow.text}>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {workflow.steps.map((step, i) => (
          <li key={step.title} className={cn(CARD, 'flex gap-3 p-4')}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 text-xs font-bold text-emerald-700">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-0.5">
              <h3 className={H3}>{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Corridor({ corridor }) {
  return (
    <Section id="corridor" title={corridor.title} text={corridor.text}>
      <Cards items={corridor.items} icons={CORRIDOR_ICONS} />
      <Link to="/logistics#cross-border" className={cn('inline-flex items-center gap-1.5 self-start rounded text-sm font-medium text-brand hover:underline', FOCUS)}>
        {corridor.hub}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </Section>
  );
}

function Boundaries({ boundaries }) {
  return (
    <Section id="boundaries" title={boundaries.title} text={boundaries.text}>
      <ul className={cn(CARD, 'flex flex-col divide-y divide-border/60')}>
        {boundaries.items.map(it => (
          <li key={it} className="flex gap-3 px-4 py-3 text-sm leading-relaxed text-ink">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
            {it}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Questions as one list of native disclosure widgets: keyboard-operable, the answers in the server HTML; no FAQ data. */
function Faq({ faq }) {
  return (
    <Section id="faq" title={faq.title}>
      <ul className={cn(CARD, 'max-w-[880px] divide-y divide-border/60')}>
        {faq.items.map(({ q, a }) => (
          <li key={q}>
            <details className="group">
              <summary className={cn('flex cursor-pointer list-none items-center gap-3 px-4 py-4 font-semibold text-navy hover:text-brand [&::-webkit-details-marker]:hidden', FOCUS)}>
                <Plus className="size-4 shrink-0 text-brand group-open:rotate-45 motion-safe:transition-transform" aria-hidden="true" />
                {q}
              </summary>
              <p className="pr-4 pb-4 pl-11 text-sm leading-relaxed text-ink-muted">{a}</p>
            </details>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** @param {{ lang: 'en' | 'vi' }} props */
export function ConsolidationView({ lang }) {
  const c = vnCambodiaConsolidation[lang];
  return (
    <div className="bg-(--surface-light)">
      <Hero c={c} />
      <div className="divide-y divide-border/50">
        <Section id="audience" title={c.audience.title} text={c.audience.text}>
          <Cards items={c.audience.items} icons={AUDIENCE_ICONS} />
        </Section>
        <Fit fit={c.fit} />
        <Workflow workflow={c.workflow} />
        <Corridor corridor={c.corridor} />
        <Section id="shipment-information" title={c.info.title} text={c.info.text}>
          <Checks items={c.info.items} className={cn(CARD, 'grid gap-x-6 p-4 sm:grid-cols-2 sm:p-5')} />
        </Section>
        <Boundaries boundaries={c.boundaries} />
        <Faq faq={c.faq} />
      </div>
      <section id={FORM_ID} aria-labelledby={`${FORM_ID}-title`} className="pt-4 pb-14 lg:pb-16">
        <div className={cn(WIDTH, 'grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10')}>
          <div className="flex flex-col gap-3">
            <h2 id={`${FORM_ID}-title`} className={H2}>
              {c.form.title}
            </h2>
            <p className="text-sm leading-relaxed text-ink-muted">{c.form.lead}</p>
          </div>
          <RouteAssessmentForm lang={lang} copy={c.form} source={`${lang}_route_assessment`} />
        </div>
      </section>
    </div>
  );
}
