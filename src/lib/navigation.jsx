'use client';
// Navigation adapter, Next.js implementation. Shared components import `@/lib/navigation` only; the Vite build
// aliases it to navigation.vite.jsx (vite.config.js) until cutover. Same API in both: `<Link to>` with the English
// key path, which this implementation localizes to the current page's locale.
import NextLink from 'next/link';
import { usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';
import { delocalizePath, localeOf, localizePath, switchHref } from '@/i18n/routes';

export function Link({ to, ...props }) {
  const locale = localeOf(usePathname());
  const internal = to.startsWith('/') && !to.startsWith('//');
  const [, path, rest] = to.match(/^([^?#]*)(.*)$/);
  return <NextLink href={internal ? localizePath(path || '/', locale) + rest : to} {...props} />;
}

/** The current page as an English key path, for active-link checks. */
export const useRoutePath = () => delocalizePath(usePathname()).path;

export const useSearchParams = useNextSearchParams;

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
