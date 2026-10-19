import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Flame,
  Truck,
  Globe2,
  Building2,
  CheckCircle2,
  ArrowRight,
  Plane,
  Ship,
  Boxes,
  Factory,
  Compass,
  ArrowUpRight,
  Award,
  Maximize2,
  X,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageMeta } from '@/components/common/PageMeta';
import { logisticsServicesData } from '@/data/logisticsServices';
import { useLang } from '@/i18n/LanguageContext';

export function LogisticsHubPage() {
  const lang = useLang();
  const vi = lang === 'vi';
  const { dangerousGoods, crossBorder, localAgency, overseaAgency } =
    logisticsServicesData;
  const [lightboxImg, setLightboxImg] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location.hash]);

  return (
    <div className="logistics-hub-page">
      <PageMeta
        lang={lang}
        title={
          vi
            ? 'Dịch Vụ Logistics Quốc Tế & Vận Chuyển Hàng Nguy Hiểm | HMV Logistics'
            : 'International Logistics & Dangerous Goods Handling | HMV Logistics'
        }
        description={
          vi
            ? 'Chuyên xử lý hàng nguy hiểm Dangerous Goods (Air & Sea), hàng hóa chất, hàng đặc biệt, tuyến xuyên biên giới Việt Nam - Campuchia, đại lý nội địa và mạng lưới toàn cầu JC Trans.'
            : 'Specialized Dangerous Goods handling (Air & Sea), chemical transport, special & general cargoes, Vietnam-Cambodia cross-border drayage, local agency handling and JC Trans global networking.'
        }
      />

      {/* HERO SECTION */}
      <section className="log-hero-section">
        <div className="content-width">
          <div className="log-hero-badge">
            <ShieldAlert size={14} className="log-badge-icon" />
            <span>
              {vi
                ? 'NĂNG LỰC LOGISTICS TOÀN DIỆN · GIẢI PHÁP VẬN TẢI CHUYÊN BIỆT'
                : 'END-TO-END FREIGHT CAPACITY · SPECIALIZED LOGISTICS'}
            </span>
          </div>
          <h1 className="log-hero-title">
            {vi ? (
              <>
                Dịch Vụ Logistics Chuyên Biệt, <br />
                <span className="log-title-gradient">
                  Hàng Nguy Hiểm & Vận Tải Quốc Tế
                </span>
              </>
            ) : (
              <>
                Specialized Logistics Solutions, <br />
                <span className="log-title-gradient">
                  Dangerous Goods & Global Freight
                </span>
              </>
            )}
          </h1>
          <p className="log-hero-desc">
            {vi
              ? 'HMV Logistics cung cấp giải pháp vận tải toàn diện: Chuyên môn sâu về hàng hóa chất & hàng nguy hiểm (DG Air/Sea, Special Cargoes, General Cargoes, Factory Tour), mạng lưới vận tải xuyên biên giới Việt Nam - Campuchia, dịch vụ đại lý nội địa tại Việt Nam và kết nối toàn cầu qua mạng lưới JC Trans.'
              : 'HMV Logistics delivers mission-critical freight forwarding: deep engineering in Dangerous Goods & Chemicals (Air & Sea, Special Cargoes, General Cargoes, Factory Tour), cross-border Vietnam - Cambodia corridors, comprehensive local agency handling, and verified JC Trans global network coverage.'}
          </p>

          {/* QUICK JUMP NAV PILLS */}
          <div className="log-quick-nav">
            <a href="#dangerous-goods" className="log-nav-pill">
              <Flame size={14} />
              <span>
                {vi ? 'Hàng Nguy Hiểm & Hóa Chất' : 'Dangerous Goods'}
              </span>
            </a>
            <a href="#cross-border" className="log-nav-pill">
              <Truck size={14} />
              <span>
                {vi ? 'Xuyên Biên Giới VN - Campuchia' : 'Vietnam - Cambodia'}
              </span>
            </a>
            <a href="#local-agency" className="log-nav-pill">
              <Building2 size={14} />
              <span>
                {vi ? 'Đại Lý Nội Địa Việt Nam' : 'Local Agency Vietnam'}
              </span>
            </a>
            <a href="#oversea-agency" className="log-nav-pill">
              <Globe2 size={14} />
              <span>
                {vi ? 'Mạng Lưới Toàn Cầu JC Trans' : 'JC Trans Membership'}
              </span>
            </a>
            <Link to="/packaging-logistics" className="log-nav-pill highlight">
              <Boxes size={14} />
              <span>
                {vi ? 'Quy Cách Đóng Gói Thực Tế' : 'Packaging Protocols'}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 1: SPECIALIZING FOR DANGEROUS GOODS & CHEMICALS */}
      <section id="dangerous-goods" className="log-section log-dg-section">
        <div className="content-width">
          <div className="log-section-header">
            <div className="log-sub-badge danger">
              <Flame size={13} />
              <span>{vi ? 'MẢNG CHUYÊN MÔN CAO' : 'ENGINEERED SPECIALTY'}</span>
            </div>
            <h2>{vi ? dangerousGoods.titleVi : dangerousGoods.titleEn}</h2>
            <p className="log-section-subtitle">
              {vi ? dangerousGoods.subtitleVi : dangerousGoods.subtitleEn}
            </p>
            <p className="log-section-lead">
              {vi ? dangerousGoods.leadVi : dangerousGoods.leadEn}
            </p>
          </div>

          {/* 4 SUB-SERVICES GRID / ACCORDION */}
          <div className="dg-subservices-grid">
            {dangerousGoods.subServices.map((sub, idx) => {
              const icons = [
                <div key="0" className="dg-icon-box airsea">
                  <Plane size={18} />
                  <Ship size={18} />
                </div>,
                <div key="1" className="dg-icon-box special">
                  <Compass size={20} />
                </div>,
                <div key="2" className="dg-icon-box general">
                  <Boxes size={20} />
                </div>,
                <div key="3" className="dg-icon-box factory">
                  <Factory size={20} />
                </div>,
              ];
              return (
                <div key={sub.id} id={sub.slug} className="dg-card">
                  <div className="dg-card-header">
                    {icons[idx]}
                    <div>
                      <span className="dg-idx">0{idx + 1}</span>
                      <h3>{vi ? sub.titleVi : sub.titleEn}</h3>
                    </div>
                  </div>

                  <p className="dg-card-desc">{vi ? sub.descVi : sub.descEn}</p>

                  {/* Highlights checklist */}
                  <ul className="dg-highlights">
                    {(vi ? sub.highlightsVi : sub.highlightsEn).map(
                      (hl, hIdx) => (
                        <li key={hIdx}>
                          <CheckCircle2 size={15} className="dg-check" />
                          <span>{hl}</span>
                        </li>
                      ),
                    )}
                  </ul>

                  {/* Photo Gallery for this subservice */}
                  <div className="dg-media-grid">
                    {sub.images.map((img, iIdx) => (
                      <div
                        key={iIdx}
                        className="dg-img-thumb"
                        onClick={() => setLightboxImg(img)}
                        title={img.title}
                      >
                        <img src={img.src} alt={img.title} loading="lazy" />
                        <span className="dg-img-tag">{img.tag}</span>
                        <div className="dg-zoom-hint">
                          <Maximize2 size={13} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: CROSSED BORDER VIETNAM - CAMBODIA */}
      <section id="cross-border" className="log-section log-cb-section">
        <div className="content-width">
          <div className="log-section-header">
            <div className="log-sub-badge primary">
              <Truck size={13} />
              <span>{vi ? 'LIÊN VẬN ĐƯỜNG BỘ' : 'CROSS-BORDER CORRIDOR'}</span>
            </div>
            <h2>{vi ? crossBorder.titleVi : crossBorder.titleEn}</h2>
            <p className="log-section-subtitle">
              {vi ? crossBorder.subtitleVi : crossBorder.subtitleEn}
            </p>
            <p className="log-section-lead">
              {vi ? crossBorder.leadVi : crossBorder.leadEn}
            </p>
          </div>

          <div className="cb-container-layout">
            <div className="cb-features-col">
              <div className="cb-feature-card">
                <h3>
                  {vi
                    ? 'Ưu Thế Vượt Trội Của Tuyến Vận Tải'
                    : 'Core Corridor Advantages'}
                </h3>
                <ul className="cb-feature-list">
                  {(vi ? crossBorder.featuresVi : crossBorder.featuresEn).map(
                    (feat, fIdx) => (
                      <li key={fIdx}>
                        <div className="cb-num">{fIdx + 1}</div>
                        <span>{feat}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div className="cb-route-card">
                <h4>
                  {vi
                    ? 'Cửa Khẩu Quốc Tế Trọng Điểm'
                    : 'Key Border Gates Served'}
                </h4>
                <div className="cb-gates-badges">
                  <span className="gate-tag">Mộc Bài ⇄ Bavet (Tây Ninh)</span>
                  <span className="gate-tag">Xa Mát ⇄ Trapeang Phlong</span>
                  <span className="gate-tag">
                    Hoa Lư ⇄ Trapeang Sre (Bình Phước)
                  </span>
                  <span className="gate-tag">
                    Bình Hiệp ⇄ Prey Voa (Long An)
                  </span>
                </div>
                <div className="cb-cta-wrap">
                  <Button asChild variant="brand" size="sm">
                    <Link to="/contact?service=cross-border">
                      {vi
                        ? 'Yêu Cầu Báo Giá Tuyến VN - Cam'
                        : 'Inquire Vietnam - Cambodia Freight'}
                      <ArrowRight size={14} style={{ marginLeft: 6 }} />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Gallery of 6 Cross-Border Photos */}
            <div className="cb-gallery-col">
              <div className="cb-gallery-grid">
                {crossBorder.images.map((img, cIdx) => (
                  <div
                    key={cIdx}
                    className="cb-img-card"
                    onClick={() => setLightboxImg(img)}
                  >
                    <img src={img.src} alt={img.title} loading="lazy" />
                    <div className="cb-img-overlay">
                      <span className="cb-tag">{img.tag}</span>
                      <p className="cb-img-title">{img.title}</p>
                    </div>
                    <div className="cb-zoom-btn">
                      <Maximize2 size={13} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4: LOCAL AGENCY & OVERSEA JC TRANS NETWORKING */}
      <section id="agency-network" className="log-section log-agency-section">
        <div className="content-width">
          <div className="agency-dual-grid">
            {/* LOCAL AGENCY HANDLING IN VIETNAM */}
            <div id="local-agency" className="agency-box local-box">
              <div className="agency-box-header">
                <div className="log-sub-badge navy">
                  <Building2 size={13} />
                  <span>
                    {vi ? 'ĐẠI LÝ NỘI ĐỊA VIỆT NAM' : 'LOCAL HUB HANDLING'}
                  </span>
                </div>
                <h2>{vi ? localAgency.titleVi : localAgency.titleEn}</h2>
                <p className="agency-subtitle">
                  {vi ? localAgency.subtitleVi : localAgency.subtitleEn}
                </p>
                <p className="agency-lead">
                  {vi ? localAgency.leadVi : localAgency.leadEn}
                </p>
              </div>

              <div className="agency-list">
                {(vi
                  ? localAgency.capabilitiesVi
                  : localAgency.capabilitiesEn
                ).map((cap, capIdx) => (
                  <div key={capIdx} className="agency-item">
                    <CheckCircle2 size={17} className="agency-check" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              <div className="agency-port-tags">
                <strong>
                  {vi
                    ? 'Bao phủ các cảng biển & ICD:'
                    : 'Covering key ports & ICDs:'}
                </strong>
                <div className="port-chips">
                  <span>Hải Phòng (HPH)</span>
                  <span>Đà Nẵng (DAD)</span>
                  <span>Quy Nhơn (UIH)</span>
                  <span>Cát Lái (HCM)</span>
                  <span>Cái Mép (TCIT/TCTT)</span>
                  <span>ICD Phước Long / Sotrans</span>
                </div>
              </div>
            </div>

            {/* OVERSEA AGENCY NETWORKING (JC TRANS MEMBERSHIP) */}
            <div id="oversea-agency" className="agency-box oversea-box">
              <div className="agency-box-header">
                <div className="log-sub-badge cyan">
                  <Award size={13} />
                  <span>
                    {vi
                      ? 'MẠNG LƯỚI QUỐC TẾ CHÍNH THỨC'
                      : 'GLOBAL ACCREDITATION'}
                  </span>
                </div>
                <h2>{vi ? overseaAgency.titleVi : overseaAgency.titleEn}</h2>
                <div className="jctrans-proof-badge">
                  <ShieldCheck size={18} />
                  <span>
                    JC TRANS VERIFIED MEMBER · GLOBAL CREDIT PROTECTION (GCP)
                  </span>
                </div>
                <p className="agency-subtitle">
                  {vi ? overseaAgency.subtitleVi : overseaAgency.subtitleEn}
                </p>
                <p className="agency-lead">
                  {vi ? overseaAgency.leadVi : overseaAgency.leadEn}
                </p>
              </div>

              <div className="agency-list">
                {(vi
                  ? overseaAgency.advantagesVi
                  : overseaAgency.advantagesEn
                ).map((adv, aIdx) => (
                  <div key={aIdx} className="agency-item">
                    <CheckCircle2 size={17} className="agency-check jc" />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>

              <div className="jctrans-metric-card">
                <div className="jc-metric">
                  <strong>10,000+</strong>
                  <span>
                    {vi ? 'Đại Lý Đối Tác Toàn Cầu' : 'Global Partner Agencies'}
                  </span>
                </div>
                <div className="jc-metric">
                  <strong>160+</strong>
                  <span>
                    {vi ? 'Quốc Gia & Lãnh Thổ' : 'Countries & Regions'}
                  </span>
                </div>
                <div className="jc-metric">
                  <strong>GCP</strong>
                  <span>
                    {vi
                      ? 'Bảo Hiểm Tín Dụng Quốc Tế'
                      : 'Global Credit Protected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="log-bottom-cta">
        <div className="content-width">
          <div className="log-cta-card">
            <div className="log-cta-content">
              <h3>
                {vi
                  ? 'Cần Báo Giá Vận Tải Hóa Chất, Hàng Nguy Hiểm Hoặc Tuyến Xuyên Biên Giới?'
                  : 'Require Chemical, Dangerous Goods or Cross-Border Freight Quotation?'}
              </h3>
              <p>
                {vi
                  ? 'Đội ngũ chuyên viên chứng chỉ IMDG/IATA và điều vận đường bộ của HMV Logistics sẵn sàng phản hồi giải pháp tối ưu trong vòng 2 giờ.'
                  : 'HMV Logistics certified IMDG/IATA dangerous goods specialists and cross-border transport dispatchers are on standby.'}
              </p>
            </div>
            <div className="log-cta-actions">
              <Button asChild size="lg" variant="brand">
                <Link to="/contact?service=logistics">
                  {vi
                    ? 'Liên Hệ Chuyên Viên Logistics'
                    : 'Contact Logistics Desk'}
                  <ArrowUpRight size={17} style={{ marginLeft: 6 }} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="mailto:vannguyen@hmvglobal.com">
                  <Mail size={16} style={{ marginRight: 6 }} />
                  vannguyen@hmvglobal.com
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIGHTBOX MODAL */}
      {lightboxImg && (
        <div className="pack-lightbox" onClick={() => setLightboxImg(null)}>
          <div
            className="pack-lightbox-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="pack-lightbox-close"
              onClick={() => setLightboxImg(null)}
              aria-label="Close image preview"
            >
              <X size={20} />
            </button>
            <img src={lightboxImg.src} alt={lightboxImg.title} />
            <div className="pack-lightbox-caption">
              <strong>{lightboxImg.tag}</strong> · {lightboxImg.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
