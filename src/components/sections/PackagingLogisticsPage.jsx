import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageCheck,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Boxes,
  ThermometerSnowflake,
  Container,
  Layers,
  ArrowRight,
  Sparkles,
  Maximize2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageMeta } from '@/components/common/PageMeta';
import { packagingData } from '@/data/operationalLogistics';

export function PackagingLogisticsPage({ lang = 'en' }) {
  const vi = lang === 'vi';
  const { standards, transportStages, stats } = packagingData;
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="pack-logistics-page">
      <PageMeta
        lang={lang}
        title={
          vi
            ? 'Quy Cách Đóng Gói & Vận Chuyển Xuất Khẩu | HMV Global'
            : 'Packaging & Ocean Freight Logistics | HMV Global'
        }
        description={
          vi
            ? 'Thực tế năng lực đóng gói hàng hóa, bọc màng co pallet ISPM 15, xếp dỡ cơ giới và vận chuyển container đường biển an toàn xuất khẩu sang EU & Mỹ.'
            : 'Operational evidence of export packaging standards, ISPM 15 palletization, mechanized forklift cross-docking, and container transport to EU & US ports.'
        }
      />

      {/* HERO SECTION */}
      <section className="pack-hero-section">
        <div className="content-width">
          <div className="pack-hero-header">
            <div className="pack-badge">
              <PackageCheck size={13} />
              <span>
                {vi
                  ? 'NĂNG LỰC VẬN HÀNH THỰC TẾ · PACKAGING & FREIGHT'
                  : 'ON-SITE OPERATIONAL CAPACITY · PACKAGING & FREIGHT'}
              </span>
            </div>
            <h1>
              {vi ? (
                <>
                  Quy Cách Đóng Gói Chuẩn Quốc Tế <br />
                  <span>& Vận Chuyển Container Xuất Khẩu</span>
                </>
              ) : (
                <>
                  Export-Grade Packaging Standards <br />
                  <span>& High-Cube Container Freight</span>
                </>
              )}
            </h1>
            <p className="pack-hero-desc">
              {vi
                ? 'Minh chứng chân thực qua chuỗi hình ảnh vận hành thực địa tại kho xưởng HMV Global: từ đóng gói thùng carton 5-7 lớp, cố định pallet màng co PE tiêu chuẩn ISPM 15, xếp dỡ xe nâng chuyên dụng đến đóng container xuyên đêm phục vụ các tuyến hàng lớn đi châu Âu và Hoa Kỳ.'
                : 'Direct operational photographic evidence from HMV Global facilities: from heavy-duty 5-7 ply carton bundling and ISPM 15 PE shrink-wrapped pallets to 24/7 forklift cross-docking and overnight high-cube container drayage to deep-water seaports.'}
            </p>
          </div>

          {/* QUICK STATS STRIP */}
          <div className="pack-stats-banner">
            {stats.map((s, idx) => (
              <div key={idx} className="pack-stat-item">
                <strong>{s.value}</strong>
                <span>{vi ? s.labelVi : s.labelEn}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PART 1: PACKAGING STANDARDS & PALLETIZATION */}
      <section className="section-pad pack-standards-section">
        <div className="content-width">
          <div className="section-heading-split">
            <div>
              <div className="pack-badge badge-green">
                <Boxes size={13} />
                <span>{vi ? 'TIÊU CHUẨN ĐÓNG KIỆN' : 'PACKAGING & PALLETIZATION'}</span>
              </div>
              <h2>{vi ? 'Quy Chuẩn Đóng Gói Bảo Vệ Đa Tầng' : 'Multi-Tiered Protective Packaging Standards'}</h2>
            </div>
            <p>
              {vi
                ? 'Mọi kiện hàng xuất khẩu của HMV Global đều được đóng gói theo quy chuẩn quốc tế nghiêm ngặt, triệt tiêu nguy cơ móp méo, va đập hoặc ngưng tụ hơi nước trong các hải trình xuyên đại dương kéo dài 25–35 ngày.'
                : 'Every export consignment handled by HMV Global adheres to rigorous international protocols, eliminating crushing, shifting, and humidity condensation risks throughout 25-35 day intercontinental sea routes.'}
            </p>
          </div>

          <div className="pack-grid">
            {standards.map((item, idx) => (
              <article key={item.id} className="pack-card">
                <div className="pack-card-media" onClick={() => setSelectedImage(item.image)}>
                  <img
                    src={item.image}
                    alt={vi ? item.titleVi : item.titleEn}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="pack-card-tag">
                    <span>{vi ? item.tagVi : item.tagEn}</span>
                  </div>
                  <button
                    type="button"
                    className="pack-zoom-btn"
                    title={vi ? 'Xem ảnh phóng to' : 'Zoom photo'}
                    aria-label={vi ? 'Xem ảnh phóng to' : 'Zoom photo'}
                  >
                    <Maximize2 size={15} />
                  </button>
                </div>
                <div className="pack-card-body">
                  <div className="pack-card-meta">
                    <span className="pack-card-badge">{vi ? item.badgeVi : item.badgeEn}</span>
                    <span className="pack-card-num">0{idx + 1}</span>
                  </div>
                  <h3>{vi ? item.titleVi : item.titleEn}</h3>
                  <p>{vi ? item.descVi : item.descEn}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PART 2: TRANSPORTATION & DISPATCH WORKFLOW */}
      <section className="section-pad pack-stages-section">
        <div className="content-width">
          <div className="section-heading-split">
            <div>
              <div className="pack-badge badge-navy">
                <Truck size={13} />
                <span>{vi ? 'VẬN HÀNH LOGISTICS THỰC ĐỊA' : 'ON-SITE FREIGHT EXECUTION'}</span>
              </div>
              <h2>{vi ? 'Quy Trình Xếp Dỡ & Vận Chuyển Container' : 'Cross-Dock Loading & Container Drayage'}</h2>
            </div>
            <p>
              {vi
                ? 'Quy trình vận hành 3 bước khép kín từ kho đệm ra xe container, kiểm soát nghiêm ngặt từ khâu dùng xe nâng, đóng hàng đêm tránh sốc nhiệt đến niêm phong chì bảo mật.'
                : 'A seamless 3-stage cross-dock sequence from internal warehousing to ocean container drayage, featuring dedicated forklift handling, overnight cool loading, and ISO bolt-seal lockout.'}
            </p>
          </div>

          <div className="transport-stages-list">
            {transportStages.map((stage, idx) => (
              <div key={stage.id} className={`transport-stage-row ${idx % 2 === 1 ? 'row-reversed' : ''}`}>
                <div className="stage-media" onClick={() => setSelectedImage(stage.image)}>
                  <img
                    src={stage.image}
                    alt={vi ? stage.titleVi : stage.titleEn}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="stage-stat-pill">
                    <strong>{stage.statNumber}</strong>
                    <span>{vi ? stage.statLabelVi : stage.statLabelEn}</span>
                  </div>
                </div>

                <div className="stage-content">
                  <span className="stage-step-tag">{vi ? stage.stageVi : stage.stageEn}</span>
                  <h3>{vi ? stage.titleVi : stage.titleEn}</h3>
                  <p className="stage-desc">{vi ? stage.descVi : stage.descEn}</p>

                  <ul className="stage-checklist">
                    <li>
                      <CheckCircle2 size={16} />
                      <span>
                        {vi
                          ? 'Đội ngũ kỹ thuật kho giám sát và ký biên bản kiểm đếm'
                          : 'Dock superintendents supervise piece counts and checklist sign-off'}
                      </span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} />
                      <span>
                        {vi
                          ? 'Kiểm tra thông số kỹ thuật sàn xe và nhiệt độ trước khi nhồi hàng'
                          : 'Pre-trip container floor integrity and temperature validation'}
                      </span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} />
                      <span>
                        {vi
                          ? 'Dán nhãn an toàn hàng hóa & cung cấp hồ sơ ảnh xếp dỡ cho đối tác'
                          : 'Dangerous/fragile placards and full photographic loading dossier'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PART 3: QUALITY ASSURANCE & BOTTOM CTA */}
      <section className="section-pad pack-assurance-section">
        <div className="content-width">
          <div className="pack-assurance-card">
            <div className="assurance-left">
              <div className="pack-badge badge-cyan">
                <ShieldCheck size={13} />
                <span>{vi ? 'CAM KẾT CHẤT LƯỢNG HÀNG ĐẦU' : 'QUALITY ASSURANCE GUARANTEE'}</span>
              </div>
              <h2>
                {vi
                  ? 'Bảo Vệ Giá Trị Sản Phẩm Từ Nông Trại Đến Thị Trường Toàn Cầu'
                  : 'Preserving Product Integrity from Origin Farms to Global Markets'}
              </h2>
              <p>
                {vi
                  ? 'Tại HMV Global, quy cách đóng gói và năng lực logistics không chỉ là khâu phụ trợ mà là mắt xích quyết định thành bại của giao thương quốc tế. Chúng tôi cam kết hàng hóa đến tay đối tác tại EU và Mỹ với phẩm cấp đồng đều, nguyên seal và hồ sơ minh bạch tuyệt đối.'
                  : 'At HMV Global, protective packaging and autonomous drayage are decisive cornerstones of intercontinental commerce. We guarantee your shipments arrive in Rotterdam, Hamburg, or Los Angeles with uniform grading, intact tamper-proof seals, and full provenance transparency.'}
              </p>
              <div className="assurance-actions">
                <Button asChild variant="brand" size="lg">
                  <Link to={`/${lang}/contact`}>
                    {vi ? 'Yêu Cầu Báo Giá & Quy Cách Vận Chuyển' : 'Request Freight & Packaging Quotation'}
                    <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to={`/${lang}/supply-chain`}>
                    {vi ? 'Xem Toàn Bộ Chuỗi Cung Ứng' : 'Explore Complete Supply Chain'}
                    <ArrowUpRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="assurance-right">
              <div className="assurance-feature-box">
                <ThermometerSnowflake size={26} className="feature-icon" />
                <div>
                  <h4>{vi ? 'Giám Sát Chuỗi Lạnh Liên Tục' : 'Telemetry Cold Chain Monitoring'}</h4>
                  <p>
                    {vi
                      ? 'Thiết bị ghi nhận nhiệt độ và độ ẩm kỹ thuật số (Datalogger) kèm trong từng container theo dõi hải trình 24/7.'
                      : 'Digital USB dataloggers and IoT temperature telemetry in each reefer track ambient conditions around the clock.'}
                  </p>
                </div>
              </div>

              <div className="assurance-feature-box">
                <Container size={26} className="feature-icon" />
                <div>
                  <h4>{vi ? 'Đội Xe Container Chuyên Tuyến' : 'Dedicated Ocean Container Fleet'}</h4>
                  <p>
                    {vi
                      ? 'Đội xe kéo container 45ft/40ft đạt chuẩn quốc tế, xuất phát thẳng từ kho đến cụm cảng nước sâu không qua trung gian.'
                      : 'International standard 40HC/45ft fleet transporting direct from origin docks to deepwater seaports.'}
                  </p>
                </div>
              </div>

              <div className="assurance-feature-box">
                <Layers size={26} className="feature-icon" />
                <div>
                  <h4>{vi ? 'Đóng Gói Tùy Biến Theo Yêu Cầu (Custom OEM)' : 'Custom OEM & Private Label Packaging'}</h4>
                  <p>
                    {vi
                      ? 'Linh hoạt quy cách thùng carton in thương hiệu riêng, đóng túi hút chân không, thùng xốp hoặc phuy 200L.'
                      : 'Flexible buyer-specified private label boxes, vacuum packs, insulated cartons, or aseptic 200L drums.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULLSCREEN PHOTO PREVIEW MODAL */}
      {selectedImage && (
        <div className="pack-lightbox" onClick={() => setSelectedImage(null)} role="dialog" aria-modal="true">
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setSelectedImage(null)}
              aria-label={vi ? 'Đóng cửa sổ' : 'Close modal'}
            >
              <X size={20} />
            </button>
            <img src={selectedImage} alt="Packaging & Freight Evidence" />
          </div>
        </div>
      )}
    </div>
  );
}
