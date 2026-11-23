// What every sender of POST /api/inquiry shares (the Trade Desk, the Quick RFQ): the accepted response, the idempotency
// key and the rule that gives a key to exactly one inquiry content. Pure functions.
import { inquiryFingerprint } from './fingerprint';

/** POST /api/inquiry accepted the inquiry: 201 with the reference the CMS issued. */
export const isAccepted = ({ status, body }) => status === 201 && typeof body.reference === 'string';

// randomUUID needs a secure context; getRandomValues does not (plain-http previews).
export const newKey = () => crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');

/**
 * The inquiry as it would be sent now, with its idempotency key, and its content fingerprint. `last` is the previous
 * submission ({ fingerprint, key }, or null): an exact retry keeps its key, any changed content takes a new one, so a
 * key always stands for one exact inquiry.
 * @param {Record<string, any>} draft the inquiry without its key
 * @param {{ fingerprint: string, key: string } | null} last
 */
export function withKey(draft, last) {
  const fingerprint = inquiryFingerprint(draft);
  const key = last?.fingerprint === fingerprint ? last.key : newKey();
  return { inquiry: { ...draft, idempotencyKey: key }, fingerprint };
}
