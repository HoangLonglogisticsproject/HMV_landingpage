'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Check, Mail, RotateCcw } from 'lucide-react';
import { createInquiryMailto } from '@/features/inquiries/inquiry';
import { LIMITS, SERVICE, SHIPMENT, validateRouteAssessment } from '@/features/route-assessment/validation';
import { inquiryFingerprint } from '@/features/trade-desk/fingerprint';
import { visitContext } from '@/features/trade-desk/visit';
import { track } from '@/lib/analytics';
import { sendInquiry } from '@/lib/inquiry';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';

// The route assessment form of the Vietnam–Cambodia consolidation page: POST /api/route-assessment through the inquiry
// port (`@/lib/inquiry`), with the Trade Desk's discipline: the server's validation checked here first, one idempotency
// key per exact content (an exact retry reuses it), "sent" and its reference only after a 201, otherwise the answers
// kept with a retry and an email draft. The commodity Trade Desk is untouched.
export const ENDPOINT = '/api/route-assessment';
const CONTACT = ['company', 'name', 'email', 'phone'];
const REQUIRED = new Set(['origin', 'destination', 'cargo', 'volume', 'company', 'email']);
const MULTILINE = new Set(['cargo', 'notes']);
const INPUT = { email: { type: 'email', autoComplete: 'email' }, phone: { type: 'tel', autoComplete: 'tel' }, company: { autoComplete: 'organization' }, name: { autoComplete: 'name' } };
const EMPTY = Object.fromEntries([...SHIPMENT, ...CONTACT].map(field => [field, '']));
// randomUUID needs a secure context; getRandomValues does not (plain-http previews).
const newKey = () => crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
/** The validation's name for a form field: contact fields are nested in the request. */
const errorKey = field => (CONTACT.includes(field) ? `contact.${field}` : field);
// Floated: a normal flex item rather than a legend drawn into the fieldset's border.
const LEGEND = 'float-left w-full text-xs font-semibold tracking-wide text-(--farm-green-ink) uppercase';
const FIELD_CLASS =
  'w-full rounded-lg border border-border bg-white px-3 text-[15px] text-ink placeholder:text-ink-muted/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand aria-invalid:border-red-600';

function Field({ uid, field, copy, value, error, onChange }) {
  const id = `${uid}-${field}`;
  const hint = copy.hints[field];
  const props = {
    id,
    name: field,
    value,
    maxLength: LIMITS[errorKey(field)],
    placeholder: hint,
    'aria-required': REQUIRED.has(field) || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
    'data-field': errorKey(field),
    onChange: e => onChange(field, e.target.value),
    className: cn(FIELD_CLASS, MULTILINE.has(field) ? 'min-h-24 py-2.5' : 'h-11'),
  };
  return (
    <div className={cn('flex flex-col gap-1.5', MULTILINE.has(field) && 'sm:col-span-2')}>
      <label htmlFor={id} className="text-sm font-medium text-navy">
        {copy.labels[field]}
        {!REQUIRED.has(field) && <span className="font-normal text-ink-muted"> ({copy.optional})</span>}
      </label>
      {MULTILINE.has(field) ? <textarea rows={3} {...props} /> : <input type="text" {...INPUT[field]} {...props} />}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-700">
          {copy.errors[errorKey(field)]}
        </p>
      )}
    </div>
  );
}

/** @param {{ lang: 'en' | 'vi', copy: any, source: string }} props `copy`: the page copy's `form`; `source`: the analytics source */
export function RouteAssessmentForm({ lang, copy, source }) {
  const uid = useId();
  const form = useRef(null);
  // The last submission: its content fingerprint and idempotency key.
  const submission = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState('idle');
  const [reference, setReference] = useState('');
  // The first field the server found invalid. Its answer arrives while the fieldsets are disabled (sending), when no
  // field takes focus: it is focused once the form is enabled again and the errors are rendered.
  const serverInvalid = useRef(null);

  useEffect(() => {
    if (!serverInvalid.current) return;
    form.current?.querySelector(`[data-field="${serverInvalid.current}"]`)?.focus();
    serverInvalid.current = null;
  }, [status]);

  /** The request as it would be sent now: an exact retry keeps the key, any change takes a new one. */
  const prepare = () => {
    const { company, name, email, phone, ...shipment } = values;
    const draft = { locale: lang, service: SERVICE.id, source, ...shipment, contact: { company, email, name, phone }, consent: { contact: consent }, context: visitContext(), website };
    const fingerprint = inquiryFingerprint(draft);
    const key = submission.current?.fingerprint === fingerprint ? submission.current.key : newKey();
    submission.current = { fingerprint, key };
    return { ...draft, idempotencyKey: key };
  };

  /**
   * Errors of fields the buyer can correct, shown at their fields, the first one focused (`fromServer`: once the form is
   * enabled again); false when there are none.
   */
  const showErrors = (fields, fromServer = false) => {
    const own = fields.filter(f => form.current?.querySelector(`[data-field="${f}"]`));
    setErrors(own);
    if (fromServer) serverInvalid.current = own[0];
    else form.current?.querySelector(`[data-field="${own[0]}"]`)?.focus();
    return own.length > 0;
  };

  async function submit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    const request = prepare();
    const check = validateRouteAssessment(request);
    if (!check.ok) {
      if (!showErrors(check.errors)) setStatus('failed');
      return;
    }
    setErrors([]);
    setStatus('sending');
    try {
      const response = await sendInquiry(request, { url: ENDPOINT });
      if (response.status === 201 && typeof response.body.reference === 'string') {
        track('generate_lead', { product: SERVICE.id, locale: lang, route: 'route_assessment' });
        setReference(response.body.reference);
        setStatus('sent');
        return;
      }
      // 409: this key was used for other content; the next attempt takes a new one.
      if (response.status === 409) submission.current = null;
      setStatus(response.status === 400 && showErrors(response.body.fields ?? [], true) ? 'idle' : 'failed');
    } catch {
      setStatus('failed');
    }
  }

  const change = (field, value) => {
    setValues(v => ({ ...v, [field]: value }));
    setErrors(e => e.filter(f => f !== errorKey(field)));
  };

  // The fallback when the endpoint cannot take the request: the same answers as an email draft.
  const mailto = () => {
    const { company, name, email, phone, origin, destination, cargo, volume, frequency, notes } = values;
    // The helper leaves out empty values.
    const requirements = [['Origin', origin], ['Cargo', cargo], ['Expected frequency', frequency], ['WhatsApp / phone', phone]];
    window.location.assign(createInquiryMailto({ company, name, email, product: SERVICE.name, destination, volume, requirements, message: notes }));
  };

  const restart = () => {
    setValues(EMPTY);
    setConsent(false);
    setReference('');
    setStatus('idle');
    submission.current = null;
  };

  if (status === 'sent') {
    return (
      <output className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-600/30 bg-white p-6 sm:p-8">
        <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <p className="text-lg font-semibold text-navy">{copy.sent.title}</p>
        <p className="text-sm text-ink-muted">
          {copy.sent.text} <strong className="font-semibold text-navy">{reference}</strong>
        </p>
        <button type="button" onClick={restart} className="text-sm font-medium text-brand hover:underline">
          {copy.sent.another}
        </button>
      </output>
    );
  }

  const field = name => <Field key={name} uid={uid} field={name} copy={copy} value={values[name]} error={errors.includes(errorKey(name))} onChange={change} />;
  const consentError = errors.includes('consent.contact');
  return (
    <form ref={form} noValidate onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-white p-5 shadow-[0_24px_48px_-36px_rgb(0_29_89/0.6)] sm:p-7">
      <fieldset disabled={status === 'sending'} className="flex min-w-0 flex-col gap-3">
        <legend className={LEGEND}>{copy.groups.shipment}</legend>
        <div className="grid gap-4 sm:grid-cols-2">{SHIPMENT.map(field)}</div>
      </fieldset>
      <fieldset disabled={status === 'sending'} className="flex min-w-0 flex-col gap-3">
        <legend className={cn(LEGEND, 'border-t border-border/60 pt-5')}>{copy.groups.contact}</legend>
        <div className="grid gap-4 sm:grid-cols-2">{CONTACT.map(field)}</div>
        <div className="flex flex-col gap-1.5 pt-1">
          <label className="flex items-start gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={consent}
              data-field="consent.contact"
              aria-invalid={consentError || undefined}
              aria-describedby={consentError ? `${uid}-consent-error` : undefined}
              onChange={e => {
                setConsent(e.target.checked);
                setErrors(list => list.filter(f => f !== 'consent.contact'));
              }}
              className="mt-0.5 size-4 shrink-0 accent-brand"
            />
            <span>
              {copy.consent}{' '}
              <Link to="/privacy" className="text-brand underline underline-offset-2">
                {copy.privacy}
              </Link>
            </span>
          </label>
          {consentError && (
            <p id={`${uid}-consent-error`} className="text-xs text-red-700">
              {copy.errors['consent.contact']}
            </p>
          )}
        </div>
      </fieldset>
      {/* A field hidden from people: filled in, the request is accepted and never delivered. */}
      <input className="desk-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)} />
      {status === 'failed' && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-50 p-4 text-sm text-ink">
          <p>{copy.failed.text}</p>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
              <RotateCcw className="size-4" aria-hidden="true" />
              {copy.failed.retry}
            </button>
            <button type="button" onClick={mailto} className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
              <Mail className="size-4" aria-hidden="true" />
              {copy.failed.email}
            </button>
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-lg bg-brand px-6 py-2.5 text-center text-[15px] font-semibold text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-70"
      >
        {status === 'sending' ? copy.sending : copy.submit}
        <ArrowRight className="size-[18px]" aria-hidden="true" />
      </button>
    </form>
  );
}
