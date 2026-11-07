import type { NextConfig } from 'next';
import { canonicalUrl } from './src/i18n/routes.js';

// Fail-safe: every response carries noindex unless the deployment is explicitly the public production site.
// Set SITE_INDEXABLE=true on the production environment only, at cutover (docs/architecture/MIGRATION_ROADMAP.md).
const indexable = process.env.SITE_INDEXABLE === 'true';

// Collection URLs without a page of their own. Requests with ?lang= skip these: proxy.ts resolves them in one hop.
const INDEX_URLS = ['/products', '/blog', '/vi/san-pham', '/vi/tin-tuc'];

const nextConfig: NextConfig = {
  // `next dev` would otherwise write its agent instructions into AGENTS.md, which the team owns.
  agentRules: false,
  // app/global-not-found.tsx: the server-rendered 404 for URLs without a route (two root layouts, no shared one).
  experimental: { globalNotFound: true },
  async headers() {
    return indexable ? [] : [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
  async redirects() {
    return INDEX_URLS.map(source => ({
      source,
      destination: canonicalUrl(source),
      permanent: true,
      missing: [{ type: 'query' as const, key: 'lang' }],
    }));
  },
};

export default nextConfig;
