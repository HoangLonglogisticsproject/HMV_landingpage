// Analytics port: events go to window.dataLayer, where the GA4 / Google Tag Manager foundation picks them up. No
// personal data can pass: only the events and parameter names listed here, and only categorical values (lowercase
// slugs) or numbers. Emails, names, companies, phone numbers and free text are dropped by construction.
const EVENTS = {
  trade_desk_open: ['source', 'product', 'locale'],
  trade_product_selected: ['product', 'source'],
  trade_destination_completed: ['product'],
  trade_volume_completed: ['product'],
  trade_route_rfq: ['product'],
  trade_route_discovery: ['product'],
  trade_contact_start: ['product', 'route'],
  // The Quick RFQ (features/inquiries/QuickRfq.jsx): `step` is 'requirement' | 'contact'; `reason` the kind of failure.
  quick_rfq_start: ['product', 'locale', 'step'],
  quick_rfq_requirement_complete: ['product', 'locale', 'step'],
  quick_rfq_contact_start: ['product', 'locale', 'step'],
  quick_rfq_submit: ['product', 'locale', 'step'],
  quick_rfq_success: ['product', 'locale'],
  quick_rfq_error: ['product', 'locale', 'step', 'reason'],
  // A homepage call to action that takes the buyer to the Quick RFQ (not a lead): `source` is 'hero', 'sticky' or 'final'.
  // The calls to action that open the Trade Desk are counted by trade_desk_open.
  home_supply_plan_click: ['source', 'locale'],
  // An accepted inquiry of either lane; `source` is set by the Quick RFQ.
  generate_lead: ['product', 'locale', 'route', 'source'],
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
