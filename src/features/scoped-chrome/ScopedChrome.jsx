import { MapPin } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { address } from '@/data/hmv';

// The chrome of the pages outside SiteShell: the page-scoped cassava pages (views/products/CassavaScoped) and the
// Korean market page (views/tapioca-market). The site navigation and footer link to pages in English and Vietnamese
// only, so this header links to sections of its page, to the page in its other languages when it has any, and to one
// action (children).

/**
 * `nav`: { label, items: [[sectionId, label]] }; `languages`: { label, items: [{ lang, label, href, current }] }.
 */
export function ScopedHeader({ nav, languages, children }) {
  return (
    <header className="site-nav scoped-nav">
      <div className="nav-inner">
        <div className="nav-left">
          <a href="/" hrefLang="en" className="wordmark" aria-label="HMV Global">
            <BrandLogo />
          </a>
        </div>
        <nav className="nav-center" aria-label={nav.label}>
          {nav.items.map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
        </nav>
        <div className="nav-right">
          {languages && (
            <ul className="scoped-langs" aria-label={languages.label}>
              {languages.items.map(({ lang, label, href, current }) => (
                <li key={lang}>
                  <a href={href} hrefLang={lang} lang={lang} aria-current={current ? 'page' : undefined}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {/* The wrapper sizes and hides the action: the shared .nav-support-btn rules are !important. */}
          <div className="scoped-nav-desk">{children}</div>
        </div>
      </div>
    </header>
  );
}

/** The headquarters address, after `addressLabel` (본사, 总部), and the copyright line. */
export function ScopedFooter({ addressLabel }) {
  return (
    <footer className="site-footer premium-footer scoped-footer">
      <div className="content-width">
        <p className="pf-row">
          <MapPin size={16} />
          {addressLabel} · {address}
        </p>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} HMV Global</span>
        </div>
      </div>
    </footer>
  );
}
