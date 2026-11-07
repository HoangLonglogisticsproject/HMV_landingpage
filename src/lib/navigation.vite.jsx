// Navigation adapter, Vite (React Router) implementation, selected by the alias in vite.config.js.
// URLs stay locale-free here: links are not localized and switching language is a re-render.
// Delete at cleanup (docs/architecture/MIGRATION_ROADMAP.md, PR-12).
import { Link, useLocation, useSearchParams as useRouterSearchParams } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

export { Link };

export const useRoutePath = () => useLocation().pathname;

export const useSearchParams = () => useRouterSearchParams()[0];

export function useLanguageSwitch() {
  const { lang, setLang } = useLanguage();
  return { lang, hrefFor: () => undefined, select: setLang };
}
