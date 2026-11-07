import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { CMS_TAG } from '@/next/cms';

// Operator endpoint for takedowns and urgent updates (architecture §9.3): expires every cached CMS response, so the
// next request of each page, list and the sitemap refetches from the CMS. POST with the header
// `x-revalidate-secret`; refused when REVALIDATE_SECRET is unset. Neither secret is ever logged or echoed.
function authorized(given: string | null) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !given) return false;
  const [a, b] = [Buffer.from(given), Buffer.from(secret)];
  return a.length === b.length && timingSafeEqual(a, b);
}

export function POST(request: Request) {
  if (!authorized(request.headers.get('x-revalidate-secret'))) return Response.json({ error: 'unauthorized' }, { status: 401 });
  revalidateTag(CMS_TAG, { expire: 0 });
  return Response.json({ revalidated: [CMS_TAG] });
}
