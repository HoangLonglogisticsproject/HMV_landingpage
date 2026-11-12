// The identity of an inquiry's content: canonical JSON (object keys sorted, so order never matters) of everything but its
// idempotency key and the honeypot. The same content always gives the same string; any changed value gives another.
// The Trade Desk keeps an idempotency key for exactly one fingerprint; the inquiry service refuses a key reused with
// another one.

const canonical = value => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
};

/** @param {Record<string, unknown>} inquiry */
export const inquiryFingerprint = ({ idempotencyKey: _key, website: _honeypot, ...content }) => canonical(content);
