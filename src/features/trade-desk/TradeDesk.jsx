'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Dialog } from 'radix-ui';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productById } from './rules';
import { track } from '@/lib/analytics';
import { sendInquiry } from '@/lib/inquiry';
import { createInquiryMailto } from '@/features/inquiries/inquiry';
import { emptyBrief, fieldId, progress, summarize, toInquiry, withProduct } from './brief';
import { validateInquiry } from './validation';
import { deskCopy } from './copy';
import { OPEN_TRADE_DESK } from './open';
import { BriefStep, CompleteStep, RequirementsStep, ReviewStep, SummaryList } from './DeskSteps';

// HMV Trade Desk: helps a buyer structure a trade requirement and sends it to the HMV commercial team. Mounted once
// (SiteShell), opened by openTradeDesk(). The structured brief is the source of truth; the buyer sees the preliminary
// brief before any contact detail is asked; submission goes to POST /api/inquiry, never to analytics.

const STEP_IDS = ['requirements', 'review', 'complete', 'brief'];
const CONTACT_FIELDS = ['contact.company', 'contact.email', 'contact.phone', 'consent.contact'];
const newKey = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

// First-touch context of the visit (landing page, external referrer, UTM): this session only, never personal data.
function rememberVisit() {
  try {
    const store = sessionStorage;
    if (!store.getItem('hmv_landing')) {
      store.setItem('hmv_landing', location.pathname);
      store.setItem('hmv_referrer', document.referrer);
    }
    const params = new URLSearchParams(location.search);
    const utm = { source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign') };
    if (Object.values(utm).some(Boolean)) store.setItem('hmv_utm', JSON.stringify(utm));
  } catch {
    // Storage blocked: the inquiry goes without visit context.
  }
}
function visitContext() {
  const page = location.pathname;
  try {
    const store = sessionStorage;
    return { page, landingPage: store.getItem('hmv_landing') || page, referrer: store.getItem('hmv_referrer') || '', utm: JSON.parse(store.getItem('hmv_utm') || '{}') };
  } catch {
    return { page, landingPage: page, referrer: '', utm: {} };
  }
}

export function TradeDesk({ lang }) {
  const t = deskCopy[lang];
  const uid = useId().replace(/:/g, '');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState(() => emptyBrief());
  const [contact, setContact] = useState({ company: '', email: '', name: '', phone: '' });
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [reference, setReference] = useState('');
  const key = useRef(newKey());
  const inFlight = useRef(false);
  const contactStarted = useRef(false);
  const focusKey = useRef(null);
  const heading = useRef(null);
  const main = useRef(null);
  // The latest brief and reference, for the open handler registered once.
  const state = useRef({ brief, reference });
  useEffect(() => {
    state.current = { brief, reference };
  });

  useEffect(() => {
    rememberVisit();
    const onOpen = event => {
      const { product = null, goal, source = 'unknown' } = event.detail ?? {};
      const current = state.current;
      // A new brief after a sent one, or when opened for another product; otherwise the buyer's answers are kept.
      if (current.reference || (product && product !== current.brief.product) || (goal && goal !== current.brief.goal)) {
        setBrief(emptyBrief({ goal: productById(product) ? 'sourcing' : goal, product }));
        setStep(0);
        setReference('');
        setStatus('idle');
        setFieldErrors([]);
        key.current = newKey();
        contactStarted.current = false;
      }
      setOpen(true);
      track('trade_desk_open', { source, product: product ?? undefined, locale: lang });
      if (productById(product)) track('trade_product_selected', { product, source: 'preselected' });
    };
    window.addEventListener(OPEN_TRADE_DESK, onOpen);
    return () => window.removeEventListener(OPEN_TRADE_DESK, onOpen);
  }, [lang]);

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
  const setGoal = goal => {
    setBrief(b => emptyBrief({ goal, product: goal === 'sourcing' ? b.product : null }));
    track('trade_goal_selected', { goal });
  };
  const setProduct = product => {
    setBrief(b => withProduct(b, product));
    track('trade_product_selected', { product, source: 'chosen' });
  };
  const go = next => {
    setStep(next);
    track('trade_requirement_progress', { goal: brief.goal, product: brief.product ?? undefined, step: STEP_IDS[next], progress: progress(brief) });
    if (next === 3) track('trade_brief_generated', { goal: brief.goal, product: brief.product ?? undefined, missing: summary.missing.length });
  };
  // A missing-information chip: core fields are on step 1, requirements on step 3.
  const pick = item => {
    focusKey.current = item.key;
    const target = ['product', 'goods', 'origin', 'destination', 'volume'].includes(item.key) ? 0 : 2;
    if (target === step) document.getElementById(fieldId(uid, item.key))?.focus();
    else go(target);
  };
  const canContinue = brief.goal === 'sourcing' ? Boolean(brief.product) : brief.goods.trim() !== '';
  const product = productById(brief.product);
  const facts = { goal: brief.goal, product: brief.product ?? undefined };

  const startContact = () => {
    if (contactStarted.current) return;
    contactStarted.current = true;
    track('trade_contact_start', facts);
  };

  async function send(event) {
    event.preventDefault();
    if (inFlight.current) return;
    const inquiry = toInquiry(brief, { contact, consent, locale: lang, context: visitContext(), idempotencyKey: key.current, website });
    const check = validateInquiry(inquiry);
    const invalid = check.ok ? [] : check.errors.filter(f => CONTACT_FIELDS.includes(f));
    setFieldErrors(invalid);
    if (invalid.length) {
      document.getElementById(fieldId(uid, invalid[0]))?.focus();
      return;
    }
    inFlight.current = true;
    setStatus('sending');
    try {
      const { status: code, body: data } = await sendInquiry(inquiry);
      if (code === 201 && typeof data.reference === 'string') {
        setReference(data.reference);
        setStatus('idle');
        track('generate_lead', { ...facts, locale: lang });
      } else {
        const fields = (data.fields ?? []).filter(f => CONTACT_FIELDS.includes(f));
        setFieldErrors(fields);
        setStatus(fields.length ? 'idle' : 'failed');
      }
    } catch {
      setStatus('failed');
    } finally {
      inFlight.current = false;
    }
  }

  // The fallback when the API cannot take the brief: the same brief as an email draft.
  const mailto = () => {
    const en = summarize(brief, 'en', { pending: 'to be confirmed' });
    window.location.href = createInquiryMailto({
      ...contact,
      product: product?.en ?? brief.goods,
      destination: brief.destination,
      volume: en.rows.find(r => r.key === 'volume')?.value,
      requirements: [...en.rows.filter(r => ['application', 'transport'].includes(r.key)), ...en.requirements].map(r => [r.label, r.value]),
      message: brief.notes,
    });
  };

  const err = name => fieldErrors.includes(name) && <span className="desk-error" id={`${fieldId(uid, name)}-error`}>{t.errors[name]}</span>;
  const describedBy = name => (fieldErrors.includes(name) ? `${fieldId(uid, name)}-error` : undefined);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
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
                  <Dialog.Close asChild>
                    <Button type="button" size="lg" className="day-cta">{t.done}</Button>
                  </Dialog.Close>
                </section>
              ) : (
                <>
                  <h3 ref={heading} tabIndex={-1} className="desk-step-title">
                    <span>{step + 1} / 4</span>
                    {t.steps[step]}
                  </h3>
                  {step === 0 && <RequirementsStep uid={uid} lang={lang} t={t} brief={brief} setGoal={setGoal} setProduct={setProduct} update={update} />}
                  {step === 1 && <ReviewStep lang={lang} t={t} brief={brief} summary={summary} onPick={pick} />}
                  {step === 2 && <CompleteStep uid={uid} lang={lang} t={t} brief={brief} update={update} />}
                  {step === 3 && (
                    <>
                      <BriefStep lang={lang} t={t} brief={brief} summary={summary} onPick={pick} />
                      <form className="desk-contact" onSubmit={send} onFocus={startContact} noValidate>
                        <h4 className="desk-subhead">{t.contactTitle}</h4>
                        <div className="desk-contact-grid">
                          {[['company', 'organization', true], ['email', 'email', true], ['name', 'name', false], ['phone', 'tel', false]].map(([name, auto, required]) => (
                            <div className="desk-field" key={name}>
                              <label htmlFor={fieldId(uid, `contact.${name}`)}>
                                {t[name]}
                                <small>{required ? t.required : t.optional}</small>
                              </label>
                              <input
                                id={fieldId(uid, `contact.${name}`)}
                                type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'}
                                autoComplete={auto}
                                required={required}
                                maxLength={name === 'email' ? 255 : 150}
                                aria-invalid={fieldErrors.includes(`contact.${name}`) || undefined}
                                aria-describedby={describedBy(`contact.${name}`)}
                                value={contact[name]}
                                onChange={e => setContact(c => ({ ...c, [name]: e.target.value }))}
                              />
                              {err(`contact.${name}`)}
                            </div>
                          ))}
                        </div>
                        {/* Honeypot: hidden from people and assistive technology; bots fill it. */}
                        <input className="desk-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)} />
                        <label className="desk-consent" htmlFor={fieldId(uid, 'consent.contact')}>
                          <input id={fieldId(uid, 'consent.contact')} type="checkbox" checked={consent} aria-invalid={fieldErrors.includes('consent.contact') || undefined} aria-describedby={describedBy('consent.contact')} onChange={e => setConsent(e.target.checked)} />
                          <span>{t.consent}</span>
                        </label>
                        {err('consent.contact')}
                        {status === 'failed' && (
                          <div className="desk-failed" role="alert">
                            <p>{t.failed}</p>
                            <button type="button" className="text-link" onClick={mailto}>{t.mailto}</button>
                          </div>
                        )}
                        <Button type="submit" size="lg" className="day-cta desk-submit" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                          {status === 'sending' ? t.sending : status === 'failed' ? t.retry : t.submit}
                          <ArrowUpRight size={18} />
                        </Button>
                      </form>
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
                        {!canContinue && <p className="desk-note">{brief.goal === 'sourcing' ? t.chooseProduct : t.describeGoods}</p>}
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
