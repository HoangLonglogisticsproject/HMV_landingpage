import { MapPin } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { address } from '@/data/hmv';

// The chrome of the pages outside SiteShell: the page-scoped cassava pages (views/products/CassavaScoped) and the
// Korean market page (views/tapioca-market). The site navigation and footer link to pages in English and Vietnamese
// only, so this header links to sections of its page, to the page in its other languages when it has any (the site's
// language menu), and to one action (children).

/**
 * `nav`: { label, items: [[sectionId, label]] }; `languages`: the language menu (ScopedLanguages), or none for a page
 * in one language only.
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
          {languages}
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
