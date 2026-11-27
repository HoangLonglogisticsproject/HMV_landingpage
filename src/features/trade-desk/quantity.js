// The quantity a buyer types, as text: what the inquiry accepts and keeps exactly as written. HMV never converts it: "2,000"
// and "2.000" are the buyer's own, English and Vietnamese, and a person reads them in the inquiry. This only refuses what
// is no number: 1..5, 2,,5, 50., 50, and 1 2, a stray space.
//
// Accepted: digits (50, 5000), a decimal (0.5, 0,5), digits in groups of three after a first group of one to three
// (2,000 · 1.234.567 · 1 234), and groups with a different decimal mark after them (1,234.5 · 1.234,5). A number needs a
// non-zero digit: no quantity is none.
const MARK = /[.,\s]/;
const SHAPE = /^[\d.,\s]+$/;

/** Groups of exactly three digits after the first, which has one to three. */
const grouped = parts => parts[0].length <= 3 && parts.slice(1).every(part => part.length === 3);

/** Digits and marks only, starting and ending with a digit, no two marks in a row, a non-zero digit somewhere. */
const wellFormed = v => SHAPE.test(v) && /\d/.test(v[0]) && /\d/.test(v.at(-1)) && !/[.,\s]{2}/.test(v) && /[1-9]/.test(v);

/** @param {unknown} value */
export function isQuantityText(value) {
  const v = typeof value === 'string' ? value.trim().replaceAll(/\s/g, ' ') : '';
  if (!wellFormed(v)) return false;
  const marks = v.match(/[.,\s]/g) ?? [];
  if (marks.length === 0) return true;
  const last = marks.at(-1);
  // One mark: a decimal or a group mark when it is . or ,; a space only groups.
  if (marks.length === 1) return last !== ' ' || grouped(v.split(MARK));
  const groupMarks = new Set(marks.slice(0, -1));
  if (groupMarks.size > 1) return false;
  const [group] = groupMarks;
  // The same mark throughout groups (1.234.567); a different last mark is the decimal one (1,234.5).
  if (last === group) return grouped(v.split(MARK));
  return last !== ' ' && grouped(v.split(MARK).slice(0, -1));
}
