// The buyer's requirement: the state the Trade Desk conversation fills, and the source of truth for the summary, the
// route and the inquiry. The desk asks three things, product, destination and volume; nothing else is asked, inferred
// or filled in. Pure functions only.
import { VOLUME_UNITS, defaultUnit, productById } from './rules';

/** DOM id of a desk control: shared by the conversation and the desk's focus handling. */
export const fieldId = (uid, key) => `${uid}-${key}`;

/**
 * @param {{ product?: string | null, notes?: string }} [start] `notes`: the buyer's own words naming the product, when
 * they typed them; they reach HMV as the inquiry's notes.
 */
export function emptyBrief({ product = null, notes = '' } = {}) {
  const known = productById(product) ? product : null;
  return { product: known, destination: '', volume: { amount: '', unit: defaultUnit(known) }, notes };
}

const filled = value => String(value ?? '').trim() !== '';

/** Product, destination and volume are known: enough to open a commercial inquiry for quotation. */
export const isRfqReady = brief => Boolean(brief.product) && filled(brief.destination) && filled(brief.volume.amount);

/**
 * Who continues with the buyer: HMV Sales ('rfq') for a ready requirement, HMV Customer Service ('discovery')
 * otherwise. The CMS derives the same route from what it stores.
 */
export const routeOf = brief => (isRfqReady(brief) ? 'rfq' : 'discovery');

/** Where the conversation is: the next question, or the route decision once ready or while the buyer is exploring. */
export function stageOf(brief, { exploring }) {
  if (!brief.product) return 'product';
  if (exploring || isRfqReady(brief)) return 'decision';
  return filled(brief.destination) ? 'volume' : 'destination';
}

/** The requirement in the buyer's language; '' for what is not known yet. */
export function summarize(brief, lang) {
  return {
    product: productById(brief.product)?.[lang] ?? '',
    destination: brief.destination.trim(),
    volume: filled(brief.volume.amount) ? `${brief.volume.amount.trim()} ${VOLUME_UNITS[brief.volume.unit][lang]}` : '',
  };
}

/**
 * The inquiry sent to POST /api/inquiry, validated again there. The contract's application, transport and
 * requirements stay empty: the desk does not ask them, and nothing is filled in for them.
 */
export function toInquiry(brief, { contact, consent, locale, context, idempotencyKey, website = '' }) {
  return {
    idempotencyKey,
    locale,
    product: brief.product,
    destination: brief.destination,
    volume: brief.volume,
    application: '',
    transport: '',
    requirements: {},
    notes: brief.notes,
    contact,
    consent: { contact: consent === true },
    context,
    website,
  };
}
