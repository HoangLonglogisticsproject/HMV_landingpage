import { ArrowRight, ArrowUpRight, Check, CircleAlert, Copy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products } from '@/data/hmv';
import { VOLUME_UNITS } from '@/features/trade-desk/rules';
import { LIMITS } from '@/features/trade-desk/validation';
import styles from './QuickRfq.module.css';

// The Quick RFQ's screens. Presentational: state, validation and submission live in QuickRfq.jsx. `id(key)` is the DOM
// id of a control (the focus handling and the labels share it); `error(field)` the message of a field with an error.

const CONTROL = 'block w-full min-h-12 rounded-[10px] border border-border bg-white/80 px-3.5 py-3 text-base font-normal text-ink placeholder:text-ink-muted/70 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none aria-invalid:border-destructive disabled:opacity-60 motion-reduce:transition-none';
const LABEL = 'text-[13px] font-semibold text-ink';
const TEXT_BUTTON = 'inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 text-sm font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
// The card: white, a soft shadow (it never sits over a photograph).
const CARD = `rfq-form ${styles.card} border border-border/70 bg-white shadow-[0_18px_40px_-28px_rgb(15_23_42/.35)]`;
// `strip`: a compact horizontal layout, the card's cells in a grid: intro, product, destination, volume and Continue in one
// row from 1240 px; the intro above and the four controls in a row from 1000 px; two columns from 641 px; one column
// below. The same elements, only placed.
const STRIP = 'min-[641px]:grid-cols-2 min-[641px]:items-end min-[1000px]:grid-cols-[minmax(192px,1fr)_minmax(160px,1fr)_minmax(240px,1.4fr)_auto] min-[1240px]:grid-cols-[minmax(236px,1.2fr)_minmax(205px,1.1fr)_minmax(180px,1fr)_minmax(252px,1.3fr)_auto]';
const TITLE = `${styles.heading} font-['Plus_Jakarta_Sans'] leading-snug font-extrabold text-navy outline-none`;

/** The aria attributes of a control with an error message (below it, `${id}-error`). */
const invalid = (id, message) => (message ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {});

/** A message in words, with an icon: an error is never shown by colour alone. */
function ErrorText({ id, children }) {
  return (
    <p id={`${id}-error`} className="flex items-start gap-1.5 text-[13px] text-destructive">
      <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

/** A labelled control with its error. `children(aria)` renders the control, given the attributes the error needs. */
function Field({ id, label, optional, error, children }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className={`${LABEL} flex flex-wrap items-baseline gap-2`}>
        {label}
        {optional && <> <small className="text-[11px] font-medium text-ink-muted">{optional}</small></>}
      </label>
      {children(invalid(id, error))}
      {error && <ErrorText id={id}>{error}</ErrorText>}
    </div>
  );
}

/** `1 Requirement → 2 Contact`: the step the buyer is on is marked (aria-current), the one behind them checked. */
function Progress({ c, step }) {
  const names = [['requirement', c.stepRequirement], ['contact', c.stepContact]];
  const at = names.findIndex(([name]) => name === step);
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-muted" aria-label={c.progress}>
      {names.map(([name, text], i) => (
        <li key={name} aria-current={i === at ? 'step' : undefined} className={`flex items-center gap-2 ${i === at ? 'text-ink' : ''}`}>
          <span className={`grid size-6 place-items-center rounded-full text-xs ${i === at ? 'bg-brand text-white' : 'border border-border bg-white'}`} aria-hidden="true">
            {i < at ? <Check size={14} /> : i + 1}
          </span>
          {text}
          {i < names.length - 1 && <ArrowRight size={14} className="ml-1" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

/** Step 1: product (unless a product page fixes it), destination, volume and its unit. */
export function RequirementStep({ c, lang, id, error, values, unit, locked, strip, onChange }) {
  return (
    <>
      {locked ? (
        <p className="text-[15px] text-ink"><span className="text-ink-muted">{c.product}:</span> <strong>{locked[lang]}</strong></p>
      ) : (
        <Field id={id('product')} label={c.product} error={error('product')}>
          {aria => (
            <select id={id('product')} className={CONTROL} required value={values.product} onChange={e => onChange('product', e.target.value)} {...aria}>
              <option value="" disabled>{c.chooseProduct}</option>
              {products.map(p => <option key={p.id} value={p.id}>{p[lang]}</option>)}
            </select>
          )}
        </Field>
      )}
      <Field id={id('destination')} label={c.destination} error={error('destination')}>
        {aria => (
          <input id={id('destination')} className={CONTROL} required autoComplete="off" maxLength={LIMITS.destination} placeholder={c.destinationPlaceholder} value={values.destination} onChange={e => onChange('destination', e.target.value)} {...aria} />
        )}
      </Field>
      <Field id={id('volume.amount')} label={c.volume} error={error('volume.amount')}>
        {aria => (
          <div className={`grid gap-2 ${strip ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,9rem)]' : 'sm:grid-cols-[minmax(0,1fr)_minmax(0,13rem)]'}`}>
            <input id={id('volume.amount')} className={CONTROL} required inputMode="decimal" autoComplete="off" maxLength={LIMITS['volume.amount']} placeholder={c.amountPlaceholder} value={values.amount} onChange={e => onChange('amount', e.target.value)} {...aria} />
            <select className={CONTROL} aria-label={c.unit} value={unit} onChange={e => onChange('unit', e.target.value)}>
              {Object.entries(VOLUME_UNITS).map(([name, label]) => <option key={name} value={name}>{label[lang]}</option>)}
            </select>
          </div>
        )}
      </Field>
      <Button type="submit" size="lg" className="day-cta rfq-submit">{c.continue}<ArrowRight size={18} /></Button>
    </>
  );
}

const submitLabel = (c, status) => ({ sending: c.sending, failed: c.retry })[status] ?? c.submit;

/** Step 2: company, work email, the optional details folded away, consent, the send and, after a failure, the retry. */
export function ContactStep({ c, lang, id, error, values, summary, more, status, strip, onChange, onToggleMore, onEdit, onMailto }) {
  const sending = status === 'sending';
  // In a strip the contact step is a wide card of two columns from 900 px: the pairs side by side, the rest across.
  const wide = strip ? 'min-[900px]:col-span-2' : '';
  return (
    <fieldset disabled={sending} className={`m-0 grid min-w-0 gap-4 border-0 p-0 ${strip ? 'min-[641px]:col-span-full min-[900px]:grid-cols-2 min-[900px]:gap-x-5' : ''}`}>
      <div className={`flex items-start justify-between gap-3 ${wide}`}>
        <h3 id={id('heading')} tabIndex={-1} className={`${TITLE} text-xl`}>{c.contactTitle}</h3>
        <button type="button" className={`${TEXT_BUTTON} -mt-2.5 shrink-0`} onClick={onEdit}>{c.edit}</button>
      </div>
      <p className={`-mt-2 text-[13px] text-ink-muted ${wide}`}>
        <span className="sr-only">{c.requirement}: </span>
        {[summary.product, summary.destination, summary.volume].join(' · ')}
      </p>
      <Field id={id('contact.company')} label={c.company} error={error('contact.company')}>
        {aria => (
          <input id={id('contact.company')} className={CONTROL} required autoComplete="organization" maxLength={LIMITS['contact.company']} value={values.company} onChange={e => onChange('company', e.target.value)} {...aria} />
        )}
      </Field>
      <Field id={id('contact.email')} label={c.email} error={error('contact.email')}>
        {aria => (
          <input id={id('contact.email')} className={CONTROL} type="email" required autoComplete="email" inputMode="email" maxLength={LIMITS['contact.email']} value={values.email} onChange={e => onChange('email', e.target.value)} {...aria} />
        )}
      </Field>
      <button type="button" className={`${TEXT_BUTTON} justify-self-start ${wide}`} aria-expanded={more} aria-controls={id('more')} onClick={onToggleMore}>
        <Plus size={16} aria-hidden="true" />
        {c.more}
      </button>
      <div id={id('more')} hidden={!more} className={`grid gap-4 ${wide}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={id('contact.name')} label={c.name} optional={c.optional} error={error('contact.name')}>
            {aria => (
              <input id={id('contact.name')} className={CONTROL} autoComplete="name" maxLength={LIMITS['contact.name']} value={values.name} onChange={e => onChange('name', e.target.value)} {...aria} />
            )}
          </Field>
          <Field id={id('contact.phone')} label={c.phone} optional={c.optional} error={error('contact.phone')}>
            {aria => (
              <input id={id('contact.phone')} className={CONTROL} type="tel" autoComplete="tel" maxLength={LIMITS['contact.phone']} value={values.phone} onChange={e => onChange('phone', e.target.value)} {...aria} />
            )}
          </Field>
        </div>
        <Field id={id('notes')} label={c.notes} optional={c.optional} error={error('notes')}>
          {aria => (
            <textarea id={id('notes')} className={CONTROL} rows={3} maxLength={LIMITS.notes} value={values.notes} onChange={e => onChange('notes', e.target.value)} {...aria} />
          )}
        </Field>
      </div>
      {/* Honeypot: hidden from people and assistive technology; bots fill it. */}
      <input className="desk-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={values.website} onChange={e => onChange('website', e.target.value)} />
      <div className={`grid gap-1 ${wide}`}>
        <label htmlFor={id('consent.contact')} className="flex min-h-11 items-start gap-3 py-2 text-sm text-ink">
          <input id={id('consent.contact')} type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-brand" checked={values.consent} onChange={e => onChange('consent', e.target.checked)} {...invalid(id('consent.contact'), error('consent.contact'))} />
          <span>{c.consent} <a className="font-semibold text-brand underline underline-offset-2" href={lang === 'vi' ? '/vi/privacy' : '/privacy'} target="_blank" rel="noopener">{c.privacy}</a></span>
        </label>
        {error('consent.contact') && <ErrorText id={id('consent.contact')}>{error('consent.contact')}</ErrorText>}
      </div>
      {status === 'failed' && (
        <div id={id('failed')} tabIndex={-1} role="alert" className={`grid justify-items-start gap-1 rounded-[10px] border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-ink outline-none ${wide}`}>
          <p>{c.failed}</p>
          <button type="button" className={TEXT_BUTTON} onClick={onMailto}>{c.mailto}</button>
        </div>
      )}
      <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${wide}`}>
        <Button type="submit" size="lg" className="day-cta rfq-submit" aria-busy={sending}>
          {submitLabel(c, status)}
          <ArrowUpRight size={18} />
        </Button>
        <p className="text-[13px] text-ink-muted">{c.noCommitment}</p>
      </div>
    </fieldset>
  );
}

/**
 * The form: the page's own heading (`intro`, with the first step: the second has its own), the progress and the step. In
 * a strip the heading and the progress are the first cell of the grid (a row of their own with the second step).
 */
export function Steps({ c, step, intro, strip, onSubmit, children }) {
  // The intro and the progress: across the card from 641 px (side by side from 1000), the first cell of the row from 1240.
  const first = step === 'requirement'
    ? 'min-[641px]:col-span-full min-[1000px]:flex min-[1000px]:items-center min-[1000px]:justify-between min-[1240px]:col-span-1 min-[1240px]:grid'
    : 'col-span-full';
  return (
    <form className={`${CARD} ${strip ? STRIP : ''}`} onSubmit={onSubmit} noValidate aria-label={c.form}>
      <div className={strip ? `grid gap-3 ${first}` : 'contents'}>
        {step === 'requirement' && intro}
        <Progress c={c} step={step} />
      </div>
      {children}
    </form>
  );
}

/** The accepted inquiry: its reference (copyable where the browser allows) and the way to send another. */
export function SentState({ c, id, reference, copied, strip, onCopy, onAnother }) {
  return (
    <section className={`${CARD} ${strip ? 'min-[641px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[641px]:items-center' : ''}`} aria-labelledby={id('sent')}>
      <span className="grid size-10 place-items-center rounded-full bg-(--farm-green-ink) text-white" aria-hidden="true"><Check size={22} /></span>
      <div className="grid gap-2">
        <h3 id={id('sent')} tabIndex={-1} className={`${TITLE} text-2xl`}>{c.sentTitle}</h3>
        <p className="flex flex-wrap items-center gap-x-3 text-[15px] text-ink">
          <span>{c.reference}: <strong className="font-mono text-base font-bold tracking-wide">{reference}</strong></span>
          {typeof navigator !== 'undefined' && navigator.clipboard && (
            <button type="button" className={TEXT_BUTTON} onClick={onCopy}>
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? c.copied : c.copy}
            </button>
          )}
        </p>
        <p className="text-[15px] text-ink-muted">{c.sentText}</p>
      </div>
      <button type="button" className={`${TEXT_BUTTON} justify-self-start`} onClick={onAnother}>{c.another}</button>
    </section>
  );
}

/** The assisted lane: the HMV Trade Desk, for a buyer who needs guidance. */
export function Guidance({ c, id, onOpen }) {
  return (
    <aside aria-labelledby={id('assist')} className="flex flex-col gap-3 rounded-2xl border border-border bg-white/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 id={id('assist')} className={`${styles.heading} text-sm leading-snug font-bold text-ink`}>{c.assistTitle}</h3>
        <p className="text-[13px] text-ink-muted">{c.assistText}</p>
      </div>
      <Button type="button" variant="outline" className="h-11 shrink-0 whitespace-normal" onClick={onOpen}>{c.assistCta}</Button>
    </aside>
  );
}
