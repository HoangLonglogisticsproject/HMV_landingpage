import { ArrowUpRight, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products } from '@/data/hmv';
import { productPages } from '@/data/productPages';
import { APPLICATIONS, ORIGINS, TRANSPORT, VOLUME_UNITS, originsFor, requirementsFor } from './rules';
import { fieldId } from './brief';
import { LIMITS } from './validation';

// The four steps of the HMV Trade Desk and their controls. Presentational: state lives in TradeDesk.jsx. A field error
// (from the validation, here or on the server) is shown under its control, which is marked invalid.

const asOptions = (map, ids = Object.keys(map)) => ids.map(id => ({ id, label: map[id] }));
const errorId = (uid, name) => `${fieldId(uid, name)}-error`;
const FieldError = ({ uid, name, error }) => error && <span className="desk-error" id={errorId(uid, name)}>{error}</span>;
/** aria attributes of a control with or without an error. */
const invalid = (uid, name, error) => (error ? { 'aria-invalid': true, 'aria-describedby': errorId(uid, name) } : {});

/** Radio buttons drawn as chips: one choice, keyboard and screen-reader native. */
export function Chips({ uid, name, legend, options, value, onChange, lang, hint, error }) {
  return (
    <fieldset className="desk-field">
      <legend>
        {legend}
        {hint && <small>{hint}</small>}
      </legend>
      <div className="desk-chips">
        {options.map((o, i) => (
          <label key={o.id} className="desk-chip">
            <input
              type="radio"
              name={`${uid}-${name}`}
              id={i === 0 ? fieldId(uid, name) : undefined}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
              {...invalid(uid, name, error)}
            />
            <span>{o.label[lang]}</span>
          </label>
        ))}
      </div>
      <FieldError uid={uid} name={name} error={error} />
    </fieldset>
  );
}

export function TextField({ uid, name, label, hint, value, onChange, error, ...input }) {
  return (
    <div className="desk-field">
      <label htmlFor={fieldId(uid, name)}>
        {label}
        {hint && <small>{hint}</small>}
      </label>
      <input id={fieldId(uid, name)} value={value} onChange={e => onChange(e.target.value)} {...invalid(uid, name, error)} {...input} />
      <FieldError uid={uid} name={name} error={error} />
    </div>
  );
}

/** Step 1, Requirements: the product, then the core of its supply requirement. Only the product is required. */
export function RequirementsStep({ uid, lang, t, brief, setProduct, update, errorFor }) {
  const origins = originsFor(brief.product);
  return (
    <>
      <Chips uid={uid} name="product" lang={lang} legend={t.product} options={products.map(p => ({ id: p.id, label: { en: p.en, vi: p.vi } }))} value={brief.product} onChange={setProduct} error={errorFor('product')} />
      {brief.product && origins.length > 1 && (
        <Chips uid={uid} name="origin" lang={lang} legend={t.origin} options={asOptions(ORIGINS, origins)} value={brief.origin} onChange={v => update({ origin: v })} />
      )}
      <TextField uid={uid} name="destination" label={t.destination} hint={t.optional} placeholder={t.destinationPlaceholder} value={brief.destination} onChange={v => update({ destination: v })} maxLength={LIMITS.destination} error={errorFor('destination')} />
      <div className="desk-field desk-volume">
        <label htmlFor={fieldId(uid, 'volume')}>
          {t.volume}
          <small>{t.optional}</small>
        </label>
        <div>
          <input id={fieldId(uid, 'volume')} inputMode="decimal" maxLength={LIMITS['volume.amount']} placeholder={t.volumePlaceholder} value={brief.volume.amount} onChange={e => update({ volume: { ...brief.volume, amount: e.target.value } })} {...invalid(uid, 'volume', errorFor('volume.amount'))} />
          <select aria-label={t.unit} value={brief.volume.unit} onChange={e => update({ volume: { ...brief.volume, unit: e.target.value } })}>
            {Object.entries(VOLUME_UNITS).map(([id, label]) => <option key={id} value={id}>{label[lang]}</option>)}
          </select>
        </div>
        <FieldError uid={uid} name="volume" error={errorFor('volume.amount')} />
      </div>
      {APPLICATIONS[brief.product] && (
        <Chips uid={uid} name="application" lang={lang} legend={t.application} hint={t.optional} options={asOptions(APPLICATIONS[brief.product])} value={brief.application} onChange={v => update({ application: v })} />
      )}
      <Chips uid={uid} name="transport" lang={lang} legend={t.transport} hint={t.optional} options={asOptions(TRANSPORT)} value={brief.transport} onChange={v => update({ transport: v })} />
    </>
  );
}

/** The summary rows of a brief, as a definition list. */
export function SummaryList({ rows, className = 'desk-summary' }) {
  return (
    <dl className={className}>
      {rows.map(r => (
        <div key={r.key}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Chips for what HMV still needs; each one jumps to its field. */
export function MissingChips({ missing, onPick }) {
  return (
    <ul className="desk-missing">
      {missing.map(m => (
        <li key={m.key}>
          <button type="button" onClick={() => onPick(m)}>
            <Plus size={14} aria-hidden="true" />
            {m.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Dried cassava chips: the Intertek sample as a reference only, with its sample caveat (data/productPages.js). */
export function QualityReference({ product, lang, t }) {
  const intertek = productPages[product]?.[lang].hero?.intertek;
  if (!intertek) return null;
  return (
    <div className="desk-reference">
      <p className="desk-label">{t.qualityReference}</p>
      <p>
        {intertek.report} · {intertek.results.map(([name, value]) => `${name} ${value}`).join(' · ')}
      </p>
      <p className="desk-note">{intertek.caption}</p>
    </div>
  );
}

/** Step 2, Requirement review: what HMV understood and what it still needs. */
export function ReviewStep({ lang, t, brief, summary, onPick }) {
  return (
    <>
      <SummaryList rows={[...summary.rows, { key: 'status', label: t.status, value: t.statusValue }]} />
      <h4 className="desk-subhead">{t.needs}</h4>
      {summary.missing.length ? <MissingChips missing={summary.missing} onPick={onPick} /> : <p className="desk-note">{t.nothingMissing}</p>}
      <QualityReference product={brief.product} lang={lang} t={t} />
    </>
  );
}

/** Step 3, Complete requirements: the controlled requirement fields, then optional free text. */
export function CompleteStep({ uid, lang, t, brief, update, errorFor }) {
  const setRequirement = (key, value) => update({ requirements: { ...brief.requirements, [key]: value } });
  return (
    <>
      {APPLICATIONS[brief.product] && (
        <Chips uid={uid} name="application" lang={lang} legend={t.application} options={asOptions(APPLICATIONS[brief.product])} value={brief.application} onChange={v => update({ application: v })} />
      )}
      {requirementsFor(brief).map(r => (r.kind === 'choice' ? (
        <Chips key={r.key} uid={uid} name={r.key} lang={lang} legend={r.label[lang]} options={r.options} value={brief.requirements[r.key] ?? ''} onChange={v => setRequirement(r.key, v)} error={errorFor(`requirements.${r.key}`)} />
      ) : (
        <TextField key={r.key} uid={uid} name={r.key} label={r.label[lang]} value={brief.requirements[r.key] ?? ''} onChange={v => setRequirement(r.key, v)} maxLength={LIMITS.requirement} error={errorFor(`requirements.${r.key}`)} />
      )))}
      <div className="desk-field">
        <label htmlFor={fieldId(uid, 'notes')}>
          {t.notes}
          <small>{t.notesHint}</small>
        </label>
        <textarea id={fieldId(uid, 'notes')} rows={4} maxLength={LIMITS.notes} value={brief.notes} onChange={e => update({ notes: e.target.value })} {...invalid(uid, 'notes', errorFor('notes'))} />
        <FieldError uid={uid} name="notes" error={errorFor('notes')} />
      </div>
    </>
  );
}

/** Step 4, Preliminary Supply Brief: known values, requirements, what is to confirm and HMV's next action. */
export function BriefStep({ lang, t, brief, summary, onPick }) {
  return (
    <section className="desk-brief" aria-labelledby="desk-brief-title">
      <h4 id="desk-brief-title" className="desk-subhead">{t.briefTitle}</h4>
      <SummaryList rows={summary.rows} />
      {summary.requirements.length > 0 && (
        <>
          <p className="desk-label">{t.requirements}</p>
          <ul className="desk-checks">
            {summary.requirements.map(r => (
              <li key={r.key}>
                <Check size={15} aria-hidden="true" />
                <span>{r.label}: {r.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {summary.missing.length > 0 && (
        <>
          <p className="desk-label">{t.toConfirm}</p>
          <MissingChips missing={summary.missing} onPick={onPick} />
        </>
      )}
      <QualityReference product={brief.product} lang={lang} t={t} />
      <p className="desk-label">{t.next}</p>
      <p>{t.nextText}</p>
      <p className="desk-disclaimer">{t.disclaimer}</p>
    </section>
  );
}

// Step 4's contact fields: [name, autocomplete, required]. Email and phone have their own input types.
const CONTACT_FIELDS = [['company', 'organization', true], ['email', 'email', true], ['name', 'name', false], ['phone', 'tel', false]];
const CONTACT_INPUT_TYPE = { email: 'email', phone: 'tel' };

/** The submit button's text for the send status. */
const submitText = (t, status) => {
  if (status === 'sending') return t.sending;
  if (status === 'failed') return t.retry;
  return t.submit;
};

/**
 * Step 4's contact form: the buyer's details, consent with its privacy notice, the honeypot, and the send state (retry
 * and the email draft after a failure). State and submission live in TradeDesk.jsx.
 */
export function ContactForm({ uid, lang, t, contact, onContactChange, consent, onConsentChange, website, setWebsite, status, errorFor, onSubmit, onFocus, onMailto }) {
  const sending = status === 'sending';
  return (
    <form className="desk-contact" onSubmit={onSubmit} onFocus={onFocus} noValidate>
      <h4 className="desk-subhead">{t.contactTitle}</h4>
      <div className="desk-contact-grid">
        {CONTACT_FIELDS.map(([name, auto, required]) => {
          const field = `contact.${name}`;
          return (
            <div className="desk-field" key={name}>
              <label htmlFor={fieldId(uid, field)}>
                {t[name]}
                <small>{required ? t.required : t.optional}</small>
              </label>
              <input
                id={fieldId(uid, field)}
                type={CONTACT_INPUT_TYPE[name] ?? 'text'}
                autoComplete={auto}
                required={required}
                maxLength={LIMITS[field]}
                value={contact[name]}
                onChange={e => onContactChange(name, e.target.value)}
                {...invalid(uid, field, errorFor(field))}
              />
              <FieldError uid={uid} name={field} error={errorFor(field)} />
            </div>
          );
        })}
      </div>
      {/* Honeypot: hidden from people and assistive technology; bots fill it. */}
      <input className="desk-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)} />
      <label className="desk-consent" htmlFor={fieldId(uid, 'consent.contact')}>
        <input id={fieldId(uid, 'consent.contact')} type="checkbox" checked={consent} onChange={e => onConsentChange(e.target.checked)} {...invalid(uid, 'consent.contact', errorFor('consent.contact'))} />
        <span>{t.consent}</span>
      </label>
      <a className="desk-privacy text-link" href={lang === 'vi' ? '/vi/privacy' : '/privacy'} target="_blank" rel="noopener">{t.privacy}</a>
      <FieldError uid={uid} name="consent.contact" error={errorFor('consent.contact')} />
      {status === 'failed' && (
        <div className="desk-failed" role="alert">
          <p>{t.failed}</p>
          <button type="button" className="text-link" onClick={onMailto}>{t.mailto}</button>
        </div>
      )}
      <Button type="submit" size="lg" className="day-cta desk-submit" disabled={sending} aria-busy={sending}>
        {submitText(t, status)}
        <ArrowUpRight size={18} />
      </Button>
    </form>
  );
}
