'use client';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { assetSrc } from '@/lib/utils';
import cnFlag from 'flag-icons/flags/4x3/cn.svg';
import gbFlag from 'flag-icons/flags/4x3/gb.svg';
import krFlag from 'flag-icons/flags/4x3/kr.svg';
import vnFlag from 'flag-icons/flags/4x3/vn.svg';

// The premium language menu: the current language (flag, self-name, chevron) opens the page in every language it has,
// the current one checked. Presentation only: the site header (LanguageSwitcher) and the page-scoped header
// (features/scoped-chrome) resolve the items. Flags are decorative; the language's name says which it is.
const FLAGS = { en: gbFlag, vi: vnFlag, 'zh-CN': cnFlag, ko: krFlag };
// The accessible names of the trigger and of the list, in the current language.
const NAMES = {
  en: [name => `Select language, current: ${name}`, 'Language options'],
  vi: [name => `Chọn ngôn ngữ, hiện tại: ${name}`, 'Danh sách ngôn ngữ'],
  'zh-CN': [name => `选择语言，当前：${name}`, '语言选项'],
  ko: [name => `언어 선택, 현재: ${name}`, '언어 목록'],
};

function Flag({ code, loading }) {
  return (
    <img
      src={assetSrc(FLAGS[code])}
      alt=""
      aria-hidden="true"
      className="hmv-flag-icon"
      width="21"
      height="15"
      loading={loading}
      fetchPriority={loading === 'eager' ? 'low' : undefined}
      decoding="async"
    />
  );
}

/**
 * `items`: [{ code, label, href, current }], in display order; the current one is the trigger. An item without `href`
 * is a menu action (Vite: URLs carry no locale). `onSelect(code)`: handles the choice instead of the link (the site
 * header keeps the query and #hash); without it, a link is followed as it is. `menuClassName` sizes the list.
 */
export function PremiumLanguageMenu({ items, onSelect, className = '', menuClassName = '' }) {
  const current = items.find(item => item.current) ?? items[0];
  const [triggerLabel, menuLabel] = NAMES[current.code] ?? NAMES.en;

  return (
    <div className={`hmv-lang-switcher ${className}`}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button type="button" className="hmv-lang-trigger" aria-label={triggerLabel(current.label)}>
            <span className="hmv-lang-trigger-content">
              <Flag code={current.code} loading="eager" />
              <span className="hmv-lang-name">{current.label}</span>
            </span>
            <ChevronDown className="hmv-lang-chevron" aria-hidden="true" size={15} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={8}
          className={`hmv-lang-menu-content ${menuClassName}`}
          aria-label={menuLabel}
        >
          {items.map(({ code, label, href, current: active }) => {
            const content = (
              <>
                <span className="hmv-lang-item-left">
                  <Flag code={code} loading="lazy" />
                  <span className="hmv-lang-item-label">{label}</span>
                </span>
                {active ? (
                  <Check size={16} strokeWidth={2.5} className="hmv-lang-check" aria-hidden="true" />
                ) : (
                  <span className="hmv-lang-check-placeholder" aria-hidden="true" />
                )}
              </>
            );
            return (
              <DropdownMenuItem
                key={code}
                asChild={Boolean(href)}
                onSelect={href ? undefined : () => onSelect?.(code)}
                className={`hmv-lang-menu-item ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {href ? (
                  <a
                    href={href}
                    hrefLang={code}
                    lang={code}
                    onClick={
                      onSelect &&
                      (event => {
                        event.preventDefault();
                        onSelect(code);
                      })
                    }
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
