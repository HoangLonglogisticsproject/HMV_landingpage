import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleHelp,
  Factory,
  FileText,
  FlaskConical,
  Images,
  Layers,
  LayoutGrid,
  MapPin,
  Plus,
  ShieldCheck,
  Truck,
  Wheat,
  Workflow,
} from 'lucide-react';
import { SupplyEvidenceGallery } from '@/features/cassava-supply-evidence/SupplyEvidence';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { cn } from '@/lib/utils';
import { PRODUCT } from './CassavaScoped';
import styles from './CassavaProcurement.module.css';

// The sections of the Chinese cassava page (CassavaChinaView), a procurement page for industrial buyers: each takes
// the page copy (data/cassavaChina.js) and nothing else, so the Korean page can adopt them with its own copy. Tailwind
// utilities on the HMV tokens (styles/index.css); `styles.heading` lets the utilities size the headings, which the
// legacy element rules would otherwise override (CassavaProcurement.module.css).

const WIDTH = 'mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10';
const H2 = cn(styles.heading, 'text-[22px] leading-[1.3] font-bold text-balance text-navy sm:text-2xl');
const H3 = cn(styles.heading, 'text-base leading-snug font-semibold text-navy');
const CARD = 'rounded-xl border border-border/70 bg-white';
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const PRIMARY = 'h-12 rounded-lg px-6 text-[15px] font-semibold text-white has-[>svg]:px-6';
const SECTION_ICONS = {
  overview: LayoutGrid,
  applications: Factory,
  'supply-evidence': Images,
  quality: BadgeCheck,
  capability: Layers,
  workflow: Workflow,
  faq: CircleHelp,
};
// In the order of the copy's items.
const APPLICATION_ICONS = [FlaskConical, Wheat, Factory];
const WHY_ICONS = [Layers, CalendarDays, ShieldCheck, Truck];
const RFQ_ICONS = [MapPin, Layers, FlaskConical];

function Checks({ items, className }) {
  return (
    <ul className={cn('flex flex-col gap-1.5 text-[13px] leading-snug text-ink', className)}>
      {items.map(item => (
        <li key={item} className="flex gap-2">
          <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** "50,000 吨/月": the amount leads, the unit follows in the label size. */
function Amount({ value, className }) {
  const [amount, ...unit] = value.split(' ');
  return (
    <>
      <span className={cn('leading-none font-bold', className)}>{amount}</span> {unit.join(' ')}
    </>
  );
}

/** A section: its heading and intro beside the content from 1024 px, above it below. */
function Section({ id, title, text, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-10 lg:py-12">
      <div className={cn(WIDTH, 'grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10')}>
        <div className="flex flex-col gap-2">
          <h2 id={`${id}-title`} className={H2}>
            {title}
          </h2>
          {text && <p className="text-sm leading-relaxed text-ink-muted">{text}</p>}
        </div>
        <div className="flex min-w-0 flex-col gap-3">{children}</div>
      </div>
    </section>
  );
}

// The network figures and the Intertek sample reference, each qualified as a reference.
function CapabilityPanel({ figures, intertek }) {
  return (
    <aside aria-labelledby="capability-panel-title" className="flex flex-col gap-5 rounded-2xl bg-navy p-6 text-white shadow-[0_28px_56px_-28px_rgb(0_29_89/0.75)] sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold text-cyan-light">{figures.eyebrow}</p>
        <h2 id="capability-panel-title" className={cn(styles.heading, 'text-xl leading-snug font-semibold text-white')}>
          {figures.title}
        </h2>
      </div>
      <dl className="grid grid-cols-2">
        {figures.items.map(f => (
          <div key={f.label} className="flex flex-col-reverse justify-end gap-1.5 border-t border-white/15 py-4 odd:pr-4 even:border-l even:pl-5">
            <dt className="text-[13px] leading-snug text-white/75">{f.label}</dt>
            <dd className="text-sm font-medium text-white/90">
              <Amount value={f.value} className="text-[28px] text-white sm:text-[32px]" />
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-3 rounded-xl border border-white/12 bg-white/6 p-4 sm:p-5">
        <h3 className={cn(styles.heading, 'text-xs leading-normal font-semibold text-cyan-light')}>{intertek.title}</h3>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <dl className="flex gap-7">
            {intertek.results.map(([name, value]) => (
              <div key={name} className="flex flex-col gap-1">
                <dt className="text-xs text-white/75">{name}</dt>
                <dd className="text-[28px] leading-none font-bold text-white">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-0.5 text-xs">
            <p className="font-medium text-white">{intertek.report}</p>
            <p className="text-white/70">{intertek.caption}</p>
          </div>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-white/70">{figures.short}</p>
    </aside>
  );
}

/** The first screen: positioning, the calls to action and the trust points beside the capability panel. */
export function ProcurementHero({ c, source }) {
  const { hero } = c;
  return (
    <section
      id="overview"
      aria-labelledby="scoped-title"
      className="bg-[radial-gradient(70%_60%_at_90%_0%,#e2edfa_0%,transparent_70%),linear-gradient(to_bottom,#ffffff,#f8fafc)]"
    >
      <div className={cn(WIDTH, 'grid gap-8 pt-4 pb-14 sm:pt-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:pb-16')}>
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold text-(--farm-green-ink)">{hero.eyebrow}</p>
          <h1 id="scoped-title" className={cn(styles.heading, 'text-[30px] leading-[1.25] font-bold text-balance text-navy sm:text-[38px] xl:text-[44px]')}>
            {hero.h1}
          </h1>
          <p className="max-w-[620px] text-[15px] leading-[1.85] text-ink-muted sm:text-base">{hero.lead}</p>
          <div className="flex flex-wrap items-center gap-3">
            <TradeDeskButton
              variant="brand"
              size="lg"
              className={cn(PRIMARY, 'shadow-[0_12px_24px_-12px_rgb(0_66_162/0.8)]')}
              product={PRODUCT}
              source={`${source}_hero`}
              title={c.tradeDesk}
            >
              {hero.cta}
              <ArrowUpRight className="size-[18px]" aria-hidden="true" />
            </TradeDeskButton>
            <a
              href="#quality"
              className={cn('inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-white px-5 text-[15px] font-semibold text-navy hover:border-brand/50 hover:text-brand', FOCUS)}
            >
              {hero.secondary}
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-medium text-ink sm:flex sm:flex-wrap sm:gap-x-6">
            {hero.trust.map(item => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <CapabilityPanel figures={c.figures} intertek={c.intertek} />
      </div>
    </section>
  );
}

/** Links to every section, over the foot of the hero; one row that scrolls sideways on narrow screens. */
export function SectionNav({ nav }) {
  return (
    <nav aria-label={nav.label} className={cn(WIDTH, 'relative -top-7')}>
      <ul className="flex gap-1 overflow-x-auto rounded-xl border border-border/70 bg-white p-1.5 shadow-[0_12px_32px_-16px_rgb(0_29_89/0.35)] [scrollbar-width:none] lg:justify-between">
        {nav.items.map(([id, label]) => {
          const Icon = SECTION_ICONS[id];
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap text-ink hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
              >
                <Icon className="size-4 text-brand" aria-hidden="true" />
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Applications({ content }) {
  return (
    <Section id="applications" title={content.title} text={content.text}>
      <div className="grid gap-3 md:grid-cols-3">
        {content.items.map((item, i) => {
          const Icon = APPLICATION_ICONS[i];
          return (
            <article key={item.title} className={cn(CARD, 'flex flex-col gap-3 p-5')}>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className={H3}>{item.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">{item.text}</p>
              <Checks items={item.points} />
            </article>
          );
        })}
      </div>
    </Section>
  );
}

export function WhyHmv({ content }) {
  return (
    <Section id="why-hmv" title={content.title} text={content.text}>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {content.items.map((item, i) => {
          const Icon = WHY_ICONS[i];
          return (
            <li key={item.title} className={cn(CARD, 'flex flex-col gap-2 p-5')}>
              <Icon className="size-6 text-emerald-600" aria-hidden="true" />
              <h3 className={H3}>{item.title}</h3>
              <p className="text-[13px] leading-relaxed text-ink-muted">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/** HMV's photographs (data/cassavaEvidence.js), each opening larger. */
export function Evidence({ evidence, lang }) {
  const copy = evidence.copy[lang];
  return (
    <Section id="supply-evidence" title={copy.title} text={copy.text}>
      <SupplyEvidenceGallery evidence={evidence} lang={lang} />
      <p className="text-xs text-ink-muted">{copy.note}</p>
    </Section>
  );
}

/** The Intertek sample results: the four buyers compare first, every result, and how to read them. */
export function Quality({ quality }) {
  return (
    <Section id="quality" title={quality.title} text={quality.note}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quality.highlights.map(m => (
              <div key={m.en} className="flex flex-col-reverse items-center justify-end gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-2 py-3.5 text-center">
                <dt className="flex flex-col text-[13px] leading-tight font-medium text-ink">
                  {m.label}
                  <span className="text-[11px] font-normal text-ink-muted">{m.en}</span>
                </dt>
                <dd className="text-2xl leading-none font-bold text-(--farm-green-ink)">{m.value}</dd>
              </div>
            ))}
          </dl>
          <div className={cn(CARD, 'overflow-hidden')}>
            <table className="w-full text-sm">
              <thead className="bg-surface text-[13px] text-navy">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold">
                    {quality.head[0]}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                    {quality.head[1]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {quality.rows.map(([name, value]) => (
                  <tr key={name}>
                    <th scope="row" className="px-4 py-2 text-left font-normal text-ink">
                      {name}
                    </th>
                    <td className="px-4 py-2 text-right font-medium whitespace-nowrap text-navy tabular-nums">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-ink-muted">{quality.source}</p>
        </div>
        <aside aria-labelledby="quality-explain-title" className={cn(CARD, 'flex flex-col gap-4 self-start p-5')}>
          <p className="flex items-center gap-2 border-b border-border/60 pb-3 text-sm font-semibold text-navy">
            <FileText className="size-4 shrink-0 text-brand" aria-hidden="true" />
            {quality.report}
          </p>
          <h3 id="quality-explain-title" className={H3}>
            {quality.explain.title}
          </h3>
          <Checks items={quality.explain.points} className="gap-2 text-sm leading-relaxed" />
        </aside>
      </div>
    </Section>
  );
}

/** The network figures, lighter than the hero's, where they come from, and HMV's role. */
export function Network({ network, figures }) {
  return (
    <Section id="capability" title={network.title} text={network.text}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <dl className={cn(CARD, 'grid grid-cols-2 gap-x-6 gap-y-5 p-5 sm:p-6')}>
            {figures.items.map(f => (
              <div key={f.label} className="flex flex-col-reverse justify-end gap-1.5">
                <dt className="text-[13px] leading-snug text-ink-muted">{f.label}</dt>
                <dd className="text-sm font-medium text-ink">
                  <Amount value={f.value} className="text-[26px] text-brand" />
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs leading-relaxed text-ink-muted">{figures.note}</p>
        </div>
        <div className="flex flex-col gap-3">
          <figure className={cn(CARD, 'flex flex-col gap-3 p-5')}>
            <ol className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              {network.regions.items.map(([name, role]) => (
                <li
                  key={name}
                  className="relative flex flex-1 items-center gap-2.5 rounded-lg bg-surface px-3 py-2.5 sm:flex-col sm:items-start sm:gap-1.5 sm:not-last:after:absolute sm:not-last:after:top-1/2 sm:not-last:after:left-full sm:not-last:after:w-4 sm:not-last:after:border-t-2 sm:not-last:after:border-dashed sm:not-last:after:border-brand/40"
                >
                  <MapPin className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-navy">{name}</span>
                    <span className="text-xs text-ink-muted">{role}</span>
                  </span>
                </li>
              ))}
            </ol>
            <figcaption className="text-[11px] text-ink-muted">{network.regions.label}</figcaption>
          </figure>
          <aside aria-labelledby="network-role-title" className={cn(CARD, 'flex flex-col gap-3 p-5')}>
            <h3 id="network-role-title" className={H3}>
              {network.role.title}
            </h3>
            <Checks items={network.role.points} className="text-sm" />
          </aside>
        </div>
      </div>
    </Section>
  );
}

/** Six numbered steps: one row on wide screens, one column on phones. */
export function ProcessSteps({ workflow }) {
  return (
    <Section id="workflow" title={workflow.title} text={workflow.text}>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {workflow.steps.map((step, i) => (
          <li key={step.title} className={cn(CARD, 'flex gap-3 p-4 xl:flex-col xl:items-center xl:gap-2 xl:text-center')}>
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 text-xs font-bold text-(--farm-green-ink)">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className={cn(H3, 'text-[15px]')}>{step.title}</h3>
              <p className="text-[13px] leading-snug text-ink-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** Questions as native disclosure widgets: keyboard-operable, and the answers in the server HTML. */
export function Faq({ faq }) {
  return (
    <Section id="faq" title={faq.title} text={faq.text}>
      <div className="grid items-start gap-3 lg:grid-cols-2">
        {faq.items.map(item => (
          <details key={item.q} className={cn(CARD, 'group')}>
            <summary
              className={cn(
                'flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-3.5 text-[15px] font-semibold text-navy hover:text-brand [&::-webkit-details-marker]:hidden',
                FOCUS,
              )}
            >
              {item.q}
              <Plus className="size-4 shrink-0 text-brand group-open:rotate-45 motion-safe:transition-transform" aria-hidden="true" />
            </summary>
            <div className="flex flex-col items-start gap-2 px-4 pb-4 text-sm leading-relaxed text-ink-muted">
              <p>{item.a}</p>
              {item.link && (
                <a href={item.link[0]} className={cn('inline-flex items-center gap-1 rounded font-medium text-brand hover:underline', FOCUS)}>
                  {item.link[1]}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}

/** The closing call to action: what to send, and the HMV Trade Desk (English, as the note says). */
export function FinalCta({ c, source }) {
  const { rfq } = c;
  return (
    <section id="rfq" aria-labelledby="rfq-title" className="pb-12 lg:pb-16">
      <div className={WIDTH}>
        <div className="grid gap-6 rounded-2xl bg-navy px-6 py-8 text-white shadow-[0_28px_56px_-32px_rgb(0_29_89/0.8)] sm:px-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] xl:items-center xl:gap-10 xl:px-10">
          <div className="flex flex-col gap-2">
            <h2 id="rfq-title" className={cn(styles.heading, 'text-2xl leading-snug font-bold text-white sm:text-[26px]')}>
              {rfq.title}
            </h2>
            <p className="text-sm leading-relaxed text-white/75">{rfq.lead}</p>
          </div>
          <div className="flex flex-col gap-4">
            <ul className="grid gap-3 sm:grid-cols-3">
              {rfq.items.map(([label, hint], i) => {
                const Icon = RFQ_ICONS[i];
                return (
                  <li key={label} className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/6 px-4 py-3">
                    <Icon className="size-5 shrink-0 text-cyan-light" aria-hidden="true" />
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-xs text-white/70">{hint}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
              <TradeDeskButton
                size="lg"
                className={cn(PRIMARY, 'bg-emerald-700 hover:bg-emerald-800')}
                product={PRODUCT}
                source={`${source}_rfq`}
                title={c.tradeDesk}
              >
                {rfq.cta}
                <ArrowRight className="size-[18px]" aria-hidden="true" />
              </TradeDeskButton>
              <p className="text-xs leading-relaxed text-white/70">{rfq.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
