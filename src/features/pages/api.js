// Website pages from the CMS public pages API (CMS_HMV docs/api/public-content-contract.md, "Pages").
// Plain .js with relative imports so `node --test` can load it.
import { getJson, malformed } from '../../lib/cms.js';

/** `{ status: 'ready', page }` or `{ status: 'not-found' }` (unknown page, or not published in this locale). */
export async function fetchPage({ key, locale, signal }) {
  let p;
  try {
    p = await getJson(`/pages/${encodeURIComponent(key)}`, { locale }, signal);
  } catch (e) {
    if (e.status === 404) return { status: 'not-found' };
    throw e;
  }
  if (typeof p?.title !== 'string' || !p.content || typeof p.content !== 'object') throw malformed();
  return {
    status: 'ready',
    page: { content: p.content, seo: { title: p.seo?.title || p.title, description: p.seo?.description ?? '' } },
  };
}
