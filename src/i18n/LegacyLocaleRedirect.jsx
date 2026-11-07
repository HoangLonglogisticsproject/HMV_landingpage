import { useLayoutEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SUPPORTED_LANGS, useLanguage } from '@/i18n/LanguageContext';
import { INDEX_ALIASES, delocalizePath } from '@/i18n/routes';

// /blog/<slug> passes through: ArticlePage resolves the slug (static: VI → EN canonical, unknown → /insights;
// CMS: localized slug via alternates).
const cleanTarget = path => path.replace(/\/$/, '') || '/';

/**
 * Handles locale-prefixed URLs (/en/..., /vi/...) client-side: sets the language, then goes to the locale-free URL.
 * Production returns this SPA shell (HTTP 200) for them; there is no server-side redirect (vercel.json has none).
 * It also maps the Next.js Vietnamese URLs (/vi/san-pham/<slug>, /vi/tin-tuc/<slug>) through the shared route
 * contract, so a rollback to this build keeps them working (MIGRATION_ROADMAP.md, rollback contract).
 * MIGRATION-ONLY: the rollback target needs it until cutover is final; deleted with the Vite app (PR-12).
 */
export function LegacyLocaleRedirect() {
  const { pathname, search, hash } = useLocation();
  const { setLang } = useLanguage();

  const match = pathname.match(/^\/(en|vi)(\/.*)?$/);
  const legacyLang = match?.[1];

  // Runs before the <Navigate> effect commits, so no flash of the wrong language
  useLayoutEffect(() => {
    if (SUPPORTED_LANGS.includes(legacyLang)) setLang(legacyLang);
  }, [legacyLang, setLang]);

  if (!match) return <Navigate to="/" replace />;
  const { path } = delocalizePath(cleanTarget(pathname));
  return <Navigate to={`${INDEX_ALIASES[path] ?? path}${search}${hash}`} replace />;
}
