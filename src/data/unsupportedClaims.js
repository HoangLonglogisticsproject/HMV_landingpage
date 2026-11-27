// Public claims HMV has no evidence for, as patterns, for the tests of the golden passion fruit pages (their copy, captions,
// image descriptions and metadata, and the rendered page). Each names the claim it guards, and matches the claim, not the
// vocabulary: a page may say what it does not offer ("no prices are published", "HMV does not ask Incoterms"). Many small
// patterns rather than a few long ones, each linear and readable.
//
// A grower's sign in a photograph that names USDA, EU Organic, JAS or GLOBALG.A.P. is not a certificate: the scheme names
// stay off these pages until the certificate holder, scope, validity and permission to publish are verified. A later
// controlled update then changes the pattern, with the evidence beside it.
export const UNSUPPORTED_CLAIMS = {
  'a certification scheme': [/\busda\b/i, /\bjas\b/i, /globalg/i, /eu organic/i, /fairtrade|rainforest alliance/i, /haccp|brcgs|fssc/i],
  'organic status': [/certified organic/i, /organic (certif|fruit|passion|farm)/i, /organic (cultivat|produc|grown|standard)/i, /\b(is|are) organic\b/i, /hữu cơ/i],
  'a certification held by HMV': [/certified (supplier|exporter|farm|orchard)/i, /\b(hmv|we) (is|are) (certified|accredited)/i],
  'a price': [/[$€£]\s?\d/, /\d\s?(usd|eur|vnd)\b/i, /\d\s?(\/|per)\s?kg\b/i],
  'a measured specification': [/\bbrix\s?:?\s?\d/i, /\d\s?°?\s?brix/i, /\bgrade [a-c1-3]\b/i, /\bsize \d/i, /\b\d+ ?[-–] ?\d+ ?(g|gram|grams|mm|cm)\b/i, /shelf life of \d/i],
  'a capacity or a minimum order': [/\bmoq\b/i, /minimum order (of|quantity)/i, /\d (mt|tons?|tonnes|containers) (per|a) (week|month|year) (capacity|supply)/i],
  'ownership of a farm or a facility': [/\b(our|hmv's|own) (own )?(farm|plantation|orchard|factory)/i, /\bhmv global's (farm|plantation|orchard|factory)/i],
  'customers or partners': [/trusted by/i, /our (customers|clients|partners) (include|such as)/i, /clients? (such as|like)/i, /testimonial/i, /đối tác của chúng tôi gồm/i],
  'an export or delivery guarantee': [/(?<!\b(?:no|not|without)\s)\bguarantee[sd]?\b/i, /đảm bảo (giao|xuất)/i, /cam kết (giao|xuất)/i],
};

/** The claims a text makes, by name; empty when none. */
export const claimsIn = text => Object.entries(UNSUPPORTED_CLAIMS).filter(([, patterns]) => patterns.some(pattern => pattern.test(text))).map(([name]) => name);
