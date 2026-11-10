import { NextResponse, type NextRequest } from 'next/server';
import { legacyRedirect } from '@/i18n/routes';

// Legacy URL forms only (see `matcher`): one 308 to the final URL, with `lang` removed and other parameters kept.
// Every other request skips the proxy. Trailing slashes are handled earlier by Next.js (one extra hop).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const target = legacyRedirect(pathname, search);
  return target ? NextResponse.redirect(new URL(target, request.url), 308) : NextResponse.next();
}

export const config = {
  matcher: [
    { source: '/:path*', has: [{ type: 'query', key: 'lang' }] },
    '/en',
    '/en/:path*',
    '/index.html',
    '/vi/products/:path*',
    '/vi/blog/:path*',
  ],
};
