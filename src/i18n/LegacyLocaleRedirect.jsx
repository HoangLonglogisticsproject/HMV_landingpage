import { useLayoutEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SUPPORTED_LANGS, useLanguage } from '@/i18n/LanguageContext';

// /blog/<slug> passes through: ArticlePage resolves the slug (static: VI → EN canonical, unknown → /insights;
// CMS: localized slug via alternates).
const cleanTarget = rest => rest.replace(/\/$/, '') || '/';

/**
 * Handles legacy locale-prefixed URLs (/en/..., /vi/...) client-side.
 * On Vercel these are already 301'd by vercel.json; this is the safety net for
 * `vite preview`, local dev, and any other host.
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
  return <Navigate to={`${cleanTarget(match[2] ?? '')}${search}${hash}`} replace />;
}
