import { randomInt } from 'node:crypto';

// Public inquiry reference, safe to show and quote: HMV-<year>-<6 characters>, without 0/O and 1/I.
// ponytail: random, ~1e9 combinations a year and no lookup; the delivery destination (CRM) enforces uniqueness if
// volume ever makes a collision plausible.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const createReference = (date = new Date(), rand = randomInt) =>
  `HMV-${date.getUTCFullYear()}-${Array.from({ length: 6 }, () => ALPHABET[rand(ALPHABET.length)]).join('')}`;
