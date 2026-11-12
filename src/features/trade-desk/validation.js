// Validation of an inquiry (POST /api/inquiry): authoritative on the server, shared with the Trade Desk for early
// feedback. Only fields and values the rules allow survive; strings are trimmed; unknown keys are dropped. What the
// buyer types has one length limit, the same in the field (maxLength), here and in the CMS contract: over it is an
// error for that field, never a silently shortened value.
import { APPLICATIONS, TRANSPORT, VOLUME_UNITS, originsFor, productById, requirementsFor } from './rules';

/** Character limits of the buyer's text fields (DeskSteps and TradeDesk use them as maxLength). */
export const LIMITS = {
  destination: 120,
  'volume.amount': 20,
  requirement: 200,
  notes: 2000,
  'contact.company': 150,
  'contact.email': 254,
  'contact.name': 100,
  'contact.phone': 40,
};

const str = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const text = value => (typeof value === 'string' ? value.trim() : '');
const PHONE = /^[+\d()\s.-]*$/;
const AMOUNT = /^\d[\d.,\s]*$/;
const UTM = /^[\w.+\- ]*$/;
const KEY = /^[A-Za-z0-9-]{8,64}$/;

/** A same-site path (no query or fragment, which can carry personal data); '' otherwise. */
const path = value => {
  const p = str(value, 300).split(/[?#]/)[0];
  return p.startsWith('/') && !p.startsWith('//') ? p : '';
};
/** The origin of an http(s) referrer, never its path or query; '' otherwise. */
const origin = value => {
  try {
    const url = new URL(str(value, 500));
    return /^https?:$/.test(url.protocol) ? url.origin : '';
  } catch {
    return '';
  }
};

/** No dot at the start or end and no two in a row: every dot-separated part is non-empty. */
const dotsInside = part => !part.startsWith('.') && !part.endsWith('.') && !part.includes('..');

/**
 * The shape of an email address, checked without a backtracking pattern: exactly one @ after a local part, no
 * whitespace, dots only inside the local part and the domain, and a domain with a dot ending in a top-level part of
 * 2+ characters. The CMS checks the address fully (class-validator isEmail); this refuses what a buyer mistypes, never
 * more than the CMS does for an ordinary address.
 */
function isEmailShape(value) {
  const at = value.indexOf('@');
  if (at < 1 || at !== value.lastIndexOf('@') || /\s/.test(value)) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const lastDot = domain.lastIndexOf('.');
  return dotsInside(local) && dotsInside(domain) && lastDot > 0 && domain.length - lastDot > 2;
}

/** The fields with an error, in the order they are checked. `typed` reads buyer text against its length limit. */
function errorList() {
  const errors = [];
  const fail = field => errors.push(field);
  /** Trimmed buyer text; longer than its limit is an error for `field`, never a silently shortened value. */
  const typed = (field, value, max = LIMITS[field]) => {
    const v = text(value);
    if (v.length > max) fail(field);
    return v;
  };
  return { errors, fail, typed };
}

/** The product and its supply plan. Every inquiry is for one product; its origin is one the product offers (its first by default). */
function checkPlan(body, { fail, typed }) {
  const product = productById(body.product) ? body.product : null;
  if (!product) fail('product');
  const origins = originsFor(product);
  const destination = typed('destination', body.destination);
  const notes = typed('notes', body.notes);
  const amount = typed('volume.amount', body.volume?.amount);
  if (amount && !AMOUNT.test(amount)) fail('volume.amount');
  return {
    product,
    origin: origins.includes(body.origin) ? body.origin : origins[0],
    destination,
    volume: { amount, unit: Object.hasOwn(VOLUME_UNITS, body.volume?.unit) ? body.volume.unit : 'containers' },
    application: Object.hasOwn(APPLICATIONS[product] ?? {}, body.application) ? body.application : '',
    transport: Object.hasOwn(TRANSPORT, body.transport) ? body.transport : '',
    notes,
  };
}

/** The answered requirements of the product, in its order; a choice must be one of its options. */
function checkRequirements(body, product, { fail, typed }) {
  const given = body.requirements && typeof body.requirements === 'object' ? body.requirements : {};
  const requirements = {};
  for (const r of requirementsFor({ product })) {
    const value = typed(`requirements.${r.key}`, given[r.key], LIMITS.requirement);
    if (!value) continue;
    if (r.kind === 'choice' && !r.options.some(o => o.id === value)) fail(`requirements.${r.key}`);
    else requirements[r.key] = value;
  }
  return requirements;
}

/** The contact (email lower-cased) and the consent to be contacted. */
function checkContact(body, { fail, typed }) {
  const contact = {
    company: typed('contact.company', body.contact?.company),
    email: typed('contact.email', body.contact?.email).toLowerCase(),
    name: typed('contact.name', body.contact?.name),
    phone: typed('contact.phone', body.contact?.phone),
  };
  if (contact.company.length < 2) fail('contact.company');
  if (!isEmailShape(contact.email)) fail('contact.email');
  if (!PHONE.test(contact.phone)) fail('contact.phone');
  if (body.consent?.contact !== true) fail('consent.contact');
  return contact;
}

/**
 * The contact fields (and consent) these values would fail on, by the send's own rules: lets the Trade Desk drop the
 * error of a field the buyer has corrected without waiting for the next send.
 */
export function contactErrors(contact, consent) {
  const check = errorList();
  checkContact({ contact, consent: { contact: consent } }, check);
  return check.errors;
}

/** Where the visit came from: same-site paths, the referrer's origin and plain UTM values, nothing more. */
function sourceContext(context) {
  const utm = Object.fromEntries(['source', 'medium', 'campaign'].map(k => {
    const value = str(context?.utm?.[k], 100);
    return [k, UTM.test(value) ? value : ''];
  }));
  return { page: path(context?.page), landingPage: path(context?.landingPage), referrer: origin(context?.referrer), utm };
}

/**
 * @param {any} input the request body
 * @returns {{ ok: true, value: object, spam: boolean } | { ok: false, errors: string[] }}
 */
export function validateInquiry(input) {
  const body = input && typeof input === 'object' ? input : {};
  const check = errorList();
  // The checks run in this order, which is the order of the errors: plan, requirements, contact, then the key.
  const { notes, ...plan } = checkPlan(body, check);
  const requirements = checkRequirements(body, plan.product, check);
  const contact = checkContact(body, check);
  const idempotencyKey = text(body.idempotencyKey);
  if (!KEY.test(idempotencyKey)) check.fail('idempotencyKey');

  if (check.errors.length) return { ok: false, errors: [...new Set(check.errors)] };
  return {
    ok: true,
    // A filled honeypot field (hidden from people): accepted, never delivered.
    spam: str(body.website, 200) !== '',
    value: {
      idempotencyKey,
      locale: body.locale === 'vi' ? 'vi' : 'en',
      ...plan,
      requirements,
      notes,
      contact,
      context: sourceContext(body.context),
    },
  };
}
