import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  Building2,
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
  MessagesSquare,
  Plus,
  ShieldCheck,
  TrendingUp,
  Truck,
  Wheat,
  Workflow,
} from 'lucide-react';
import { Lightbox, ZoomTrigger } from '@/components/common/Lightbox';
import { cassavaEvidence } from '@/data/cassavaEvidence';
import { SupplyEvidenceGallery } from '@/features/cassava-supply-evidence/SupplyEvidence';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { PRODUCT, ScopedPage } from './CassavaScoped';
import { QualityReportPreview } from './QualityReportPreview';
import styles from './CassavaProcurement.module.css';

// The cassava procurement page, for industrial buyers (CassavaProcurementContent): in its own chrome on the page-scoped
// pages (CassavaProcurementPage; Simplified Chinese: CassavaChinaView, Korean: CassavaKoreaView), in the site's on the
// EN/VI product page (ProductView). Each section takes its part of the page copy and nothing else; the copy of every
// language has one shape (data/cassavaChina.js, data/cassavaKorea.js, data/productPages.js), and an item whose icon
// depends on what it is carries a `key`, since the order differs between languages. Tailwind utilities on the HMV tokens
// (styles/index.css); `styles.heading` lets the utilities size the headings, which the legacy element rules would
// otherwise override (CassavaProcurement.module.css).

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
// By the item's `key`, never its position.
const APPLICATION_ICONS = { bioethanol: FlaskConical, feed: Wheat, starch: Factory };
const WHY_ICONS = { network: Layers, monthly: CalendarDays, quality: ShieldCheck, consolidation: Boxes, delivery: Truck };
const RFQ_ICONS = { company: Building2, destination: MapPin, volume: Layers, application: FlaskConical };

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

// Beside the hero, each qualified as a reference: the network figures (`c.figures`) or, on a page that shows them
// after the buyer value (Korean), its facts of what a factory buys (`c.panel`); then the Intertek sample reference.
function HeroPanel({ c }) {
  const { panel, figures, intertek } = c;
  const head = panel ?? figures;
  return (
    <aside aria-labelledby="capability-panel-title" className="flex flex-col gap-5 rounded-2xl bg-navy p-6 text-white shadow-[0_28px_56px_-28px_rgb(0_29_89/0.75)] sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold text-cyan-light">{head.eyebrow}</p>
        <h2 id="capability-panel-title" className={cn(styles.heading, 'text-xl leading-snug font-semibold text-white')}>
          {head.title}
        </h2>
      </div>
      {panel ? (
        <dl className="grid grid-cols-2">
          {panel.items.map(([term, value]) => (
            <div key={term} className="flex flex-col gap-1.5 border-t border-white/15 py-4 odd:pr-4 even:border-l even:pl-5">
              <dt className="text-[13px] leading-snug text-white/75">{term}</dt>
              <dd className="text-base leading-snug font-semibold text-white">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
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
      )}
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
      {head.short && <p className="text-xs leading-relaxed text-white/70">{head.short}</p>}
    </aside>
  );
}

/** The first screen: positioning, the calls to action and the trust points beside the hero panel. */
function ProcurementHero({ c, source }) {
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
          {/* The secondary audience, after the primary one (Korean: importers and wholesalers after manufacturers). */}
          {hero.support && <p className="max-w-[620px] border-l-2 border-border pl-3 text-sm leading-relaxed text-ink-muted">{hero.support}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <TradeDeskButton
              variant="brand"
              size="lg"
              // Alone on its line and wider than a phone (the EN and VI labels), the label wraps instead of widening the
              // page; on one line the button stays 48 px tall.
              className={cn(PRIMARY, 'h-auto min-h-12 shrink py-2.5 text-center whitespace-normal shadow-[0_12px_24px_-12px_rgb(0_66_162/0.8)]')}
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
          {/* A product buyers confuse with this one (EN/VI: tapioca starch), with its own page. */}
          {hero.seeAlso && (
            <p className="text-sm">
              <Link to={`/products/${hero.seeAlso.id}`} className={cn('rounded font-medium text-brand hover:underline', FOCUS)}>
                {hero.seeAlso.text}
              </Link>
            </p>
          )}
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-medium text-ink sm:flex sm:flex-wrap sm:gap-x-6">
            {hero.trust.map(item => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <HeroPanel c={c} />
      </div>
    </section>
  );
}

/** Links to every section, over the foot of the hero; one row that scrolls sideways on narrow screens. */
function SectionNav({ nav }) {
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

function Applications({ content }) {
  return (
    <Section id="applications" title={content.title} text={content.text}>
      <div className="grid gap-3 md:grid-cols-3">
        {content.items.map(item => {
          const Icon = APPLICATION_ICONS[item.key];
          return (
            <article key={item.title} className={cn(CARD, 'flex flex-col gap-3 p-5')}>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className={H3}>{item.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">{item.text}</p>
              {item.points && <Checks items={item.points} />}
            </article>
          );
        })}
      </div>
    </Section>
  );
}

function WhyHmv({ content }) {
  return (
    <Section id="why-hmv" title={content.title} text={content.text}>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {content.items.map(item => {
          const Icon = WHY_ICONS[item.key];
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
function Evidence({ evidence, lang }) {
  const copy = evidence.copy[lang];
  return (
    <Section id="supply-evidence" title={copy.title} text={copy.text}>
      <SupplyEvidenceGallery evidence={evidence} lang={lang} />
      <p className="text-xs text-ink-muted">{copy.note}</p>
    </Section>
  );
}

/** The Intertek sample results: the four buyers compare first, every result, then the analysis they come from. */
export function Quality({ quality, reportPages }) {
  return (
    <Section id="quality" title={quality.title} text={quality.note}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quality.highlights.map(m => (
              <div key={m.en} className="flex flex-col-reverse items-center justify-end gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-2 py-3.5 text-center">
                <dt className="flex flex-col text-[13px] leading-tight font-medium text-ink">
                  {m.label}
                  {/* The English name, the report's, beside another language's; on the English page it is the name. */}
                  {m.en !== m.label && <span className="text-[11px] font-normal text-ink-muted">{m.en}</span>}
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
        <QualityEvidence evidence={quality.evidence} reportPages={reportPages} />
      </div>
    </Section>
  );
}

/**
 * The laboratory analysis behind the results: who analysed what, how to read it, and the report itself once its
 * sanitized pages are committed (data/cassavaQualityReport.js); without them, no button.
 */
function QualityEvidence({ evidence, reportPages }) {
  const report = {
    title: evidence.name,
    note: evidence.redacted,
    pages: reportPages.map((p, i) => ({ ...p, alt: `${evidence.name} · ${i + 1}/${reportPages.length}` })),
  };
  return (
    <aside aria-labelledby="quality-evidence-title" className={cn(CARD, 'flex flex-col gap-4 self-start p-5')}>
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <h3 id="quality-evidence-title" className={H3}>
            {evidence.title}
          </h3>
          {evidence.en && <p className="text-xs text-ink-muted">{evidence.en}</p>}
        </div>
      </div>
      <dl className="flex flex-col gap-2 border-y border-border/60 py-4 text-[13px]">
        {evidence.details.map(([term, value]) => (
          <div key={term} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
            <dt className="text-ink-muted">{term}</dt>
            <dd className="font-medium wrap-anywhere text-navy">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2.5">
        <h4 className="text-sm font-semibold text-navy">{evidence.explain.title}</h4>
        <Checks items={evidence.explain.points} className="gap-2 text-sm leading-relaxed" />
      </div>
      {report.pages.length > 0 && (
        <Lightbox>
          <ZoomTrigger
            image={report}
            className={cn(
              'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand-soft px-4 text-center text-sm font-semibold text-brand hover:border-brand/60',
              FOCUS,
            )}
          >
            <FileText className="size-4" aria-hidden="true" />
            {evidence.view}
          </ZoomTrigger>
          <QualityReportPreview closeLabel={evidence.close} />
        </Lightbox>
      )}
    </aside>
  );
}

/** The network figures, lighter than the hero's, where they come from, and HMV's role. */
function Network({ network, figures }) {
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
function ProcessSteps({ workflow }) {
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
function Faq({ faq }) {
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
function FinalCta({ c, source }) {
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
              {rfq.items.map(item => {
                const Icon = RFQ_ICONS[item.key];
                return (
                  <li key={item.key} className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/6 px-4 py-3">
                    <Icon className="size-5 shrink-0 text-cyan-light" aria-hidden="true" />
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold">{item.label}</span>
                      {item.hint && <span className="text-xs text-white/70">{item.hint}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
              <TradeDeskButton
                size="lg"
                // Wider than its card on a phone (EN, VI, KO at 320 px), the label wraps; on one line the button stays 48 px
                // tall. No `shrink`: from 640 px it sits beside the note, which would squeeze it onto two lines.
                className={cn(PRIMARY, 'h-auto min-h-12 py-2.5 text-center whitespace-normal bg-emerald-700 hover:bg-emerald-800')}
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

/**
 * The buyer guides, where the page has them (EN/VI: the cassava articles; Chinese: its guides): linked cards. Plain links
 * with the page's own URLs, as on the page-scoped pages, which render outside the site's router.
 */
function Guides({ guides }) {
  return (
    <Section id="guides" title={guides.title} text={guides.text}>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {guides.items.map(item => (
          <li key={item.href} className="flex">
            <a href={item.href} className={cn(CARD, 'group flex w-full flex-col gap-2 p-4 hover:border-brand/50 sm:p-5', FOCUS)}>
              <BookOpen className="size-5 text-brand" aria-hidden="true" />
              <h3 className={cn(H3, 'group-hover:text-brand')}>{item.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{item.text}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-brand">
                {guides.more}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * Chinese-speaking commercial follow-up (Chinese page: `support`), before the closing call to action and on the Chinese
 * guides: what it covers, nothing more. `className` places it (default: the page width).
 */
export function CommercialSupport({ support, className = cn(WIDTH, 'pb-6') }) {
  return (
    <section id="commercial-support" aria-labelledby="commercial-support-title" className={className}>
      <div className={cn(CARD, 'flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8')}>
        <div className="flex gap-3 lg:max-w-[460px]">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <MessagesSquare className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 id="commercial-support-title" className={H3}>
              {support.title}
            </h2>
            <p className="text-sm leading-relaxed text-ink-muted">{support.text}</p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-2">
          {support.items.map(item => (
            <li key={item} className="flex items-center gap-1.5 rounded-full border border-border/70 bg-(--surface-light) px-3 py-1.5 text-sm font-medium text-navy">
              <Check className="size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The page's market intelligence, where it has a market page (the Korean one): what HMV follows, and the link to it. */
function MarketInsight({ market }) {
  return (
    <Section id="market" title={market.title}>
      <div className={cn(CARD, 'flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:gap-8')}>
        <div className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <TrendingUp className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <h3 className={H3}>{market.heading}</h3>
            <p className="text-sm leading-relaxed text-ink-muted">{market.text}</p>
          </div>
        </div>
        <a
          href={market.link.href}
          className={cn('inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-lg border border-border bg-white px-4 text-sm font-semibold text-navy hover:border-brand/50 hover:text-brand md:self-center', FOCUS)}
        >
          {market.link.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </Section>
  );
}

/**
 * The procurement page's body, whatever chrome surrounds it: the hero, the section strip, the sections in procurement
 * order, the buyer guides and the market intelligence block where the page has them (`content.guides`, `market`), the
 * Chinese commercial support (`content.support`) and the closing call to action. `content` is
 * the page copy; `lang`, the supply-evidence copy's language (data/cassavaEvidence.js: 'en', 'vi', 'zh', 'ko'); `source`
 * prefixes the analytics source of its calls to action (`en_hero`, `ko_rfq`…); `reportPages`, the analysis report's
 * pages (data/cassavaQualityReport.js).
 */
export function CassavaProcurementContent({ content: c, lang, source, reportPages, market }) {
  return (
    <>
      <ProcurementHero c={c} source={source} />
      <div className="bg-(--surface-light)">
        <SectionNav nav={c.sections} />
        <div className="-mt-7 divide-y divide-border/50">
          <Applications content={c.applications} />
          <WhyHmv content={c.why} />
          <Evidence evidence={cassavaEvidence} lang={lang} />
          <Quality quality={c.quality} reportPages={reportPages} />
          <Network network={c.network} figures={c.figures} />
          <ProcessSteps workflow={c.workflow} />
          <Faq faq={c.faq} />
          {c.guides && <Guides guides={c.guides} />}
          {market && <MarketInsight market={market} />}
        </div>
        {c.support && <CommercialSupport support={c.support} />}
        <FinalCta c={c} source={source} />
      </div>
    </>
  );
}

/**
 * A page-scoped cassava page in `locale` ('zh-CN', 'ko'): its own chrome (ScopedPage) around the procurement page's
 * body. The EN/VI page has the site's chrome instead (views/products/ProductView, inside SiteShell).
 */
export function CassavaProcurementPage({ content, locale, source, reportPages, market }) {
  return (
    <ScopedPage c={content} locale={locale} source={source}>
      {/* The supply-evidence copy is keyed by language, without the region. */}
      <CassavaProcurementContent content={content} lang={locale.split('-')[0]} source={source} reportPages={reportPages} market={market} />
    </ScopedPage>
  );
}
