import { APPLICATIONS, ORIGINS, TRANSPORT, VOLUME_UNITS, productById, requirementsFor } from '@/features/trade-desk/rules';
import { validateInquiry } from '@/features/trade-desk/validation';
import { inquiryFingerprint } from '@/features/trade-desk/fingerprint';
import { createReference } from './reference';

// Inquiry service behind POST /api/inquiry: validation → record → delivery adapter. Results:
// { status: 'accepted', reference } | 'invalid' (with `errors`) | 'unavailable' (no adapter) | 'failed' (delivery) |
// 'conflict' (an idempotency key already used for a different inquiry).

/** The record a delivery adapter receives: the validated inquiry with English labels for the commercial team. */
export function toRecord(value, { reference, createdAt }) {
  const requirements = requirementsFor(value).filter(r => value.requirements[r.key]).map(r => ({
    key: r.key,
    label: r.label.en,
    value: r.kind === 'choice' ? r.options.find(o => o.id === value.requirements[r.key]).label.en : value.requirements[r.key],
  }));
  const product = productById(value.product);
  return {
    reference,
    createdAt,
    locale: value.locale,
    goal: value.goal,
    product: product ? { id: product.id, name: product.en } : null,
    goods: value.goods,
    origin: value.goal === 'sourcing' ? ORIGINS[value.origin].en : value.origin,
    destination: value.destination,
    volume: value.volume.amount ? `${value.volume.amount} ${VOLUME_UNITS[value.volume.unit].en}` : '',
    application: APPLICATIONS[value.product]?.[value.application]?.en ?? '',
    transport: TRANSPORT[value.transport]?.en ?? '',
    requirements,
    notes: value.notes,
    contact: value.contact,
    source: value.context,
    // Submitting requires the contact-consent checkbox: its timestamp is the submission's.
    consent: { contactAcceptedAt: createdAt },
  };
}

/**
 * @param {{ adapter: { deliver(record: object, inquiry: object): Promise<{ reference: string } | void> } | null, now?: () => Date,
 *   newReference?: (date: Date) => string, cache?: Map<string, any>, ttlMs?: number }} options
 */
export function createInquiryService({ adapter, now = () => new Date(), newReference = createReference, cache = new Map(), ttlMs = 15 * 60_000 }) {
  async function deliver(value) {
    const date = now();
    const reference = newReference(date);
    try {
      const receipt = await adapter.deliver(toRecord(value, { reference, createdAt: date.toISOString() }), value);
      // A destination that issues references (the CMS) is authoritative: the buyer quotes the one it stored.
      return { status: 'accepted', reference: receipt?.reference ?? reference };
    } catch (error) {
      // The idempotency key and the cause only: never contact details.
      console.error(`inquiry ${value.idempotencyKey} not delivered: ${error instanceof Error ? error.message : error}`);
      return { status: 'failed' };
    }
  }

  return async function submit(input) {
    const result = validateInquiry(input);
    if (!result.ok) return { status: 'invalid', errors: result.errors };
    if (!adapter) return { status: 'unavailable' };
    if (result.spam) return { status: 'accepted', reference: newReference(now()) };

    // Duplicate submits (double click, retry after a lost response) share one delivery and one reference. A key is
    // bound to the content it was first used with: the same key with other content is a conflict, never the first
    // inquiry's result, and never replaces it.
    // ponytail: per server instance; across instances the CMS's unique idempotency key makes it durable (a webhook
    // destination must deduplicate on its own).
    const key = result.value.idempotencyKey;
    const fingerprint = inquiryFingerprint(result.value);
    const clock = now().getTime();
    const prior = cache.get(key);
    if (prior && prior.expires > clock) return prior.fingerprint === fingerprint ? prior.result : { status: 'conflict' };
    const pending = deliver(result.value).then(outcome => {
      if (outcome.status !== 'accepted' && cache.get(key)?.result === pending) cache.delete(key);
      return outcome;
    });
    cache.set(key, { fingerprint, result: pending, expires: clock + ttlMs });
    for (const [k, entry] of cache) if (cache.size > 500 || entry.expires <= clock) cache.delete(k); else break;
    return pending;
  };
}
