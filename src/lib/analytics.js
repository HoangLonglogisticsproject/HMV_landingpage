// Analytics port: events go to window.dataLayer, where the GA4 / Google Tag Manager foundation picks them up. No
// personal data can pass: only the events and parameter names listed here, and only categorical values (lowercase
// slugs) or numbers. Emails, names, companies, phone numbers and free text are dropped by construction.
const EVENTS = {
  trade_desk_open: ['source', 'product', 'locale'],
  trade_product_selected: ['product', 'source'],
  trade_requirement_progress: ['product', 'step', 'progress'],
  trade_brief_generated: ['product', 'missing'],
  trade_contact_start: ['product'],
  generate_lead: ['product', 'locale'],
};
const CATEGORY = /^[a-z0-9_-]{1,40}$/;

/** @param {keyof typeof EVENTS} event @param {Record<string, unknown>} [params] */
export function track(event, params = {}) {
  const keys = EVENTS[event];
  if (!keys || typeof window === 'undefined') return;
  const safe = {};
  for (const key of keys) {
    const value = params[key];
    if ((typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && CATEGORY.test(value))) {
      safe[key] = value;
    }
  }
  if (!window.dataLayer) window.dataLayer = [];
  window.dataLayer.push({ event, ...safe });
}
