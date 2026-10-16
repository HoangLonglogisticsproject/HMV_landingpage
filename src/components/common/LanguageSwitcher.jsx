import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';
import gbFlag from 'flag-icons/flags/4x3/gb.svg';
import vnFlag from 'flag-icons/flags/4x3/vn.svg';

export const LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    shortLabel: 'EN',
    flag: gbFlag,
    flagAlt: 'Great Britain Flag',
  },
  {
    code: 'vi',
    label: 'Tiếng Việt',
    shortLabel: 'VI',
    flag: vnFlag,
    flagAlt: 'Vietnam Flag',
  },
];

export function LanguageSwitcher({ currentLang, onSelect, className = '' }) {
  const { lang, setLang } = useLanguage();

  const activeCode = currentLang || lang;
  const activeLang = LANGUAGES.find((l) => l.code === activeCode) || LANGUAGES[0];

  // URLs are locale-free, so switching language is a pure re-render: no navigation,
  // no scroll handling, the current URL stays exactly as it is.
  const handleSelectLanguage = (targetCode) => {
    if (targetCode !== activeCode) setLang(targetCode);
    if (onSelect) onSelect();
  };

  return (
    <div className={`hmv-lang-switcher ${className}`}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hmv-lang-trigger"
            aria-label={activeCode === 'vi' ? 'Chọn ngôn ngữ (hiện tại: Tiếng Việt)' : 'Select language (current: English)'}
          >
            <div className="hmv-lang-trigger-content">
              <img
                src={activeLang.flag}
                alt=""
                aria-hidden="true"
                className="hmv-flag-icon"
                width="21"
                height="15"
                loading="eager"
                decoding="async"
              />
              <span className="hmv-lang-name">{activeLang.label}</span>
            </div>
            <ChevronDown className="hmv-lang-chevron" aria-hidden="true" size={15} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={8}
          avoidCollisions={true}
          className="hmv-lang-menu-content"
          role="menu"
          aria-label={activeCode === 'vi' ? 'Danh sách ngôn ngữ' : 'Language options'}
        >
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === activeCode;
            return (
              <DropdownMenuItem
                key={lang.code}
                onSelect={() => handleSelectLanguage(lang.code)}
                className={`hmv-lang-menu-item ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                role="menuitem"
              >
                <div className="hmv-lang-item-left">
                  <img
                    src={lang.flag}
                    alt=""
                    aria-hidden="true"
                    className="hmv-flag-icon"
                    width="21"
                    height="15"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{lang.label}</span>
                </div>
                {isActive ? (
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    className="hmv-lang-check"
                    style={{ color: '#087EC2' }}
                    aria-hidden="true"
                  />
                ) : (
                  <span className="hmv-lang-check-placeholder" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
