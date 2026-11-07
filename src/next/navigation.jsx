'use client';
// Navigation port `@/lib/navigation`, Next.js implementation (tsconfig.json `paths`). Shared components import the
// port, never this file; the Vite build maps the port to src/app/navigation.jsx (vite.config.js).
// Survives cleanup: components write English key paths and `Link` localizes them to the page's locale.
// MIGRATION-ONLY: the `useSearchParams` re-export; after cleanup, import it from next/navigation directly.
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';
import { delocalizePath, localeOf, localizePath, switchHref } from '@/i18n/routes';

export function Link({ to, ...props }) {
  const locale = localeOf(usePathname());
  if (!to.startsWith('/') || to.startsWith('//')) return <NextLink href={to} {...props} />;
  const cut = to.search(/[?#]/);
  const [path, rest] = cut < 0 ? [to, ''] : [to.slice(0, cut), to.slice(cut)];
  return <NextLink href={localizePath(path || '/', locale) + rest} {...props} />;
}

/** The current page as an English key path, for active-link checks. */
export const useRoutePath = () => delocalizePath(usePathname()).path;

export const useSearchParams = useNextSearchParams;

/** Back to the previous page, or to the home page when there is none (the page was opened directly). */
export function useGoBack() {
  const router = useRouter();
  const home = localizePath('/', localeOf(usePathname()));
  return () => (window.history.length > 1 ? router.back() : router.push(home));
}

/** Language links: real URLs (`hrefFor`); `select` keeps the query and #hash the server cannot see. */
export function useLanguageSwitch() {
  const pathname = usePathname();
  return {
    lang: localeOf(pathname),
    hrefFor: locale => switchHref(pathname, '', locale),
    select: locale =>
      window.location.assign(switchHref(window.location.pathname, window.location.search, locale) + window.location.hash),
  };
}
