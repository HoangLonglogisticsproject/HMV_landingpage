import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteShell } from '@/components/layout/SiteShell';
import { useLang } from '@/i18n/LanguageContext';

// Layout route for the standard pages: site chrome, plus scroll to the #hash
// target (or the top) whenever the path or hash changes.
export function SiteLayout() {
  const lang = useLang();
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView({ behavior: 'auto' }),
      );
    } else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return (
    <SiteShell lang={lang}>
      <Outlet />
    </SiteShell>
  );
}
