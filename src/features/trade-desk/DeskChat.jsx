import { useState } from 'react';
import { ArrowUp, ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products } from '@/data/hmv';
import { VOLUME_UNITS } from './rules';
import { fieldId, isRfqReady, summarize } from './brief';
import { LIMITS, isAmount } from './validation';

// The HMV Trade Desk conversation and its parts. Presentational: state lives in TradeDesk.jsx. The conversation is
// derived from the requirement, so every earlier question and answer stays on screen in the current language.

const errorId = (uid, name) => `${fieldId(uid, name)}-error`;
const FieldError = ({ uid, name, error }) => error && <span className="desk-error" id={errorId(uid, name)}>{error}</span>;
/** aria attributes of a control with or without an error. */
const invalid = (uid, name, error) => (error ? { 'aria-invalid': true, 'aria-describedby': errorId(uid, name) } : {});

/** The conversation so far: HMV's questions and the buyer's answers, from the requirement and the buyer's choices. */
function conversation({ brief, preselected, unclear, exploring }, t, lang) {
  const known = summarize(brief, lang);
  const lines = [];
  const hmv = (id, text) => lines.push({ id, from: 'hmv', text });
  const you = (id, text) => lines.push({ id, from: 'you', text });
  if (!preselected) {
    hmv('ask-product', t.askProduct);
    unclear.forEach((words, i) => {
      you(`unclear-${i}`, words);
      hmv(`unclear-${i}-reply`, t.productUnclear);
    });
    if (brief.product) you('product', brief.notes || known.product);
  }
  if (!brief.product) return lines;
  hmv('ask-destination', t.askDestination);
  if (known.destination) {
    you('destination', known.destination);
    hmv('ask-volume', t.askVolume);
    if (known.volume) you('volume', known.volume);
  }
  if (isRfqReady(brief)) hmv('ready', t.ready);
  else if (exploring) {
    you('exploring', t.exploring);
    hmv('discovery', t.discovery);
  }
  return lines;
}

/** The conversation as a log: new lines are announced to assistive technology. */
export function Thread({ t, lang, ...state }) {
  return (
    <div className="desk-thread" role="log" aria-label={t.conversation}>
      {conversation(state, t, lang).map(({ id, from, text }) => (
        <div key={id} className={`desk-msg desk-msg-${from}`}>
          <span className="desk-msg-from">{from === 'hmv' ? 'HMV' : t.you}</span>
          <div className="desk-bubble">
            {[text].flat().map(p => <p key={p}>{p}</p>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A one-line answer: the buyer's text, sent with Enter or the send button. Blank answers are not sent. */
function Composer({ uid, name, label, t, onAnswer, children, input }) {
  const [value, setValue] = useState('');
  const submit = event => {
    event.preventDefault();
    if (!value.trim()) return;
    onAnswer(value.trim());
    setValue('');
  };
  return (
    <form className="desk-composer" onSubmit={submit}>
      <label htmlFor={fieldId(uid, name)} className="sr-only">{label}</label>
      <div className="desk-composer-row">
        <input id={fieldId(uid, name)} autoComplete="off" value={value} onChange={e => setValue(e.target.value)} {...input} />
        <button type="submit" className="desk-send" aria-label={t.answer}>
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      </div>
      {children}
    </form>
  );
}

/** "I'm still exploring": the buyer does not have to invent a destination or a volume. */
const ExploreButton = ({ t, onExplore }) => (
  <button type="button" className="desk-explore" onClick={onExplore}>{t.exploring}</button>
);

/** The product, typed (recognized from the catalogue's names) or chosen from the HMV products. */
export function ProductComposer({ uid, t, lang, onAnswer, onChoose }) {
  return (
    <Composer uid={uid} name="product" label={t.productInput} t={t} onAnswer={onAnswer} input={{ placeholder: t.productPlaceholder, maxLength: 200 }}>
      <fieldset className="desk-choices">
        <legend className="sr-only">{t.productChoices}</legend>
        {products.map(p => (
          <button key={p.id} type="button" className="desk-choice" onClick={() => onChoose(p.id)}>{p[lang]}</button>
        ))}
      </fieldset>
    </Composer>
  );
}

export function DestinationComposer({ uid, t, onAnswer, onExplore }) {
  return (
    <Composer uid={uid} name="destination" label={t.destinationInput} t={t} onAnswer={onAnswer} input={{ placeholder: t.destinationPlaceholder, maxLength: LIMITS.destination }}>
      <ExploreButton t={t} onExplore={onExplore} />
    </Composer>
  );
}

/** The volume: an amount the inquiry accepts and its unit (the product's usual one first). */
export function VolumeComposer({ uid, t, lang, unit, onAnswer, onExplore }) {
  const [amount, setAmount] = useState('');
  const [chosen, setChosen] = useState(unit);
  const [error, setError] = useState(false);
  const submit = event => {
    event.preventDefault();
    if (!amount.trim()) return;
    if (isAmount(amount)) onAnswer({ amount: amount.trim(), unit: chosen });
    else setError(true);
  };
  const change = value => {
    setAmount(value);
    if (error && isAmount(value)) setError(false);
  };
  const message = error && t.errors.volume;
  return (
    <form className="desk-composer" onSubmit={submit} noValidate>
      <label htmlFor={fieldId(uid, 'volume')} className="sr-only">{t.volumeInput}</label>
      <div className="desk-composer-row">
        <input id={fieldId(uid, 'volume')} inputMode="decimal" autoComplete="off" maxLength={LIMITS['volume.amount']} placeholder={t.volumePlaceholder} value={amount} onChange={e => change(e.target.value)} {...invalid(uid, 'volume', message)} />
        <select aria-label={t.unit} value={chosen} onChange={e => setChosen(e.target.value)}>
          {Object.entries(VOLUME_UNITS).map(([id, label]) => <option key={id} value={id}>{label[lang]}</option>)}
        </select>
        <button type="submit" className="desk-send" aria-label={t.answer}>
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      </div>
      <FieldError uid={uid} name="volume" error={message} />
      <ExploreButton t={t} onExplore={onExplore} />
    </form>
  );
}

/** The route's next step: Request Quotation for a ready requirement, Discuss with HMV while exploring. */
export function RouteAction({ uid, t, route, onClick }) {
  return (
    <Button id={fieldId(uid, 'decision')} type="button" size="lg" className="day-cta desk-route-action" onClick={onClick}>
      {route === 'rfq' ? t.requestQuotation : t.discuss}
      <ArrowUpRight size={18} />
    </Button>
  );
}

/**
 * The requirement beside the conversation: product, destination and volume, and who continues with the buyer. On a
 * phone it folds into one line above the conversation. Each known answer can be corrected (`onEdit`, null once the
 * inquiry is sent; `locked` while it is being sent).
 */
export function RequirementPanel({ t, lang, brief, route, open, onToggle, onEdit, locked }) {
  const known = summarize(brief, lang);
  const { status, next } = t.route[route];
  return (
    <aside className="desk-panel" aria-label={t.requirement} data-open={open || undefined}>
      <button type="button" className="desk-panel-toggle" aria-expanded={open} onClick={onToggle}>
        <span className="desk-label">{t.requirement}</span>
        <span className={`desk-panel-status desk-status-${route}`}>{status}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <p className="desk-label desk-panel-title">{t.requirement}</p>
      <div className="desk-panel-body">
        <dl className="desk-summary">
          {['product', 'destination', 'volume'].map(key => (
            <div key={key}>
              <dt>{t[key]}</dt>
              <dd>
                {known[key] || <span className="desk-pending">{t.notYet}</span>}
                {known[key] && onEdit && (
                  <button type="button" className="desk-edit" disabled={locked} onClick={() => onEdit(key)}>
                    {t.edit}
                    <span className="sr-only"> {t[key]}</span>
                  </button>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className={`desk-route desk-status-${route}`}>
          <strong>
            {route === 'rfq' && <Check size={16} aria-hidden="true" />}
            {status}
          </strong>
          <span>{next}</span>
        </div>
      </div>
    </aside>
  );
}

// The contact fields in the card's order: [name, autocomplete, required]. Email and phone have their own input types.
const CONTACT_FIELDS = [['company', 'organization', true], ['name', 'name', false], ['email', 'email', true], ['phone', 'tel', false]];
const CONTACT_INPUT_TYPE = { email: 'email', phone: 'tel' };

/** The submit button's text for the send status. */
const submitText = (t, status) => {
  if (status === 'sending') return t.sending;
  if (status === 'failed') return t.retry;
  return t.submit;
};

/**
 * The contact card, inline in the conversation once the buyer chose a route: the buyer's details, consent with its
 * privacy notice, the honeypot, and the send state (retry and the email draft after a failure).
 */
export function ContactForm({ uid, lang, t, route, contact, onContactChange, consent, onConsentChange, website, setWebsite, status, errorFor, onSubmit, onMailto }) {
  const sending = status === 'sending';
  return (
    <form className="desk-contact" onSubmit={onSubmit} noValidate aria-labelledby={fieldId(uid, 'contact-title')}>
      <h3 id={fieldId(uid, 'contact-title')} className="desk-label">{t.contactTitle[route]}</h3>
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

/**
 * The accepted inquiry: its reference and who continues. A quotation request also shows the commercial process it
 * enters, with only its first stage reached: nothing later is claimed.
 */
export function SentCard({ t, route, reference, channels, heading, children }) {
  return (
    <section className="desk-sent">
      <h3 ref={heading} tabIndex={-1}>
        <Check size={20} aria-hidden="true" />
        {t.sentTitle[route]}
      </h3>
      <p className="desk-label">{t.reference}</p>
      <p className="desk-reference-id">{reference}</p>
      <p>{t.sentText[route]}</p>
      {route === 'rfq' && (
        <>
          <p className="desk-label">{t.process}</p>
          <ol className="desk-timeline">
            {t.timeline.map((stage, i) => (
              <li key={stage} aria-current={i === 0 ? 'step' : undefined}>{stage}</li>
            ))}
          </ol>
        </>
      )}
      {channels.length > 0 && (
        <div className="desk-follow-up">
          <p className="desk-note">{t.followUp}</p>
          {channels.map(({ id, href }, i) => (
            <a key={id} href={href} className={i === 0 ? 'desk-channel primary' : 'desk-channel'} target={id === 'email' ? undefined : '_blank'} rel="noopener noreferrer">
              {t.channels[id]}
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      )}
      {children}
    </section>
  );
}
