import { BrandLogo } from '@/components/common/BrandLogo';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  Headphones,
  Sprout,
  Wind,
  Truck,
  PackageCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy, products } from '@/data/hmv';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export function Navigation({ lang = 'en' }) {
  const t = copy[lang];
  const vi = lang === 'vi';
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState(null);
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const [dgOpen, setDgOpen] = useState(false);
  const [cbOpen, setCbOpen] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);
  const [overseaOpen, setOverseaOpen] = useState(false);
  const [farmingOpen, setFarmingOpen] = useState(false);
  const [windOpen, setWindOpen] = useState(false);
  const { pathname } = useLocation();

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
                  className={
                    pathname.startsWith('/supply-chain') ||
                    pathname.startsWith('/products') ||
                    pathname.startsWith('/logistics') ||
                    pathname.startsWith('/packaging-logistics')
                      ? 'nav-active'
                      : ''
                  }
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

              {drop === 'supply-chain' && (
                <div
                  className="dropdown-panel logistics-text-dropdown"
                  role="menu"
                >
                  {/* 1. Farming & Export Commodities */}
                  <div className="log-text-group">
                    <div
                      className={`log-text-parent-row ${farmingOpen ? 'is-active-dropdown' : ''}`}
                    >
                      <Link
                        to="/supply-chain#commodities"
                        onClick={close}
                        className="log-parent-title"
                      >
                        {vi
                          ? 'Nông nghiệp & Nông sản xuất khẩu'
                          : 'Farming & Export Commodities'}
                      </Link>
                      <button
                        type="button"
                        className={`log-parent-toggle ${farmingOpen ? 'is-open' : ''}`}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFarmingOpen(!farmingOpen);
                        }}
                        aria-label="Toggle Farming Commodities menu"
                        aria-expanded={farmingOpen}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {farmingOpen && (
                      <div className="log-text-sublist">
                        {products.map(p => (
                          <Link
                            key={p.id}
                            to={`/products/${p.id}`}
                            onClick={close}
                          >
                            {p[lang]}
                          </Link>
                        ))}
                        <Link
                          to="/supply-chain#commodities"
                          onClick={close}
                          style={{
                            fontWeight: 600,
                            color: 'var(--brand, #00297b)',
                            marginTop: '4px',
                          }}
                        >
                          {vi
                            ? 'Tất cả sản phẩm & quy cách'
                            : 'All products & specifications'}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* 2. Wind Energy & Clean Horizons */}
                  <div className="log-text-group">
                    <div
                      className={`log-text-parent-row ${windOpen ? 'is-active-dropdown' : ''}`}
                    >
                      <Link
                        to="/supply-chain#wind-energy"
                        onClick={close}
                        className="log-parent-title"
                      >
                        {vi
                          ? 'Dự án & Năng lượng điện gió'
                          : 'Wind Energy & Clean Horizons'}
                      </Link>
                      <button
                        type="button"
                        className={`log-parent-toggle ${windOpen ? 'is-open' : ''}`}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWindOpen(!windOpen);
                        }}
                        aria-label="Toggle Wind Energy menu"
                        aria-expanded={windOpen}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {windOpen && (
                      <div className="log-text-sublist">
                        <Link to="/supply-chain#wind-energy" onClick={close}>
                          {vi
                            ? 'Dự án điện gió trên bờ & ngoài khơi'
                            : 'Onshore & Offshore Wind Projects'}
                        </Link>
                        <Link to="/supply-chain#wind-energy" onClick={close}>
                          {vi
                            ? 'Chuỗi vật tư & cấu kiện tuabin'
                            : 'Turbine & Infrastructure Supply Chain'}
                        </Link>
                        <Link to="/supply-chain#wind-energy" onClick={close}>
                          {vi
                            ? 'Chuyển đổi xanh & Tiêu chuẩn CBAM'
                            : 'Green Transition & Net Zero Goals'}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* 3. Logistics (Dropdown parent containing the 4 services) */}
                  <div className="log-text-group">
                    <div
                      className={`log-text-parent-row ${logisticsOpen ? 'is-active-dropdown' : ''}`}
                    >
                      <Link
                        to="/logistics"
                        onClick={close}
                        className="log-parent-title"
                      >
                        Logistics
                      </Link>
                      <button
                        type="button"
                        className={`log-parent-toggle ${logisticsOpen ? 'is-open' : ''}`}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLogisticsOpen(!logisticsOpen);
                        }}
                        aria-label="Toggle Logistics menu"
                        aria-expanded={logisticsOpen}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {logisticsOpen && (
                      <div
                        className="log-text-sublist"
                        style={{ paddingLeft: '12px' }}
                      >
                        {/* 3.1 Specializing for Dangerous goods handling */}
                        <div className="log-text-group">
                          <div
                            className={`log-text-parent-row ${dgOpen ? 'is-active-dropdown' : ''}`}
                          >
                            <Link
                              to="/logistics#dangerous-goods"
                              onClick={close}
                              className="log-parent-title"
                              style={{ fontSize: '13px' }}
                            >
                              Specializing for Dangerous goods handling
                            </Link>
                            <button
                              type="button"
                              className={`log-parent-toggle ${dgOpen ? 'is-open' : ''}`}
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDgOpen(!dgOpen);
                              }}
                              aria-label="Toggle Dangerous Goods menu"
                              aria-expanded={dgOpen}
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>

                          {dgOpen && (
                            <div className="log-text-sublist">
                              <Link to="/logistics#dg-air-sea" onClick={close}>
                                Dangerous Goods by Air & Sea
                              </Link>
                              <Link
                                to="/logistics#special-cargoes"
                                onClick={close}
                              >
                                Special cargoes handling
                              </Link>
                              <Link
                                to="/logistics#general-cargoes"
                                onClick={close}
                              >
                                General Cargoes Handling
                              </Link>
                              <Link
                                to="/logistics#factory-tour"
                                onClick={close}
                              >
                                Factory Tour
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* 3.2 Crossed border Vietnam - Cambodia */}
                        <div className="log-text-group">
                          <div
                            className={`log-text-parent-row ${cbOpen ? 'is-active-dropdown' : ''}`}
                          >
                            <Link
                              to="/logistics#cross-border"
                              onClick={close}
                              className="log-parent-title"
                              style={{ fontSize: '13px' }}
                            >
                              Crossed border Vietnam - Cambodia
                            </Link>
                            <button
                              type="button"
                              className={`log-parent-toggle ${cbOpen ? 'is-open' : ''}`}
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCbOpen(!cbOpen);
                              }}
                              aria-label="Toggle Cross Border menu"
                              aria-expanded={cbOpen}
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>

                          {cbOpen && (
                            <div className="log-text-sublist">
                              <Link
                                to="/logistics#cross-border"
                                onClick={close}
                              >
                                {vi
                                  ? 'Vận tải container liên vận (VN ⇄ KH)'
                                  : 'Cross-border container drayage'}
                              </Link>
                              <Link
                                to="/logistics#cross-border"
                                onClick={close}
                              >
                                {vi
                                  ? 'Thông quan 2 đầu cửa khẩu (Mộc Bài, Xa Mát, Hoa Lư)'
                                  : 'Dual customs clearance (Moc Bai, Xa Mat, Hoa Lu)'}
                              </Link>
                              <Link
                                to="/logistics#cross-border"
                                onClick={close}
                              >
                                {vi
                                  ? 'Vận chuyển nhanh 12-24h (HCM ⇄ Phnom Penh)'
                                  : 'Express 12-24h transit (HCMC ⇄ Phnom Penh)'}
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* 3.3 Local agency handling in Vietnam */}
                        <div className="log-text-group">
                          <div
                            className={`log-text-parent-row ${localOpen ? 'is-active-dropdown' : ''}`}
                          >
                            <Link
                              to="/logistics#local-agency"
                              onClick={close}
                              className="log-parent-title"
                              style={{ fontSize: '13px' }}
                            >
                              Local agency handling in Vietnam
                            </Link>
                            <button
                              type="button"
                              className={`log-parent-toggle ${localOpen ? 'is-open' : ''}`}
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setLocalOpen(!localOpen);
                              }}
                              aria-label="Toggle Local Agency menu"
                              aria-expanded={localOpen}
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>

                          {localOpen && (
                            <div className="log-text-sublist">
                              <Link
                                to="/logistics#local-agency"
                                onClick={close}
                              >
                                {vi
                                  ? 'Đại lý hàng đến & Phát hành D/O'
                                  : 'Inbound consignee desk & D/O release'}
                              </Link>
                              <Link
                                to="/logistics#local-agency"
                                onClick={close}
                              >
                                {vi
                                  ? 'Khai thuê hải quan điện tử VNACCS'
                                  : 'VNACCS electronic customs brokerage'}
                              </Link>
                              <Link
                                to="/logistics#local-agency"
                                onClick={close}
                              >
                                {vi
                                  ? 'Vận tải nội địa bao phủ cảng HPH, DAD, SGN, VUT'
                                  : 'Inland drayage for HPH, DAD, SGN, VUT hubs'}
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* 3.4 Oversea agency networking ( JC Trans Membership ) */}
                        <div className="log-text-group">
                          <div
                            className={`log-text-parent-row ${overseaOpen ? 'is-active-dropdown' : ''}`}
                          >
                            <Link
                              to="/logistics#oversea-agency"
                              onClick={close}
                              className="log-parent-title"
                              style={{ fontSize: '13px' }}
                            >
                              Oversea agency networking ( JC Trans Membership )
                            </Link>
                            <button
                              type="button"
                              className={`log-parent-toggle ${overseaOpen ? 'is-open' : ''}`}
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOverseaOpen(!overseaOpen);
                              }}
                              aria-label="Toggle Oversea Agency menu"
                              aria-expanded={overseaOpen}
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>

                          {overseaOpen && (
                            <div className="log-text-sublist">
                              <Link
                                to="/logistics#oversea-agency"
                                onClick={close}
                              >
                                {vi
                                  ? 'Bảo chứng tài chính quốc tế (GCP Protection)'
                                  : 'JC Trans GCP financial protection fund'}
                              </Link>
                              <Link
                                to="/logistics#oversea-agency"
                                onClick={close}
                              >
                                {vi
                                  ? 'Dịch vụ DDP, DAP, Ex-Works toàn cầu'
                                  : 'Global DDP, DAP & Ex-Works door delivery'}
                              </Link>
                              <Link
                                to="/logistics#oversea-agency"
                                onClick={close}
                              >
                                {vi
                                  ? 'Mạng lưới 10,000+ đại lý tại 160+ quốc gia'
                                  : '10,000+ partner forwarders across 160+ countries'}
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Tổng quan Chuỗi cung ứng */}
                  <div className="log-text-group">
                    <div className="log-text-parent-row">
                      <Link
                        to="/supply-chain"
                        onClick={close}
                        className="log-parent-title"
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '10px',
                        }}
                      >
                        {vi
                          ? 'Tổng quan chuỗi cung ứng HMV'
                          : 'HMV Supply Chain Overview'}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. EcoNews */}
            <Link
              className={
                pathname.startsWith('/insights') || pathname.startsWith('/blog')
                  ? 'nav-active'
                  : ''
              }
              to="/insights"
              onClick={close}
            >
              EcoNews
            </Link>

            {/* 4. Về HMV / About Us (Dropdown) */}
            <div
              className="nav-dropdown"
              onMouseEnter={() => setDrop('about')}
              onMouseLeave={() => setDrop(null)}
            >
              <div className="nav-group">
                <Link
                  className={
                    pathname.startsWith('/about') ||
                    pathname.startsWith('/activities')
                      ? 'nav-active'
                      : ''
                  }
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

          {/* RIGHT: ACTIONS (Language Switcher & 24/7 Support) */}
          <div className="nav-right">
            <LanguageSwitcher currentLang={lang} onSelect={close} />

            <Button
              variant="brand"
              className="nav-support-btn"
              onClick={() => {
                close();
                window.dispatchEvent(new CustomEvent('open-hmv-support-chat'));
              }}
              title={
                vi
                  ? 'Mở cổng Hỗ trợ trực tuyến 24/7'
                  : 'Open 24/7 Online Support Chat'
              }
              type="button"
            >
              <span className="live-status-dot" aria-hidden="true" />
              <Headphones size={15} />
              <span>{vi ? 'Hỗ trợ 24/7' : '24/7 Support'}</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
