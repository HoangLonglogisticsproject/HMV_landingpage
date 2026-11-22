// Validation of a Vietnam–Cambodia consolidation route assessment (POST /api/route-assessment): authoritative on the
// server, shared with the form (views/consolidation/RouteAssessmentForm) for early feedback. The contact, consent, visit
// context and idempotency key follow the Trade Desk's rules (features/trade-desk/validation.js); the shipment fields are
// the shipper's own text, trimmed, each with one length limit (the field's maxLength): over it is an error, never a
// shortened value. Unknown keys are dropped.
import { KEY, LIMITS as CONTACT_LIMITS, checkContact, errorList, sourceContext } from '@/features/trade-desk/validation';

/** The service a route assessment is for: its id in the request, its name for the commercial team (record, sheet). */
export const SERVICE = { id: 'vietnam-cambodia-consolidation', name: 'Vietnam–Cambodia Consolidation' };

/** Character limits of the form's fields. */
export const LIMITS = { origin: 120, destination: 120, cargo: 500, volume: 120, frequency: 120, notes: 2000, ...CONTACT_LIMITS };
/** The shipment fields, in form order; the first four are required. */
export const SHIPMENT = ['origin', 'destination', 'cargo', 'volume', 'frequency', 'notes'];
const REQUIRED = new Set(['origin', 'destination', 'cargo', 'volume']);
// The call to action's analytics slug (`en_route_assessment`); anything else is dropped.
const SOURCE = /^[a-z0-9_]{1,40}$/;

/**
 * @param {any} input the request body
 * @returns {{ ok: true, value: object, spam: boolean } | { ok: false, errors: string[] }}
 */
export function validateRouteAssessment(input) {
  const body = input && typeof input === 'object' ? input : {};
  const check = errorList();
  // The checks run in form order, which is the order of the errors: service, shipment, contact, then the key.
  if (body.service !== SERVICE.id) check.fail('service');
  const shipment = {};
  for (const field of SHIPMENT) {
    shipment[field] = check.typed(field, body[field], LIMITS[field]);
    if (REQUIRED.has(field) && !shipment[field]) check.fail(field);
  }
  const contact = checkContact(body, check);
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';
  if (!KEY.test(idempotencyKey)) check.fail('idempotencyKey');

  if (check.errors.length) return { ok: false, errors: [...new Set(check.errors)] };
  return {
    ok: true,
    // A filled honeypot field (hidden from people): accepted, never delivered.
    spam: typeof body.website === 'string' && body.website.trim() !== '',
    value: {
      idempotencyKey,
      locale: body.locale === 'vi' ? 'vi' : 'en',
      service: SERVICE.id,
      source: typeof body.source === 'string' && SOURCE.test(body.source) ? body.source : '',
      ...shipment,
      contact,
      context: sourceContext(body.context),
    },
  };
}
