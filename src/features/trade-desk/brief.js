// The buyer brief: the structured state the Trade Desk edits and the source of truth for the summary and the inquiry.
// Pure functions only; the summary states what the buyer entered and what HMV still needs, never prices, availability,
// transit times or certifications.
import {
  APPLICATIONS, ORIGINS, TRANSPORT, VOLUME_UNITS, checklist, defaultUnit, missingInformation, originsFor, productById,
  requirementsFor,
} from './rules';

/** DOM id of a brief field: shared by the steps and the desk's focus handling. */
export const fieldId = (uid, key) => `${uid}-${key}`;

/** @param {{ goal?: string, product?: string | null }} [start] */
export function emptyBrief({ goal = 'sourcing', product = null } = {}) {
  return {
    goal,
    product: productById(product) ? product : null,
    goods: '',
    origin: goal === 'sourcing' ? originsFor(product)[0] : '',
    destination: '',
    volume: { amount: '', unit: defaultUnit(product) },
    application: '',
    transport: '',
    requirements: {},
    notes: '',
  };
}

/**
 * The brief after choosing a product: origin and volume unit follow the product; answers to other products' fields go.
 * An amount is kept only while its unit stays: 5000 MT / month never becomes 5000 containers.
 */
export const withProduct = (brief, product) => {
  const unit = defaultUnit(product);
  return {
    ...brief,
    product,
    origin: originsFor(product)[0],
    volume: unit === brief.volume.unit ? brief.volume : { amount: '', unit },
    application: '',
    requirements: {},
  };
};

const filled = value => String(value ?? '').trim() !== '';

/** Origin as displayed: a sourcing origin from the rules, otherwise what the buyer typed. */
const originLabel = (brief, lang) => (brief.goal === 'sourcing' ? ORIGINS[brief.origin]?.[lang] : brief.origin) ?? '';

/** The brief as rows of known values, in the buyer's language. `pending`: the placeholder for an unknown destination. */
export function summarize(brief, lang, { pending }) {
  const product = productById(brief.product);
  const origin = originLabel(brief, lang);
  const destination = brief.destination.trim();
  const rows = [];
  const row = (key, label, value) => filled(value) && rows.push({ key, label, value });
  row('product', { en: 'Product', vi: 'Sản phẩm' }[lang], product?.[lang] ?? brief.goods.trim());
  if (filled(origin) || filled(destination)) {
    row('route', { en: 'Route', vi: 'Tuyến' }[lang], `${origin || pending} → ${destination || pending}`);
  }
  if (filled(brief.volume.amount)) {
    row('volume', { en: 'Estimated volume', vi: 'Sản lượng dự kiến' }[lang], `${brief.volume.amount.trim()} ${VOLUME_UNITS[brief.volume.unit][lang]}`);
  }
  row('application', { en: 'Application', vi: 'Mục đích sử dụng' }[lang], APPLICATIONS[brief.product]?.[brief.application]?.[lang]);
  row('transport', { en: 'Transport', vi: 'Vận chuyển' }[lang], TRANSPORT[brief.transport]?.[lang]);
  const requirements = requirementsFor(brief)
    .filter(r => filled(brief.requirements[r.key]))
    .map(r => ({
      key: r.key,
      label: r.label[lang],
      value: r.kind === 'choice' ? r.options.find(o => o.id === brief.requirements[r.key])?.label[lang] : brief.requirements[r.key].trim(),
    }));
  const missing = missingInformation(brief).map(m => ({ key: m.key, label: m.label[lang], core: m.core }));
  return { rows, requirements, missing };
}

/** Share of the checklist answered, rounded to a quarter (0, 25, 50, 75, 100): a categorical value for analytics. */
export function progress(brief) {
  const items = checklist(brief);
  return Math.round((items.filter(i => i.done).length / items.length) * 4) * 25;
}

/** The inquiry sent to POST /api/inquiry: the brief, the contact and the page context. Validated again on the server. */
export function toInquiry(brief, { contact, consent, locale, context, idempotencyKey, website = '' }) {
  return {
    idempotencyKey,
    locale,
    goal: brief.goal,
    product: brief.product,
    goods: brief.goods,
    origin: brief.origin,
    destination: brief.destination,
    volume: brief.volume,
    application: brief.application,
    transport: brief.transport,
    requirements: Object.fromEntries(Object.entries(brief.requirements).filter(([, v]) => filled(v))),
    notes: brief.notes,
    contact,
    consent: { contact: consent === true },
    context,
    website,
  };
}
