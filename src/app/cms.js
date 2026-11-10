// CMS transport (src/lib/cms.js) for the Vite app: browser fetch of a same-origin path, which the dev/preview server
// proxies (vite.config.js); production would need a host rewrite.
// MIGRATION-ONLY: Next.js fetches the CMS on the server (CMS PR); delete at cleanup.
import { cmsError, cmsUrl } from '../lib/cms.js';

/** The browser transport, aborted by `signal`. */
export const browserCms = signal => async (path, params) => {
  const res = await fetch(cmsUrl(path, params), {
    // Public content needs no identity: never send the admin session cookie (localhost cookies ignore the port).
    credentials: 'omit',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw cmsError(res.status, `CMS ${res.status} for ${path}`);
  return res.json();
};
