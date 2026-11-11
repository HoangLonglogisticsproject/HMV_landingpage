// Whether this deployment may be indexed: the X-Robots-Tag header (next.config.ts) and the robots metadata
// (src/next/seo.ts) both follow it. Server/build-time only: plain JavaScript without imports, so next.config.ts can
// load it as-is, and in the `next` layer (scripts/check-boundaries.js), so no shared or client code can import it.
// The variables are not NEXT_PUBLIC_, so a client bundle would see them unset, which means noindex.
//
// 1. SITE_INDEXABLE=true or false, set explicitly, wins.
// 2. Otherwise only a Vercel production deployment is indexable (VERCEL_TARGET_ENV, else VERCEL_ENV).
// 3. Previews, local and test builds stay noindex (fail-safe).

/** @param {Record<string, string | undefined>} env The environment, `process.env` in the callers. */
export function isSiteIndexable(env) {
  if (env.SITE_INDEXABLE === 'true') return true;
  if (env.SITE_INDEXABLE === 'false') return false;
  return (env.VERCEL_TARGET_ENV ?? env.VERCEL_ENV) === 'production';
}
