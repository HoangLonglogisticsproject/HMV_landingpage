import { useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGS, useLanguage } from '@/i18n/LanguageContext';

/**
 * Applies a `?lang=` query param then strips it from the URL.
 * URLs are locale-free, so this is the only way to share a link that opens in a
 * specific language: /about?lang=vi
 */
export function LangQueryBootstrap() {
  const { pathname, search, hash } = useLocation();
  const { setLang } = useLanguage();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const params = new URLSearchParams(search);
    const requested = params.get('lang');
    if (requested === null) return;

    if (SUPPORTED_LANGS.includes(requested)) setLang(requested);

    params.delete('lang');
    const rest = params.toString();
    navigate(`${pathname}${rest ? `?${rest}` : ''}${hash}`, { replace: true });
  }, [pathname, search, hash, setLang, navigate]);

  return null;
}
