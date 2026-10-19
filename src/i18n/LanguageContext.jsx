import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export const SUPPORTED_LANGS = ['en', 'vi'];
export const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'hmv_lang';

function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGS.includes(stored) ? stored : null;
  } catch {
    // localStorage can be blocked (private mode, strict cookie settings)
    return null;
  }
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => readStoredLang() ?? DEFAULT_LANG);

  const setLang = useCallback(next => {
    if (!SUPPORTED_LANGS.includes(next)) return;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore if localStorage is restricted
    }
    setLangState(next);
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

export function useLang() {
  return useLanguage().lang;
}
