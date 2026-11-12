'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Dialog } from 'radix-ui';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productById } from './rules';
import { track } from '@/lib/analytics';
import { contactChannels, sendInquiry } from '@/lib/inquiry';
import { createInquiryMailto } from '@/features/inquiries/inquiry';
import { emptyBrief, fieldId, progress, summarize, toInquiry, withProduct } from './brief';
import { contactErrors, validateInquiry } from './validation';
import { inquiryFingerprint } from './fingerprint';
import { deskCopy } from './copy';
import { visitContext } from './visit';
import { followUpChannels } from './channels';
import { BriefStep, CompleteStep, ContactForm, RequirementsStep, ReviewStep, SummaryList } from './DeskSteps';

// HMV Trade Desk: helps a buyer structure a trade requirement and sends it to the HMV commercial team. Loaded and
// mounted by TradeDeskHost on the first openTradeDesk(); each call arrives as a new `request`. The structured brief
// is the source of truth; the buyer sees the preliminary brief before any contact detail is asked; submission goes to
// POST /api/inquiry, never to analytics.

const STEP_IDS = ['requirements', 'review', 'complete', 'brief'];
// The step that shows each field the validation can name; requirements.* are on step 3. Anything else (a malformed
// idempotency key, a broken body) is not the buyer's to fix: it is a failed send.
const FIELD_STEP = {
  product: 0, destination: 0, 'volume.amount': 0, notes: 2,
  'contact.company': 3, 'contact.email': 3, 'contact.name': 3, 'contact.phone': 3, 'consent.contact': 3,
};
const stepOf = field => (field.startsWith('requirements.') ? 2 : FIELD_STEP[field]);
/** The control a field error points at (its fieldId key). */
const controlOf = field => (field === 'volume.amount' ? 'volume' : field.replace(/^requirements\./, ''));
/** POST /api/inquiry accepted the inquiry: 201 with the reference the CMS issued. */
const isAccepted = ({ status, body }) => status === 201 && typeof body.reference === 'string';
// randomUUID needs a secure context; getRandomValues does not (plain-http previews).
const newKey = () => crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');

/** @param {{ lang: 'en' | 'vi', request: { product?: string, source?: string } }} props */
export function TradeDesk({ lang, request }) {
  const t = deskCopy[lang];
  const uid = useId().replaceAll(':', '');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState(() => emptyBrief());
  const [contact, setContact] = useState({ company: '', email: '', name: '', phone: '' });
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [reference, setReference] = useState('');
  // Whether the buyer has seen the accepted result: it is kept, and shown on the next open, until they have.
  const [acknowledged, setAcknowledged] = useState(false);
  // Counts the briefs of this desk: a response to an earlier brief never changes the current one.
  const [generation, setGeneration] = useState(0);
  // The last submission of this brief: its content fingerprint and idempotency key. An exact retry reuses the key; a
  // changed brief or contact gets a new one, so a key always stands for one exact inquiry.
  const [submission, setSubmission] = useState(/** @type {{ fingerprint: string, key: string } | null} */ (null));
  // The last open request acted on (null before the first).
  const [handled, setHandled] = useState(/** @type {object | null} */ (null));
  // The generation whose submission is in flight: one request at a time per brief.
  const inFlight = useRef(-1);
  // The brief generation trade_contact_start was last counted for.
  const contactStarted = useRef(-1);
  const focusKey = useRef(null);
  const heading = useRef(null);
  const main = useRef(null);

  // A new brief. Consent is given per inquiry, so it is asked again; after a sent inquiry the contact is cleared too.
  const startBrief = ({ product = null } = {}) => {
    if (reference) {
      setContact({ company: '', email: '', name: '', phone: '' });
      setWebsite('');
    }
    setConsent(false);
    setBrief(emptyBrief({ product }));
    setStep(0);
    setReference('');
    setAcknowledged(false);
    setStatus('idle');
    setFieldErrors([]);
    setSubmission(null);
    setGeneration(g => g + 1);
  };

  // Each open request (a new object from TradeDeskHost, which also counts it in analytics) opens the desk: a new brief
  // after a sent one the buyer has seen, or when opened for another product; otherwise the buyer's answers are kept.
  // An acceptance the buyer has not seen yet (it arrived while the desk was closed) is shown, never replaced.
  if (request !== handled) {
    setHandled(request);
    const { product = null } = request;
    const fresh = reference ? acknowledged : Boolean(product) && product !== brief.product;
    if (fresh) startBrief({ product });
    setOpen(true);
  }
  const openChange = next => {
    setOpen(next);
    if (!next && reference) setAcknowledged(true);
  };

  // A step change scrolls the step to the top and moves focus to its heading, or to the field a chip pointed at.
  useEffect(() => {
    if (!open) return;
    main.current?.scrollTo?.({ top: 0 });
    const target = focusKey.current && document.getElementById(fieldId(uid, focusKey.current));
    (target || heading.current)?.focus();
    focusKey.current = null;
  }, [open, step, reference, uid]);

  const summary = summarize(brief, lang, { pending: t.pending });
  const update = patch => setBrief(b => ({ ...b, ...patch }));
  const setProduct = product => {
    setBrief(b => withProduct(b, product));
    track('trade_product_selected', { product, source: 'chosen' });
  };
  const go = next => {
    setStep(next);
    track('trade_requirement_progress', { product: brief.product ?? undefined, step: STEP_IDS[next], progress: progress(brief) });
    if (next === 3) track('trade_brief_generated', { product: brief.product ?? undefined, missing: summary.missing.length });
  };
  // A missing-information chip: core fields are on step 1, requirements on step 3.
  const pick = item => {
    focusKey.current = item.key;
    const target = ['product', 'destination', 'volume'].includes(item.key) ? 0 : 2;
    if (target === step) document.getElementById(fieldId(uid, item.key))?.focus();
    else go(target);
  };
  const canContinue = Boolean(brief.product);
  const product = productById(brief.product);
  const facts = { product: brief.product ?? undefined };
  // The product name, never the buyer's free text: it goes into the follow-up links.
  const subject = product?.[lang];
  const channels = reference ? followUpChannels(contactChannels, { lang, reference, subject }) : [];

  const startContact = () => {
    if (contactStarted.current === generation) return;
    contactStarted.current = generation;
    track('trade_contact_start', facts);
  };

  // The brief on screen, for responses that arrive later: one for an earlier brief changes nothing.
  const live = useRef(generation);
  useEffect(() => {
    live.current = generation;
  });

  /** Field errors from the validation (here or the server's): shown on their step, the first one focused. */
  const showErrors = fields => {
    const own = fields.filter(f => stepOf(f) !== undefined).sort((a, b) => stepOf(a) - stepOf(b));
    setFieldErrors(own);
    if (!own.length) return false;
    focusKey.current = controlOf(own[0]);
    if (stepOf(own[0]) === step) document.getElementById(fieldId(uid, focusKey.current))?.focus();
    else go(stepOf(own[0]));
    return true;
  };

  /** The inquiry as it would be sent now and its fingerprint: an exact retry keeps the key, any change takes a new one. */
  const prepare = () => {
    const draft = toInquiry(brief, { contact, consent, locale: lang, context: visitContext(), website });
    const fingerprint = inquiryFingerprint(draft);
    const key = submission?.fingerprint === fingerprint ? submission.key : newKey();
    return { inquiry: { ...draft, idempotencyKey: key }, fingerprint };
  };

  /** A response for the brief still on screen: its reference, the field errors to correct, or the failure state. */
  const settle = (response, accepted) => {
    if (accepted) {
      setReference(response.body.reference);
      setAcknowledged(false);
      setStatus('idle');
      return;
    }
    // 409: this key was used for other content; the next attempt takes a new one.
    if (response.status === 409) setSubmission(null);
    setStatus(response.status === 400 && showErrors(response.body.fields ?? []) ? 'idle' : 'failed');
  };

  /** Sends a validated inquiry of brief `sent.generation`: an accepted lead is counted, but only that brief is updated. */
  async function deliver(inquiry, sent) {
    inFlight.current = sent.generation;
    setStatus('sending');
    try {
      const response = await sendInquiry(inquiry);
      const accepted = isAccepted(response);
      if (accepted) track('generate_lead', { ...sent.facts, locale: lang });
      if (live.current === sent.generation) settle(response, accepted);
    } catch {
      if (live.current === sent.generation) setStatus('failed');
    } finally {
      if (inFlight.current === sent.generation) inFlight.current = -1;
    }
  }

  async function send(event) {
    event.preventDefault();
    if (inFlight.current === generation) return;
    const { inquiry, fingerprint } = prepare();
    const check = validateInquiry(inquiry);
    if (!check.ok) {
      if (!showErrors(check.errors)) setStatus('failed');
      return;
    }
    setFieldErrors([]);
    setSubmission({ fingerprint, key: inquiry.idempotencyKey });
    // While it is sent the brief cannot change (the step controls are locked); a new brief can be started.
    await deliver(inquiry, { generation, facts });
  }

  // The fallback when the API cannot take the brief: the same brief as an email draft, route (origin) included.
  const mailto = () => {
    const en = summarize(brief, 'en', { pending: 'to be confirmed' });
    window.location.assign(createInquiryMailto({
      ...contact,
      product: product?.en,
      destination: brief.destination,
      volume: en.rows.find(r => r.key === 'volume')?.value,
      requirements: [...en.rows.filter(r => ['route', 'application', 'transport'].includes(r.key)), ...en.requirements].map(r => [r.label, r.value]),
      message: brief.notes,
    }));
  };

  // A field with an error that the buyer corrects loses it at once, checked by the send's rules; an untouched or still
  // invalid field keeps its state, so no message appears before a send.
  const clearIfCorrected = (field, errorsNow) => {
    if (fieldErrors.includes(field) && !errorsNow().includes(field)) setFieldErrors(errors => errors.filter(f => f !== field));
  };
  const changeContact = (name, value) => {
    const next = { ...contact, [name]: value };
    setContact(next);
    clearIfCorrected(`contact.${name}`, () => contactErrors(next, consent));
  };
  const changeConsent = checked => {
    setConsent(checked);
    clearIfCorrected('consent.contact', () => contactErrors(contact, checked));
  };

  /** The message for a field with an error, or null. */
  const errorFor = name => {
    if (!fieldErrors.includes(name)) return null;
    return t.errors[name] ?? (name.startsWith('requirements.') ? t.errors.requirement : t.errors.field);
  };

  return (
    <Dialog.Root open={open} onOpenChange={openChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="desk-overlay" />
        <Dialog.Content className="desk" aria-describedby={`${uid}-description`} lang={lang}>
          <header className="desk-head">
            <div className="desk-brand">
              <Dialog.Title className="desk-title">{t.deskName}</Dialog.Title>
              <Dialog.Description id={`${uid}-description`} className="desk-description">{t.description}</Dialog.Description>
            </div>
            <ol className="desk-steps">
              {t.steps.map((label, i) => (
                <li key={label} aria-current={!reference && i === step ? 'step' : undefined} className={reference || i < step ? 'done' : undefined}>
                  <span>{i + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
            <Dialog.Close className="desk-close" aria-label={t.close}>
              <X size={20} />
            </Dialog.Close>
          </header>

          <div className="desk-body">
            <div className="desk-main" ref={main}>
              {reference ? (
                <section className="desk-sent">
                  <h3 ref={heading} tabIndex={-1}>{t.sentTitle}</h3>
                  <p className="desk-label">{t.reference}</p>
                  <p className="desk-reference-id">{reference}</p>
                  <p>{t.sentText}</p>
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
                  <Dialog.Close asChild>
                    <Button type="button" size="lg" className="day-cta">{t.done}</Button>
                  </Dialog.Close>
                  <button type="button" className="text-link" onClick={() => startBrief(handled ?? {})}>{t.newInquiry}</button>
                </section>
              ) : (
                <>
                  <h3 ref={heading} tabIndex={-1} className="desk-step-title">
                    <span>{step + 1} / 4</span>
                    {t.steps[step]}
                  </h3>
                  <fieldset className="desk-lock" disabled={status === 'sending'}>
                  {step === 0 && <RequirementsStep uid={uid} lang={lang} t={t} brief={brief} setProduct={setProduct} update={update} errorFor={errorFor} />}
                  {step === 1 && <ReviewStep lang={lang} t={t} brief={brief} summary={summary} onPick={pick} />}
                  {step === 2 && <CompleteStep uid={uid} lang={lang} t={t} brief={brief} update={update} errorFor={errorFor} />}
                  {step === 3 && (
                    <>
                      <BriefStep lang={lang} t={t} brief={brief} summary={summary} onPick={pick} />
                      <ContactForm
                        uid={uid}
                        lang={lang}
                        t={t}
                        contact={contact}
                        onContactChange={changeContact}
                        consent={consent}
                        onConsentChange={changeConsent}
                        website={website}
                        setWebsite={setWebsite}
                        status={status}
                        errorFor={errorFor}
                        onSubmit={send}
                        onFocus={startContact}
                        onMailto={mailto}
                      />
                    </>
                  )}
                  <nav className="desk-nav" aria-label={t.steps[step]}>
                    {step > 0 && (
                      <button type="button" className="desk-back" onClick={() => go(step - 1)}>
                        <ArrowLeft size={16} />
                        {t.back}
                      </button>
                    )}
                    {step === 0 && (
                      <>
                        {!canContinue && <p className="desk-note">{t.chooseProduct}</p>}
                        <Button type="button" size="lg" className="day-cta" disabled={!canContinue} onClick={() => go(1)}>
                          {t.review}
                          <ArrowRight size={18} />
                        </Button>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <button type="button" className="text-link" onClick={() => go(3)}>{t.toBrief}</button>
                        <Button type="button" size="lg" className="day-cta" onClick={() => go(2)}>
                          {t.complete}
                          <ArrowRight size={18} />
                        </Button>
                      </>
                    )}
                    {step === 2 && (
                      <Button type="button" size="lg" className="day-cta" onClick={() => go(3)}>
                        {t.toBrief}
                        <ArrowRight size={18} />
                      </Button>
                    )}
                  </nav>
                  </fieldset>
                </>
              )}
            </div>

            <aside className="desk-panel" aria-label={t.yourBrief}>
              {!reference && <p className="desk-guidance">{t.guidance[step]}</p>}
              <p className="desk-label">{t.yourBrief}</p>
              {summary.rows.length ? <SummaryList rows={[...summary.rows, ...summary.requirements]} className="desk-summary desk-summary-compact" /> : <p className="desk-note">{t.emptyBrief}</p>}
              {!reference && summary.missing.length > 0 && (
                <p className="desk-note">
                  {t.needs}: {summary.missing.length}
                </p>
              )}
            </aside>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
