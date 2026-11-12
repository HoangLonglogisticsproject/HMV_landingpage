// Validation of an inquiry (POST /api/inquiry): authoritative on the server, shared with the Trade Desk for early
// feedback. Only fields and values the rules allow survive; strings are trimmed; unknown keys are dropped. What the
// buyer types has one length limit, the same in the field (maxLength), here and in the CMS contract: over it is an
// error for that field, never a silently shortened value.
import { APPLICATIONS, GOALS, TRANSPORT, VOLUME_UNITS, originsFor, productById, requirementsFor } from './rules';

/** Character limits of the buyer's text fields (DeskSteps and TradeDesk use them as maxLength). */
export const LIMITS = {
  goods: 200,
  origin: 120,
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
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+0-9()\s.-]*$/;
const AMOUNT = /^[0-9][0-9.,\s]*$/;
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

/**
 * @param {any} input the request body
 * @returns {{ ok: true, value: object, spam: boolean } | { ok: false, errors: string[] }}
 */
export function validateInquiry(input) {
  const body = input && typeof input === 'object' ? input : {};
  const errors = [];
  const fail = field => errors.push(field);
  /** Trimmed buyer text; longer than its limit is an error for `field`. */
  const typed = (field, value, max = LIMITS[field]) => {
    const v = text(value);
    if (v.length > max) fail(field);
    return v;
  };

  const goal = GOALS.some(g => g.id === body.goal) ? body.goal : (fail('goal'), 'sourcing');
  const sourcing = goal === 'sourcing';
  const product = sourcing ? (productById(body.product) ? body.product : (fail('product'), null)) : null;
  const goods = sourcing ? '' : typed('goods', body.goods);
  if (!sourcing && !goods) fail('goods');
  const origin_ = sourcing ? (originsFor(product).includes(body.origin) ? body.origin : originsFor(product)[0]) : typed('origin', body.origin);
  const destination = typed('destination', body.destination);
  const notes = typed('notes', body.notes);

  const amount = typed('volume.amount', body.volume?.amount);
  if (amount && !AMOUNT.test(amount)) fail('volume.amount');
  const unit = Object.hasOwn(VOLUME_UNITS, body.volume?.unit) ? body.volume.unit : 'containers';
  const application = Object.hasOwn(APPLICATIONS[product] ?? {}, body.application) ? body.application : '';
  const transport = Object.hasOwn(TRANSPORT, body.transport) ? body.transport : '';

  const given = body.requirements && typeof body.requirements === 'object' ? body.requirements : {};
  const requirements = {};
  for (const r of requirementsFor({ goal, product })) {
    const value = typed(`requirements.${r.key}`, given[r.key], LIMITS.requirement);
    if (!value) continue;
    if (r.kind === 'choice' && !r.options.some(o => o.id === value)) fail(`requirements.${r.key}`);
    else requirements[r.key] = value;
  }

  const contact = {
    company: typed('contact.company', body.contact?.company),
    email: typed('contact.email', body.contact?.email).toLowerCase(),
    name: typed('contact.name', body.contact?.name),
    phone: typed('contact.phone', body.contact?.phone),
  };
  if (contact.company.length < 2) fail('contact.company');
  if (!EMAIL.test(contact.email)) fail('contact.email');
  if (!PHONE.test(contact.phone)) fail('contact.phone');
  if (body.consent?.contact !== true) fail('consent.contact');

  const idempotencyKey = text(body.idempotencyKey);
  if (!KEY.test(idempotencyKey)) fail('idempotencyKey');

  const utm = Object.fromEntries(['source', 'medium', 'campaign'].map(k => {
    const value = str(body.context?.utm?.[k], 100);
    return [k, UTM.test(value) ? value : ''];
  }));

  if (errors.length) return { ok: false, errors: [...new Set(errors)] };
  return {
    ok: true,
    // A filled honeypot field (hidden from people): accepted, never delivered.
    spam: str(body.website, 200) !== '',
    value: {
      idempotencyKey,
      locale: body.locale === 'vi' ? 'vi' : 'en',
      goal,
      product,
      goods,
      origin: origin_,
      destination,
      volume: { amount, unit },
      application,
      transport,
      requirements,
      notes,
      contact,
      context: {
        page: path(body.context?.page),
        landingPage: path(body.context?.landingPage),
        referrer: origin(body.context?.referrer),
        utm,
      },
    },
  };
}
