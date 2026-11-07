// URL checks for CMS content (links and media). Pure, no React: used by the rich-text renderer and the article mapper.
// Plain .js so `node --test` can load it.

// Same rule as the CMS (`isSafeHref` in backend rich-content.ts and frontend content-rules.ts).
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
export function isSafeHref(value) {
  if (typeof value !== 'string' || !value || value.length > 2048) return false;
  // Whitespace/control characters are how "java\tscript:" style bypasses get through naive checks.
  // eslint-disable-next-line no-control-regex -- matching control characters is the point
  if (/[\u0000- \u007f]/.test(value)) return false;
  if (value.startsWith('#') || (value.startsWith('/') && !value.startsWith('//'))) return true;
  try {
    return SAFE_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

// Media may only come from http(s) or this site.
export function isSafeSrc(value) {
  return isSafeHref(value) && (value.startsWith('/') || /^https?:/i.test(value));
}
