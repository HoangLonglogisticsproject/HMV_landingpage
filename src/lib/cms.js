// Client for the HMV CMS public API (docs/cms-integration.md), shared by every CMS-backed feature.
// Same-origin path: the dev/preview server proxies it (vite.config.js); production needs a host rewrite.
// Plain .js with no aliases or import.meta so `node --test` can load it.

const BASE = '/api/v1/public';

export async function getJson(path, params, signal) {
  const res = await fetch(`${BASE}${path}?${new URLSearchParams(params)}`, {
    // Public content needs no identity: never send the admin session cookie (localhost cookies ignore the port).
    credentials: 'omit',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw Object.assign(new Error(`CMS ${res.status} for ${path}`), { status: res.status });
  return res.json();
}

export const malformed = () => Object.assign(new Error('Malformed CMS response'), { status: 0 });
