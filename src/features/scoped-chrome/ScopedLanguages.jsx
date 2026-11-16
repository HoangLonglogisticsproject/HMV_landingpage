import { PremiumLanguageMenu } from '@/components/layout/PremiumLanguageMenu';

// The scoped header's language menu (ScopedHeader `languages`), for a page in several languages: its own module, so a
// page in one language (the Korean market page) ships no menu code.

/** `items`: [{ code, label, href, current }], the page in each of its languages. */
export function ScopedLanguages({ items }) {
  return (
    <>
      <PremiumLanguageMenu items={items} menuClassName="scoped-lang-menu" />
      {/* The same links in the server HTML: the menu renders its items only while it is open. */}
      <ul hidden>
        {items.map(({ code, label, href, current }) => (
          <li key={code}>
            <a href={href} hrefLang={code} lang={code} aria-current={current ? 'page' : undefined}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
