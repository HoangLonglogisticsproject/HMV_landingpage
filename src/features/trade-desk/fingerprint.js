// The identity of an inquiry's content: canonical JSON (object keys sorted, so order never matters) of everything but its
// idempotency key and the honeypot. The same content always gives the same string; any changed value gives another.
// The Trade Desk keeps an idempotency key for exactly one fingerprint; the inquiry service refuses a key reused with
// another one.

// Code-unit order, explicitly: the same on every machine (localeCompare would depend on the runtime's locale).
const byCodeUnit = (a, b) => (a < b ? -1 : Number(a > b));

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const members = Object.keys(value).sort(byCodeUnit).map(key => member(key, value[key]));
    return `{${members.join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/** One object member: `"key":value`. */
function member(key, value) {
  return `${JSON.stringify(key)}:${canonical(value)}`;
}

/** @param {Record<string, unknown>} inquiry */
export const inquiryFingerprint = ({ idempotencyKey: _key, website: _honeypot, ...content }) => canonical(content);
