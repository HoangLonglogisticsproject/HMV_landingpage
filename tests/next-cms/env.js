// Settings shared by the CMS-mode server (serve.js) and its tests. Test-only values, not real secrets.
import os from 'node:os';
import path from 'node:path';

export const MOCK_PORT = 4400;
export const NEXT_PORT = 4176;
export const REVALIDATE_SECRET = 'test-only-revalidate-secret-7f3a';
// next build and next start output, checked for leaked secrets.
export const SERVER_LOG = path.join(os.tmpdir(), 'hmv-next-cms-server.log');

// Merged over the process environment by serve.js, so a config's webServer.env (CMS_REVALIDATE_SECONDS, SITE_INDEXABLE)
// reaches both next build and next start.
export const CMS_ENV = {
  CMS_CONTENT: 'true',
  CMS_API_ORIGIN: `http://localhost:${MOCK_PORT}`,
  REVALIDATE_SECRET,
  // Both translations of one article (tests/next-cms/mock-cms.js).
  CMS_BLOCKED_SLUGS: 'cms-blocked, cms-bi-chan',
};
