// Navigation port `@/lib/navigation`, Vite (React Router) implementation, selected by the alias in vite.config.js.
// URLs stay locale-free here: links are not localized and switching language is a re-render.
// MIGRATION-ONLY: delete at cleanup (docs/architecture/MIGRATION_ROADMAP.md, PR-12).
import { Link, useLocation, useNavigate, useSearchParams as useRouterSearchParams } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

export { Link };

export const useRoutePath = () => useLocation().pathname;

export const useSearchParams = () => useRouterSearchParams()[0];

export function useGoBack() {
  const navigate = useNavigate();
  return () => (window.history.length > 1 ? navigate(-1) : navigate('/'));
}

export function useLanguageSwitch() {
  const { lang, setLang } = useLanguage();
  // No page-scoped locales: their pages are Next.js only.
  return { lang, scoped: [], hrefFor: () => undefined, select: setLang };
}
