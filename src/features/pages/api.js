// Website pages from the CMS public pages API (CMS_HMV docs/api/public-content-contract.md, "Pages").
// Plain .js with relative imports so `node --test` can load it.
import { malformed } from '../../lib/cms.js';

/** `{ status: 'ready', page }` or `{ status: 'not-found' }` (unknown page, or not published in this locale).
 *  `get`: a CMS transport (lib/cms.js). */
export async function fetchPage(get, { key, locale }) {
  let p;
  try {
    p = await get(`/pages/${encodeURIComponent(key)}`, { locale });
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
