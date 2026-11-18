'use client';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useState, useEffect } from 'react';
import { Link, useRoutePath } from '@/lib/navigation';
import {
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy } from '@/data/hmv';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { SupplyChainMenu } from '@/components/layout/SupplyChainMenu';
import { openTradeDesk } from '@/features/trade-desk/open';
import { regulationCopy } from '@/data/regulations';

// 'nav-active' when the page is in one of the sections.
const activeIn = (pathname, ...sections) => (sections.some(s => pathname.startsWith(s)) ? 'nav-active' : '');

export function Navigation({ lang = 'en' }) {
  const t = copy[lang];
  const vi = lang === 'vi';
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState(/** @type {'supply-chain' | 'about' | null} */ (null));
  // Which supply chain menu groups are open; kept here so they reopen as the visitor left them.
  const [groups, setGroups] = useState({});
  const toggleGroup = key => setGroups(g => ({ ...g, [key]: !g[key] }));
  const pathname = useRoutePath();

  const close = () => {
    setMenu(false);
    setDrop(null);
  };

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') setDrop(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const aboutLinks = [
    { path: 'about', label: t.storyLabel },
    { path: 'activities', label: t.activities },
  ];

  return (
    <nav
      className="site-nav"
      aria-label={vi ? 'Điều hướng chính' : 'Main navigation'}
    >
      <div className="nav-inner">
        {/* LEFT: BRAND LOGO */}
        <div className="nav-left">
          <Link
            to="/"
            className="wordmark"
            onClick={close}
            aria-label="HMV Global home"
          >
            <BrandLogo />
          </Link>
        </div>

        {/* MOBILE TOGGLE (hidden on desktop) */}
        <Button
          className="mobile-toggle"
          variant="ghost"
          size="icon"
          aria-label={menu ? 'Close navigation' : t.menu}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </Button>

        {/* MAIN NAVIGATION WRAPPER (Centered on desktop, drawer on mobile) */}
        <div className={`nav-links-wrap ${menu ? 'nav-open' : ''}`}>
          {/* CENTER: CORE MENU LINKS */}
          <div className="nav-center">
            {/* 1. Trang chủ */}
            <Link
              className={pathname === '/' ? 'nav-active' : ''}
              aria-current={pathname === '/' ? 'page' : undefined}
              to="/"
              onClick={close}
            >
              {t.home}
            </Link>

            {/* 2. Chuỗi cung ứng (Mega dropdown containing Products, Wind Energy, and Logistics Solutions) */}
            <div
              className="nav-dropdown nav-dropdown-supply"
              onMouseEnter={() => setDrop('supply-chain')}
              onMouseLeave={() => setDrop(null)}
            >
              <div className="nav-group">
                <Link
                  className={activeIn(pathname, '/supply-chain', '/products', '/logistics', '/packaging-logistics')}
                  to="/supply-chain"
                  onClick={close}
                >
                  {t.supply}
                </Link>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`${t.supply} submenu`}
                  aria-expanded={drop === 'supply-chain'}
                  onClick={() =>
                    setDrop(drop === 'supply-chain' ? null : 'supply-chain')
                  }
                >
                  <ChevronDown />
                </Button>
              </div>

              {drop === 'supply-chain' && <SupplyChainMenu lang={lang} close={close} groups={groups} toggleGroup={toggleGroup} />}
            </div>

            {/* 4. EcoNews */}
            <Link
              className={activeIn(pathname, '/insights', '/blog')}
              to="/insights"
              onClick={close}
            >
              EcoNews
            </Link>

            {/* 5. Thông tư & Quy định */}
            <Link
              className={activeIn(pathname, '/regulations')}
              to="/regulations"
              onClick={close}
            >
              {regulationCopy[lang].nav}
            </Link>

            {/* 6. Về HMV / About Us (Dropdown) */}
            <div
              className="nav-dropdown"
              onMouseEnter={() => setDrop('about')}
              onMouseLeave={() => setDrop(null)}
            >
              <div className="nav-group">
                <Link
                  className={activeIn(pathname, '/about', '/activities')}
                  to="/about"
                  onClick={close}
                >
                  {t.about}
                </Link>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`${t.about} submenu`}
                  aria-expanded={drop === 'about'}
                  onClick={() => setDrop(drop === 'about' ? null : 'about')}
                >
                  <ChevronDown />
                </Button>
              </div>

              {drop === 'about' && (
                <div className="dropdown-panel">
                  {aboutLinks.map(l => (
                    <Link key={l.path} to={`/${l.path}`} onClick={close}>
                      {l.label}
                      <ArrowUpRight size={15} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ACTIONS (Language Switcher & HMV Trade Desk) */}
          <div className="nav-right">
            <LanguageSwitcher currentLang={lang} onSelect={close} />

            <Button
              variant="brand"
              className="nav-support-btn"
              onClick={() => {
                close();
                openTradeDesk({ source: 'nav' });
              }}
              title={
                vi
                  ? 'Gửi yêu cầu giao thương có cấu trúc tới HMV'
                  : 'Send HMV a structured trade inquiry'
              }
              type="button"
            >
              <ClipboardList size={15} />
              <span>HMV Trade Desk</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
