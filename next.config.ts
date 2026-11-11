import type { NextConfig } from 'next';
import { INDEX_ALIASES, LOCALES, canonicalUrl, localizePath } from './src/i18n/routes.js';
import { isSiteIndexable } from './src/next/indexability.js';

// Fail-safe: every response carries noindex unless the deployment is the public production site (Vercel production,
// or SITE_INDEXABLE=true); SITE_INDEXABLE=false keeps it noindex. The robots metadata follows the same decision.
const indexable = isSiteIndexable(process.env);

// Collection URLs without a page of their own, in every locale. Requests with ?lang= skip these: proxy.ts resolves
// them in one hop.
const INDEX_URLS = Object.keys(INDEX_ALIASES).flatMap(path => LOCALES.map(locale => localizePath(path, locale)));

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
