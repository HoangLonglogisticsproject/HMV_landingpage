'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { sendInquiry } from '@/lib/inquiry';
import { defaultUnit, productById } from '@/features/trade-desk/rules';
import { summarize, toInquiry } from '@/features/trade-desk/brief';
import { LIMITS, contactErrors, isAmount, validateInquiry } from '@/features/trade-desk/validation';
import { isAccepted, withKey } from '@/features/trade-desk/submission';
import { openTradeDesk } from '@/features/trade-desk/open';
import { visitContext } from '@/features/trade-desk/visit';
import { createInquiryMailto } from './inquiry';
import { FOCUS_QUICK_RFQ } from './focus';
import { quickRfqCopy } from './quickRfqCopy';
import { ContactStep, Guidance, RequirementStep, SentState, Steps } from './QuickRfqParts';

// The Quick RFQ, the fast lane of the same lead pipeline as the HMV Trade Desk (the assisted lane): for a buyer who
// already knows what they need. Step 1 the requirement (product, destination, volume), step 2 the contact (company,
// work email, consent). It sends the Trade Desk's inquiry to POST /api/inquiry (same contract, validation, idempotency
// key and honeypot) and shows the reference once the server accepted it; only when delivery fails does it offer the
// email draft. `product`: a product id fixes the product (a product page already knows it) and the form does not ask it.

// The form's values by the inquiry contract's field names (what the server's 400 names).
const FIELD = { product: 'product', destination: 'destination', amount: 'volume.amount', company: 'contact.company', name: 'contact.name', email: 'contact.email', phone: 'contact.phone', consent: 'consent.contact', notes: 'notes' };
const REQUIREMENT = new Set(['product', 'destination', 'volume.amount']);
const MORE = new Set(['contact.name', 'contact.phone', 'notes']);
// Fields in screen order: the first one with an error is focused.
const ORDER = [...REQUIREMENT, 'contact.company', 'contact.email', ...MORE, 'consent.contact'];
// `unit`: '' is the product's usual one.
const BLANK = { product: '', destination: '', amount: '', unit: '', company: '', email: '', name: '', phone: '', notes: '', consent: false, website: '' };
const REASON = { 400: 'invalid', 409: 'conflict', 503: 'unavailable' };

/** The requirement and the contact the form's values stand for, trimmed: what is validated and sent. */
function readValues(values, locked) {
  const id = locked ?? values.product;
  const trim = key => values[key].trim();
  return {
    brief: {
      product: productById(id) ? id : null,
      destination: trim('destination'),
      volume: { amount: trim('amount'), unit: values.unit || defaultUnit(id) },
      notes: trim('notes'),
    },
    contact: { company: trim('company'), email: trim('email'), name: trim('name'), phone: trim('phone') },
  };
}

/** The fields the requirement step fails on: all three are required here, though the server takes them as optional. */
function requirementErrors({ brief }) {
  const errors = [];
  if (!brief.product) errors.push('product');
  if (!brief.destination || brief.destination.length > LIMITS.destination) errors.push('destination');
  if (!isAmount(brief.volume.amount)) errors.push('volume.amount');
  return errors;
}

/** Every field the values fail on by the client's rules, both steps. */
const localErrors = (read, consent) => [...requirementErrors(read), ...contactErrors(read.contact, consent)];

/** Where the buyer is in the form, as the id key of the control that stands for it. */
function placeOf(step, status, locked) {
  if (status === 'accepted') return 'sent';
  if (step === 'contact') return 'heading';
  return locked ? 'destination' : 'product';
}

/**
 * @param {{ lang: 'en' | 'vi', product?: string, source?: string, intro?: import('react').ReactNode, guidance?: boolean | 'started', strip?: boolean }} props
 * `source`: where the form is, for analytics and the Trade Desk it opens. `intro`: the page's own heading, shown at the
 * top of the first step (not of the second, nor of the received state). `guidance`: the "Need guidance?" row below the
 * form, which opens the desk with what the buyer has typed: always (`true`, the default), never (`false`), or from the
 * moment the buyer has started the requirement (`'started'`: for a page that already offers the desk elsewhere, so the
 * row says "I started and now need help", not a second copy of the same call to action). `strip`: a compact horizontal
 * layout of the same elements for a wide page (a band under the hero); one column on a phone.
 */
export function QuickRfq({ lang, product, source = 'quick_rfq', intro, guidance = true, strip = false }) {
  const c = quickRfqCopy[lang];
  const uid = useId().replaceAll(':', '');
  const id = key => `${uid}-${key}`;
  const fixed = productById(product);
  const locked = fixed?.id;
  const [step, setStep] = useState('requirement');
  const [values, setValues] = useState(BLANK);
  const [more, setMore] = useState(false);
  const [errors, setErrors] = useState(/** @type {string[]} */ ([]));
  const [status, setStatus] = useState('idle'); // idle | sending | failed | accepted
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);
  // The buyer has begun answering (any field but the honeypot): until then there is nothing to hand over.
  const [started, setStarted] = useState(false);
  // The last submission: its content fingerprint and idempotency key (an exact retry reuses the key, a changed inquiry
  // takes a new one); and whether one is in flight, which a second click must not start again.
  const last = useRef(/** @type {{ fingerprint: string, key: string } | null} */ (null));
  const sending = useRef(false);
  // Counted once each, however often the buyer goes back and forth.
  const counted = useRef({ start: false, contact: false });
  const pendingFocus = useRef(/** @type {string | null} */ (null));
  const rootRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const read = readValues(values, locked);
  const { brief, contact } = read;
  const facts = stepName => ({ product: brief.product ?? undefined, locale: lang, step: stepName });

  // Focus follows the buyer once the screen is updated: the next step's heading, the first field with an error, the
  // result. Never on load: only what the buyer did moves it.
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(id(pendingFocus.current))?.focus();
    pendingFocus.current = null;
  });

  // A call to action elsewhere on the page (focus.js) brings the buyer here: the form into view unless the control they
  // are going to is already, then focus on where they are in it. The scroll clears the header (the page's scroll padding).
  useEffect(() => {
    const toForm = () => {
      const target = document.getElementById(`${uid}-${placeOf(step, status, locked)}`);
      if (!target) return;
      const clear = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const { top, bottom } = target.getBoundingClientRect();
      if (top < clear || bottom > window.innerHeight) {
        // A form that fits the screen is centred (a strip under the hero, the hero above it); a tall one starts at the top.
        const fits = (rootRef.current?.getBoundingClientRect().height ?? 0) <= window.innerHeight - 2 * clear;
        rootRef.current?.scrollIntoView({ block: fits ? 'center' : 'start' });
      }
      target.focus({ preventScroll: true });
    };
    window.addEventListener(FOCUS_QUICK_RFQ, toForm);
    return () => window.removeEventListener(FOCUS_QUICK_RFQ, toForm);
  }, [uid, step, status, locked]);

  /** Shows the errors for fields of this form, on the step that has them; false when none is one of its fields. */
  const showErrors = fields => {
    const own = ORDER.filter(f => fields.includes(f));
    if (!own.length) return false;
    setErrors(own);
    if (own.some(f => MORE.has(f))) setMore(true);
    setStep(REQUIREMENT.has(own[0]) ? 'requirement' : 'contact');
    pendingFocus.current = own[0];
    return true;
  };

  // A field with an error that the buyer corrects loses it at once, by the client's rules; an untouched or still
  // invalid field keeps it, so no message appears before a send.
  const change = (key, value) => {
    const next = { ...values, [key]: value };
    setValues(next);
    const now = readValues(next, locked);
    const field = FIELD[key];
    if (errors.includes(field) && !localErrors(now, next.consent).includes(field)) {
      setErrors(e => e.filter(f => f !== field));
    }
    if (key === 'website') return;
    setStarted(true);
    if (!counted.current.start) {
      counted.current.start = true;
      track('quick_rfq_start', { product: now.brief.product ?? undefined, locale: lang, step: 'requirement' });
    }
  };

  const goToContact = event => {
    event.preventDefault();
    const bad = requirementErrors(read);
    if (bad.length) {
      setErrors(bad);
      pendingFocus.current = bad[0];
      return;
    }
    setErrors(e => e.filter(f => !REQUIREMENT.has(f)));
    setStep('contact');
    pendingFocus.current = 'heading';
    track('quick_rfq_requirement_complete', facts('requirement'));
    if (!counted.current.contact) {
      counted.current.contact = true;
      track('quick_rfq_contact_start', facts('contact'));
    }
  };

  const edit = () => {
    setStep('requirement');
    // The failure was of the inquiry as it was: what the buyer changes is sent anew.
    setStatus('idle');
    pendingFocus.current = locked ? 'destination' : 'product';
  };

  const fail = reason => {
    setStatus('failed');
    pendingFocus.current = 'failed';
    track('quick_rfq_error', { ...facts('contact'), reason });
  };

  const accept = ref => {
    setReference(ref);
    setStatus('accepted');
    pendingFocus.current = 'sent';
    track('quick_rfq_success', { product: brief.product ?? undefined, locale: lang });
    track('generate_lead', { product: brief.product ?? undefined, locale: lang, route: 'rfq', source });
  };

  /** The server's answer: the reference, the fields to correct, or a failure. */
  const settle = response => {
    if (isAccepted(response)) {
      accept(response.body.reference);
      return;
    }
    // 409: this key was used for other content; the next attempt takes a new one.
    if (response.status === 409) last.current = null;
    const refused = response.status === 400 && showErrors(response.body.fields ?? []);
    if (refused) setStatus('idle');
    else fail(REASON[response.status] ?? 'failed');
  };

  async function send(event) {
    event.preventDefault();
    if (sending.current) return;
    const { inquiry, fingerprint } = withKey(
      toInquiry(brief, { contact, consent: values.consent, locale: lang, context: visitContext(), website: values.website }),
      last.current,
    );
    const check = validateInquiry(inquiry);
    if (!check.ok) {
      if (!showErrors(check.errors)) fail('invalid');
      return;
    }
    last.current = { fingerprint, key: inquiry.idempotencyKey };
    sending.current = true;
    setErrors([]);
    setStatus('sending');
    track('quick_rfq_submit', facts('contact'));
    try {
      settle(await sendInquiry(inquiry));
    } catch {
      fail('network');
    } finally {
      sending.current = false;
    }
  }

  // The fallback when the API cannot take the inquiry: the same requirement as an email draft. The helper has no phone
  // line: it goes in as a requirement pair, as in the route assessment's draft (it leaves out empty values).
  const mailto = () => {
    const en = summarize(brief, 'en');
    const { company, name, email, phone } = contact;
    window.location.assign(createInquiryMailto({ company, name, email, product: en.product, destination: en.destination, volume: en.volume, requirements: [['WhatsApp / phone', phone]], message: brief.notes }));
  };

  // The assisted lane, with what the buyer has already told HMV so the desk does not ask it again.
  const openDesk = () => {
    const given = { product: brief.product, destination: brief.destination, volume: isAmount(brief.volume.amount) ? brief.volume : null };
    openTradeDesk({ source, ...Object.fromEntries(Object.entries(given).filter(([, answer]) => answer)) });
  };

  const another = () => {
    setValues(BLANK);
    setMore(false);
    setErrors([]);
    setStatus('idle');
    setReference('');
    setCopied(false);
    setStarted(false);
    setStep('requirement');
    last.current = null;
    counted.current = { start: false, contact: false };
    pendingFocus.current = locked ? 'destination' : 'product';
  };

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
    } catch {
      // No clipboard permission: the reference stays on screen to copy by hand.
    }
  };

  const error = field => (errors.includes(field) ? c.errors[field] : null);
  const showGuidance = guidance === 'started' ? started : guidance;
  const announcement = { sending: c.sending }[status] ?? (copied ? c.copied : '');

  return (
    <div ref={rootRef} className="grid gap-5">
      {/* Announces the send and the copy; the result is announced by the focus moving to it. */}
      <output className="sr-only">{announcement}</output>
      {status === 'accepted' ? (
        <SentState c={c} id={id} reference={reference} copied={copied} strip={strip} onCopy={copyReference} onAnother={another} />
      ) : (
        <>
          <Steps c={c} step={step} intro={intro} strip={strip} onSubmit={step === 'requirement' ? goToContact : send}>
            {step === 'requirement' ? (
              <RequirementStep c={c} lang={lang} id={id} error={error} values={values} unit={brief.volume.unit} locked={fixed} strip={strip} onChange={change} />
            ) : (
              <ContactStep
                c={c}
                lang={lang}
                id={id}
                error={error}
                values={values}
                summary={summarize(brief, lang)}
                more={more}
                status={status}
                strip={strip}
                onChange={change}
                onToggleMore={() => setMore(m => !m)}
                onEdit={edit}
                onMailto={mailto}
              />
            )}
          </Steps>
          {showGuidance && <Guidance c={c} id={id} onOpen={openDesk} />}
        </>
      )}
    </div>
  );
}
