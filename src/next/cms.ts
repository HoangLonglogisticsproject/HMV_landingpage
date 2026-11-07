import 'server-only';
import { cmsError, cmsUrl, malformed } from '@/lib/cms';

// CMS transport (contract: src/lib/cms.js) for server rendering. It owns everything the mappers must not know:
// - the origin, from the server environment (CMS_API_ORIGIN never reaches a client bundle);
// - caching: the Next.js data cache keeps each 200 response for REVALIDATE_SECONDS under CMS_TAG, which
//   /api/revalidate expires on demand;
// - `Cache-Control: no-cache` on the request, so an HTTP cache in front of the CMS revalidates with it instead of
//   serving the CMS's own `max-age=60, stale-while-revalidate=300` copy after a takedown;
// - a timeout, and errors normalized to `{ status }`: the HTTP status, 503 unreachable, 504 timeout, 0 malformed.
// Nothing is logged: error messages carry the API path only.
export const CMS_TAG = 'cms';
const REVALIDATE_SECONDS = 300;
const TIMEOUT_MS = 8_000;

export async function cmsGet(path: string, params: Record<string, string | number>) {
  const origin = process.env.CMS_API_ORIGIN;
  if (!origin) throw cmsError(503, 'CMS_API_ORIGIN is not set');
  let res: Response;
  try {
    res = await fetch(new URL(cmsUrl(path, params), origin), {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      next: { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    throw cmsError(e instanceof Error && e.name === 'TimeoutError' ? 504 : 503, `CMS unreachable for ${path}`);
  }
  if (!res.ok) throw cmsError(res.status, `CMS ${res.status} for ${path}`);
  try {
    return await res.json();
  } catch {
    throw malformed();
  }
}
