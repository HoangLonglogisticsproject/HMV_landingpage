import type { MetadataRoute } from 'next';
import { baseUrl } from '@/data/hmv';

// The same in every environment (SEO spec §7.6): robots.txt is not the indexing control. Previews stay out of the
// index through noindex headers and meta tags and Vercel Authentication; AI crawlers are allowed, as today (D-15).
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${baseUrl}/sitemap.xml` };
}
