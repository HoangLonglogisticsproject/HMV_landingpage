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
  Snowflake,
  FileCheck,
  Anchor,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy, products } from '@/data/hmv';

export function Navigation({ lang = 'en' }) {
  const t = copy[lang];
  const vi = lang === 'vi';
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState(null);
  const { pathname } = useLocation();

  const close = () => {
    setMenu(false);
    setDrop(null);
  };

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
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
    <nav className="site-nav" aria-label={vi ? 'Điều hướng chính' : 'Main navigation'}>
      <div className="nav-inner">
        {/* LEFT: BRAND LOGO */}
        <div className="nav-left">
          <Link to={`/${lang}`} className="wordmark" onClick={close} aria-label="HMV Global home">
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
              className={pathname === `/${lang}` ? 'nav-active' : ''}
              aria-current={pathname === `/${lang}` ? 'page' : undefined}
              to={`/${lang}`}
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
                  className={pathname.startsWith(`/${lang}/supply-chain`) || pathname.startsWith(`/${lang}/products`) ? 'nav-active' : ''}
                  to={`/${lang}/supply-chain`}
                  onClick={close}
                >
                  {t.supply}
                </Link>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`${t.supply} submenu`}
                  aria-expanded={drop === 'supply-chain'}
                  onClick={() => setDrop(drop === 'supply-chain' ? null : 'supply-chain')}
                >
                  <ChevronDown />
                </Button>
              </div>

              {drop === 'supply-chain' && (
                <div className="supply-mega-panel" role="region" aria-label={t.supply}>
                  {/* COLUMN 1: FARMING & EXPORT PRODUCTS (CORE PILLAR) */}
                  <div className="mega-col mega-col-farming">
                    <div className="mega-col-header">
                      <span className="mega-badge badge-green">
                        <Sprout size={11} />
                        {vi ? 'TRỌNG TÂM CHỦ LỰC' : 'CORE PILLAR'}
                      </span>
                      <h4>{vi ? 'Nông Nghiệp & Nông Sản Xuất Khẩu' : 'Farming & Export Commodities'}</h4>
                      <p className="mega-col-desc">
                        {vi
                          ? 'Nông sản chủ lực đạt chuẩn GlobalGAP, kiểm soát dư lượng MRLs cho thị trường EU & Hoa Kỳ.'
                          : 'Export-grade agricultural commodities meeting GlobalGAP & MRLs for EU & US.'}
                      </p>
                    </div>

                    <div className="mega-products-list">
                      {products.map((p) => (
                        <Link
                          key={p.id}
                          to={`/${lang}/products/${p.id}`}
                          onClick={close}
                          className="mega-product-item"
                        >
                          <span className="mega-product-dot" />
                          <div className="mega-product-text">
                            <strong>{p[lang]}</strong>
                            <span>{vi ? p.subVi.split(' · ')[0] : p.subEn.split(' · ')[0]}</span>
                          </div>
                          <ArrowUpRight size={13} className="mega-arrow" />
                        </Link>
                      ))}
                    </div>

                    <Link
                      to={`/${lang}/supply-chain#commodities`}
                      onClick={close}
                      className="mega-col-footer-link"
                    >
                      <span>{vi ? 'Xem tất cả sản phẩm & quy cách' : 'All products & specifications'}</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>

                  {/* COLUMN 2: WIND ENERGY & INFRASTRUCTURE (CORE PILLAR) */}
                  <div className="mega-col mega-col-wind">
                    <div className="mega-col-header">
                      <span className="mega-badge badge-cyan">
                        <Wind size={11} />
                        {vi ? 'TRỌNG TÂM CHIẾN LƯỢC' : 'STRATEGIC PILLAR'}
                      </span>
                      <h4>{vi ? 'Dự Án & Năng Lượng Điện Gió' : 'Wind Energy & Clean Horizons'}</h4>
                      <p className="mega-col-desc">
                        {vi
                          ? 'Chuỗi vật tư hạ tầng tuabin, dự án điện gió ngoài khơi & trên bờ trong hệ sinh thái HMV.'
                          : 'Turbine infrastructure supply chain, offshore & onshore wind projects in HMV ecosystem.'}
                      </p>
                    </div>

                    <div className="mega-energy-cards">
                      <Link
                        to={`/${lang}/supply-chain#wind-energy`}
                        onClick={close}
                        className="mega-feature-card"
                      >
                        <div className="mega-card-content">
                          <strong>{vi ? 'Dự Án Điện Gió Trên Bờ & Ngoài Khơi' : 'Onshore & Offshore Wind Projects'}</strong>
                          <p>{vi ? 'Cung ứng cấu kiện tuabin, thiết bị siêu trường siêu trọng và điều phối hạ tầng kỹ thuật.' : 'Turbine structures, heavy-lift logistics and specialized infrastructure coordination.'}</p>
                        </div>
                        <ArrowUpRight size={14} className="mega-arrow" />
                      </Link>

                      <Link
                        to={`/${lang}/supply-chain#wind-energy`}
                        onClick={close}
                        className="mega-feature-card"
                      >
                        <div className="mega-card-content">
                          <strong>{vi ? 'Chuyển Đổi Xanh & Mục Tiêu Net Zero' : 'Green Transition & Net Zero Goals'}</strong>
                          <p>{vi ? 'Giảm phát thải carbon trong chuỗi cung ứng, đáp ứng tiêu chuẩn bền vững CBAM toàn cầu.' : 'Decarbonizing supply chains and fulfilling European CBAM sustainability criteria.'}</p>
                        </div>
                        <ArrowUpRight size={14} className="mega-arrow" />
                      </Link>
                    </div>

                    <Link
                      to={`/${lang}/supply-chain#wind-energy`}
                      onClick={close}
                      className="mega-col-footer-link"
                    >
                      <span>{vi ? 'Khám phá mảng Điện gió HMV' : 'Explore Wind Energy Horizon'}</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>

                  {/* COLUMN 3: AUXILIARY LOGISTICS BACKBONE & SOLUTIONS */}
                  <div className="mega-col mega-col-logistics">
                    <div className="mega-col-header">
                      <span className="mega-badge badge-navy">
                        <Truck size={11} />
                        {vi ? 'VẬN HÀNH PHỤ TRỢ · TRỌN GÓI' : 'AUXILIARY OPERATIONAL BACKBONE'}
                      </span>
                      <h4>{vi ? 'Logistics & Giải Pháp Toàn Diện' : 'Logistics & Trade Solutions'}</h4>
                      <p className="mega-col-desc">
                        {vi
                          ? 'Chứng minh năng lực vận hành end-to-end khép kín, làm chủ trọn gói từ nguồn cung đến cảng biển.'
                          : 'End-to-end operational capacity proving full autonomous execution from origins to global ports.'}
                      </p>
                    </div>

                    <div className="mega-solutions-list">
                      <Link
                        to={`/${lang}/supply-chain#logistics-capacity`}
                        onClick={close}
                        className="mega-sol-item"
                      >
                        <div className="mega-sol-icon">
                          <Snowflake size={15} />
                        </div>
                        <div className="mega-sol-text">
                          <strong>{vi ? 'Chuỗi Lạnh Chuyên Sâu (Cold Chain)' : 'Advanced Cold Chain'}</strong>
                          <span>{vi ? 'Kiểm soát nhiệt độ liên tục từ vườn đến cảng' : 'Continuous temperature control farm-to-port'}</span>
                        </div>
                        <ArrowUpRight size={13} className="mega-arrow" />
                      </Link>

                      <Link
                        to={`/${lang}/supply-chain#logistics-capacity`}
                        onClick={close}
                        className="mega-sol-item"
                      >
                        <div className="mega-sol-icon">
                          <FileCheck size={15} />
                        </div>
                        <div className="mega-sol-text">
                          <strong>{vi ? 'Hải Quan & Chứng Từ Xuất Khẩu' : 'Customs & Export Documentation'}</strong>
                          <span>{vi ? 'Kiểm dịch thực vật, CO EUR.1, chứng nhận FDA' : 'Phytosanitary, CO EUR.1, FDA compliance'}</span>
                        </div>
                        <ArrowUpRight size={13} className="mega-arrow" />
                      </Link>

                      <Link
                        to={`/${lang}/supply-chain#logistics-capacity`}
                        onClick={close}
                        className="mega-sol-item"
                      >
                        <div className="mega-sol-icon">
                          <Anchor size={15} />
                        </div>
                        <div className="mega-sol-text">
                          <strong>{vi ? 'Vận Tải Biển Đa Phương Thức' : 'Multimodal Ocean Freight'}</strong>
                          <span>{vi ? 'Hải trình ổn định đến cảng Rotterdam, Hamburg, LA' : 'Direct sea routes to Rotterdam, Hamburg, LA'}</span>
                        </div>
                        <ArrowUpRight size={13} className="mega-arrow" />
                      </Link>

                      <Link
                        to={`/${lang}/supply-chain#supply`}
                        onClick={close}
                        className="mega-sol-item"
                      >
                        <div className="mega-sol-icon">
                          <Layers size={15} />
                        </div>
                        <div className="mega-sol-text">
                          <strong>{vi ? 'Quy Trình Chuỗi Cung Ứng 6 Bước' : '6-Stage Operational Workflow'}</strong>
                          <span>{vi ? 'Từ thấu hiểu nhu cầu đến bàn giao thị trường đích' : 'From buyer brief to final delivery handover'}</span>
                        </div>
                        <ArrowUpRight size={13} className="mega-arrow" />
                      </Link>
                    </div>

                    <div className="mega-col-footer-dual">
                      <Link
                        to={`/${lang}/supply-chain/compliance`}
                        onClick={close}
                        className="mega-col-footer-link mega-compliance-link"
                      >
                        <span>{vi ? '⚖️ Quy chuẩn Pháp lý & Rào cản (IPPC · EFSA · CBAM)' : '⚖️ Standards & Compliance (IPPC · EFSA · CBAM)'}</span>
                        <ArrowUpRight size={14} />
                      </Link>
                      <Link
                        to={`/${lang}/supply-chain#logistics-capacity`}
                        onClick={close}
                        className="mega-col-footer-link"
                      >
                        <span>{vi ? 'Tổng quan năng lực vận hành' : 'Full logistics capacity'}</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. EcoNews */}
            <Link
              className={pathname.startsWith(`/${lang}/insights`) || pathname.startsWith(`/${lang}/blog`) ? 'nav-active' : ''}
              to={`/${lang}/insights`}
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
                  className={pathname.startsWith(`/${lang}/about`) || pathname.startsWith(`/${lang}/activities`) ? 'nav-active' : ''}
                  to={`/${lang}/about`}
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
                  {aboutLinks.map((l) => (
                    <Link key={l.path} to={`/${lang}/${l.path}`} onClick={close}>
                      {l.label}
                      <ArrowUpRight size={15} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ACTIONS (Language Switch & 24/7 Support) */}
          <div className="nav-right">
            <div className="language-switch" aria-label="Language">
              <Link
                onClick={close}
                aria-current={lang === 'en' ? 'true' : undefined}
                to={pathname.replace(/^\/(en|vi)/, '/en')}
              >
                EN
              </Link>
              <span>/</span>
              <Link
                onClick={close}
                aria-current={lang === 'vi' ? 'true' : undefined}
                to={pathname.replace(/^\/(en|vi)/, '/vi')}
              >
                VI
              </Link>
            </div>

            <Button
              variant="brand"
              className="nav-support-btn"
              onClick={() => {
                close();
                window.dispatchEvent(new CustomEvent('open-hmv-support-chat'));
              }}
              title={vi ? 'Mở cổng Hỗ trợ trực tuyến 24/7' : 'Open 24/7 Online Support Chat'}
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
