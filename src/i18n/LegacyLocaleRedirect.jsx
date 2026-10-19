import { useLayoutEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SUPPORTED_LANGS, useLanguage } from '@/i18n/LanguageContext';
import { articleSlug, findArticle } from '@/data/articles';

function cleanTarget(rest) {
  const target = rest.replace(/\/$/, '') || '/';
  // Legacy Vietnamese blog slugs map onto the canonical slug
  const blogMatch = target.match(/^\/blog\/([^/?#]+)$/);
  if (!blogMatch) return target;
  const article = findArticle(blogMatch[1]);
  return article ? `/blog/${articleSlug(article)}` : '/insights';
}

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
