'use client';
import { PremiumLanguageMenu } from '@/components/layout/PremiumLanguageMenu';
import { useLanguageSwitch } from '@/lib/navigation';

// The site header's language menu: English and Vietnamese, plus the page's page-scoped locales (i18n/routes.js
// PAGE_LOCALES) on the pages that have them.
const LABELS = { en: 'English', vi: 'Tiếng Việt', 'zh-CN': '简体中文', ko: '한국어' };

export function LanguageSwitcher({ currentLang, onSelect, className = '' }) {
  const { lang, scoped, hrefFor, select } = useLanguageSwitch();
  const activeCode = currentLang || lang;
  const items = ['en', 'vi', ...scoped].map(code => ({ code, label: LABELS[code], href: hrefFor(code), current: code === activeCode }));

  // Vite: URLs are locale-free and switching is a re-render (no href). Next.js: each option is a real link to the
  // same page in that language; `select` adds the query and #hash, so the click is handled here.
  const handleSelect = code => {
    if (code !== activeCode) select(code);
    if (onSelect) onSelect();
  };

  return <PremiumLanguageMenu className={className} items={items} onSelect={handleSelect} />;
}
