import { Link } from 'react-router-dom';
import { ArrowUpRight, Sprout, Wind, Truck, ShieldCheck, Snowflake, FileCheck, Anchor, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products, photos } from '@/data/hmv';
import { productPhotos } from '@/data/productPhotos';

export function SupplyChainPillars({ lang }) {
  const vi = lang === 'vi';

  const logisticsFeatures = vi
    ? [
        {
          icon: Snowflake,
          title: 'Chuỗi Lạnh Chuyên Sâu (Cold Chain)',
          desc: 'Hệ thống kiểm soát nhiệt độ và độ ẩm liên tục từ khâu sơ chế tại vùng trồng, kho đệm đến container lạnh trên biển, giữ nguyên độ tươi ngon và phẩm cấp chuẩn quốc tế.',
        },
        {
          icon: FileCheck,
          title: 'Thủ Tục Hải Quan & Chứng Từ Toàn Cầu',
          desc: 'Quản lý toàn diện kiểm dịch thực vật (Phytosanitary), CO form EUR.1, chứng nhận FDA, tiêu chuẩn MRLs và thông quan hai đầu xuất - nhập khẩu.',
        },
        {
          icon: Anchor,
          title: 'Vận Tải Biển Đa Phương Thức Quốc Tế',
          desc: 'Hải trình ổn định 24–35 ngày kết nối từ các cảng Cát Lái, Cái Mép đến Rotterdam, Hamburg (EU) và Los Angeles, New York (Mỹ).',
        },
        {
          icon: ShieldCheck,
          title: 'Một Đầu Mối Điều Phối Khép Kín (Single Desk)',
          desc: 'Khách hàng B2B quốc tế chỉ làm việc với một đầu mối duy nhất cho chất lượng nguồn hàng, pháp lý chứng từ và cam kết giao hàng tận nơi.',
        },
      ]
    : [
        {
          icon: Snowflake,
          title: 'Continuous Cold Chain Preservation',
          desc: 'Unbroken multi-temperature monitoring from farm packhouses to reefers at sea, preserving optimal freshness and grade integrity.',
        },
        {
          icon: FileCheck,
          title: 'Customs & Export Documentation',
          desc: 'End-to-end management of phytosanitary certificates, EUR.1, FDA compliance, MRLs laboratory verification and dual-port customs clearance.',
        },
        {
          icon: Anchor,
          title: 'Multimodal Ocean Freight to EU & US',
          desc: 'Reliable 24–35 day ocean routes connecting Vietnam deep-water ports to Rotterdam, Hamburg (Europe) and Los Angeles, New York (USA).',
        },
        {
          icon: ShieldCheck,
          title: 'Single Commercial Point of Contact',
          desc: 'International buyers interface with one accountable team coordinating product quality, documentation and guaranteed delivery.',
        },
      ];

  return (
    <div className="supply-pillars-wrapper">
      {/* Quick jump navigation */}
      <nav className="content-width pillar-anchors-bar" aria-label={vi ? 'Điều hướng năng lực' : 'Capabilities navigation'}>
        <span className="pillar-anchors-label">{vi ? 'TRỌNG TÂM CHIẾN LƯỢC:' : 'STRATEGIC FOCUS:'}</span>
        <div className="pillar-anchor-links">
          <a href="#commodities" className="pillar-pill pillar-pill-green">
            <Sprout size={14} />
            <span>{vi ? 'Nông sản xuất khẩu ' : 'Agri-Produce '}</span>
          </a>
          <a href="#wind-energy" className="pillar-pill pillar-pill-cyan">
            <Wind size={14} />
            <span>{vi ? 'Dự án Điện gió ' : 'Wind Energy '}</span>
          </a>
          <a href="#logistics-capacity" className="pillar-pill pillar-pill-navy">
            <Truck size={14} />
            <span>{vi ? 'Vận hành Logistics ' : 'Logistics Backbone '}</span>
          </a>
          <a href="#supply" className="pillar-pill pillar-pill-muted">
            <span>{vi ? 'Quy trình 6 mắt xích ↓' : '6-Stage Process ↓'}</span>
          </a>
        </div>
      </nav>

      {/* PILLAR 1: FARMING & EXPORT COMMODITIES (MAIN) */}
      <section id="commodities" className="section-pad pillar-block pillar-farming">
        <div className="content-width">
          <div className="pillar-header">
            <div className="pillar-badge badge-green">
              <Sprout size={13} />
              <span>{vi ? 'MẢNG KINH DOANH CHÍNH · NÔNG NGHIỆP' : 'CORE BUSINESS PILLAR · AGRICULTURE'}</span>
            </div>
            <h2>{vi ? 'Năng Lực Vùng Trồng & Nông Sản Xuất Khẩu' : 'Farming Origins & Export Agri-Commodities'}</h2>
            <p className="pillar-desc">
              {vi
                ? 'HMV Global liên kết chặt chẽ với mạng lưới hợp tác xã và nhà vườn chuyên canh tại Tây Nguyên, miền Trung và Đồng bằng sông Cửu Long. Chúng tôi chủ động kiểm soát quy trình canh tác, dư lượng MRLs và chứng nhận GlobalGAP để cung ứng các mặt hàng nông sản cao cấp đáp ứng tiêu chuẩn khắt khe của thị trường châu Âu và Bắc Mỹ.'
                : 'HMV Global partners with certified farming cooperatives across Vietnam’s key agricultural belts. We control cultivation protocols, MRLs chemical residues and GlobalGAP certification to deliver export-grade produce for the European and North American markets.'}
            </p>
          </div>

          <div className="pillar-products-grid">
            {products.map((p) => {
              const photo = productPhotos[p.id];
              return (
                <article key={p.id} className="pillar-product-card">
                  {photo && (
                    <figure className="pillar-card-photo">
                      <img
                        src={photo.src}
                        width={photo.width}
                        height={photo.height}
                        alt={vi ? photo.altVi : photo.altEn}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="pillar-product-cat">{p.category}</span>
                    </figure>
                  )}
                  <div className="pillar-card-body">
                    <h3>{p[lang]}</h3>
                    <p className="pillar-card-sub">{vi ? p.subVi : p.subEn}</p>
                    <ul className="pillar-card-specs">
                      {p.specs.slice(0, 3).map((spec, idx) => (
                        <li key={idx}>
                          <CheckCircle2 size={13} />
                          <span>{spec.split(' / ')[vi ? 1 : 0]}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="outline" size="sm" className="pillar-card-cta">
                      <Link to={`/${lang}/products/${p.id}`}>
                        {vi ? 'Chi tiết quy cách' : 'Specifications'}
                        <ArrowUpRight size={14} />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PILLAR 2: WIND ENERGY & INFRASTRUCTURE (MAIN) */}
      <section id="wind-energy" className="section-pad pillar-block pillar-wind">
        <div className="content-width">
          <div className="pillar-wind-grid">
            <div className="pillar-wind-content">
              <div className="pillar-badge badge-cyan">
                <Wind size={13} />
                <span>{vi ? 'MẢNG KINH DOANH CHÍNH · NĂNG LƯỢNG TÁI TẠO' : 'CORE BUSINESS PILLAR · RENEWABLE ENERGY'}</span>
              </div>
              <h2>{vi ? 'Dự Án Điện Gió & Chuyển Đổi Năng Lượng Xanh' : 'Wind Energy Projects & Renewable Horizons'}</h2>
              <p className="pillar-desc">
                {vi
                  ? 'Điện gió là trọng tâm chiến lược dài hạn trong hệ sinh thái mở rộng của HMV Global. Chúng tôi tham gia điều phối chuỗi cung ứng vật tư hạ tầng, kết cấu tuabin và giải pháp hậu cần chuyên dụng cho các dự án điện gió ngoài khơi (Offshore) và trên bờ (Onshore) tại Việt Nam.'
                  : 'Wind energy represents a strategic long-term horizon within the expanding HMV Global ecosystem. We coordinate infrastructure supply chains, turbine structural components and specialized engineering logistics for onshore and offshore wind farms.'}
              </p>

              <div className="pillar-wind-highlights">
                <div className="wind-point">
                  <div className="wind-point-num">01</div>
                  <div>
                    <h4>{vi ? 'Chuỗi Cung Ứng Hạ Tầng & Cấu Kiện Tuabin' : 'Turbine & Infrastructure Supply Chain'}</h4>
                    <p>
                      {vi
                        ? 'Cung ứng vật tư thiết bị, tháp tuabin, cánh quạt và hỗ trợ kỹ thuật đồng bộ cho các cụm trang trại điện gió quy mô lớn.'
                        : 'Coordinating supply chains for towers, blades, nacelles and specialized auxiliary hardware for utility-scale wind farms.'}
                    </p>
                  </div>
                </div>

                <div className="wind-point">
                  <div className="wind-point-num">02</div>
                  <div>
                    <h4>{vi ? 'Cam Kết Net Zero & Giảm Dấu Chân Carbon' : 'Net Zero Commitment & Decarbonization'}</h4>
                    <p>
                      {vi
                        ? 'Kết hợp chuỗi cung ứng năng lượng tái tạo với định hướng nông nghiệp tuần hoàn, đáp ứng cơ chế CBAM và tiêu chuẩn phát thải khắt khe của EU.'
                        : 'Harmonizing renewable energy with circular agriculture to comply with the European CBAM mechanism and international sustainability criteria.'}
                    </p>
                  </div>
                </div>

                <div className="wind-point">
                  <div className="wind-point-num">03</div>
                  <div>
                    <h4>{vi ? 'Vận Chuyển Thiết Bị Siêu Trường Siêu Trọng' : 'Heavy-Lift & Project Logistics'}</h4>
                    <p>
                      {vi
                        ? 'Tích hợp giải pháp logistics hàng dự án đặc thù, đảm bảo an toàn tuyệt đối cho các cấu kiện công nghiệp nặng.'
                        : 'Integrated project logistics ensuring safe transport and deployment of heavy, oversized wind energy hardware.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pillar-wind-actions">
                <Button asChild variant="brand" size="lg">
                  <Link to={`/${lang}/contact?product=Wind%20Energy`}>
                    {vi ? 'Trao đổi về Dự án Điện gió' : 'Discuss Wind Projects'}
                    <ArrowUpRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>

            <figure className="pillar-wind-media">
              <img
                src={photos.wind}
                alt={vi ? 'Dự án điện gió hiện đại tại Việt Nam' : 'Modern wind energy turbines in Vietnam'}
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                {vi
                  ? 'Hạ tầng điện gió & chuỗi cung ứng năng lượng tái tạo · Hệ sinh thái HMV Global'
                  : 'Wind energy infrastructure & renewable supply chain · HMV Global Ecosystem'}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* PILLAR 3: COMPREHENSIVE LOGISTICS BACKBONE (AUXILIARY / OPERATIONAL CAPACITY) */}
      <section id="logistics-capacity" className="section-pad pillar-block pillar-logistics">
        <div className="content-width">
          <div className="pillar-header text-center">
            <div className="pillar-badge badge-navy">
              <Truck size={13} />
              <span>{vi ? 'NĂNG LỰC VẬN HÀNH PHỤ TRỢ · TOÀN DIỆN' : 'AUXILIARY OPERATIONAL BACKBONE · END-TO-END'}</span>
            </div>
            <h2>{vi ? 'Năng Lực Vận Hành Logistics Khép Kín' : 'Integrated Logistics Execution Capacity'}</h2>
            <div className="logistics-statement-box">
              <p>
                {vi
                  ? 'HMV Global không định vị logistics như một dịch vụ thương mại đơn lẻ mà là NĂNG LỰC VẬN HÀNH TOÀN DIỆN bảo chứng cho toàn bộ hệ thống. Năng lực logistics khép kín chứng minh công ty có khả năng làm chủ 100% quy trình từ nông trại & công trường dự án đến bàn giao an toàn tại các cảng đích quốc tế, loại bỏ hoàn toàn rủi ro phụ thuộc trung gian.'
                  : 'Logistics is not treated as an isolated brokerage service, but as HMV Global’s COMPREHENSIVE OPERATIONAL BACKBONE. Our end-to-end execution capacity proves that we command full control from source farms and project sites directly to international destination ports, eliminating fractured third-party risks.'}
              </p>
            </div>
          </div>

          <div className="logistics-features-grid">
            {logisticsFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="logistics-feature-card">
                  <div className="logistics-icon-wrap">
                    <Icon size={24} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Authoritative Deep-Dive Compliance Banner */}
          <div className="logistics-compliance-card">
            <div className="compliance-card-left">
              <div className="compliance-card-badge">
                <ShieldCheck size={14} />
                <span>{vi ? 'BẢO CHỨNG PHÁP LÝ & RÀO CẢN KỸ THUẬT' : 'GLOBAL REGULATORY & LEGAL ARCHITECTURE'}</span>
              </div>
              <h3>
                {vi
                  ? 'Quy Chuẩn Kiểm Dịch IPPC/ISPM 15, Dư Lượng EFSA MRLs & Cơ Chế Carbon CBAM'
                  : 'Deep-Dive Compliance: IPPC/ISPM 15 Phytosanitary, EFSA MRLs & CBAM Carbon Protocols'}
              </h3>
              <p>
                {vi
                  ? 'Đối với khách hàng B2B quốc tế, năng lực vận hành cần đi kèm bằng chứng pháp lý rõ ràng. Tìm hiểu cách HMV Global kiểm soát rủi ro kiểm dịch thực vật tại cảng đến, lấy mẫu test độc lập ISO 17025 tại vùng trồng và chuẩn bị dữ liệu phát thải Scope 3 cho dự án điện gió.'
                  : 'For international enterprise buyers, operational excellence requires verifiable legal rigor. Discover how HMV Global eliminates port detentions via ISPM 15, enforces ISO 17025 pre-harvest MRLs testing, and equips EPC contractors with Scope 3 CBAM emission datasets.'}
              </p>
              <div className="compliance-trust-tags">
                <span>EU Directive 2000/29/EC</span>
                <span>Regulation EC 396/2005</span>
                <span>Regulation EU 2023/956</span>
                <span>ISO/IEC 17025</span>
              </div>
            </div>
            <div className="compliance-card-action">
              <Button asChild size="lg" variant="brand" className="compliance-link-btn">
                <Link to={`/${lang}/supply-chain/compliance`}>
                  <span>{vi ? 'Tìm hiểu sâu về Quy chuẩn Toàn cầu' : 'Deep dive into Global Standards'}</span>
                  <ArrowUpRight size={18} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="logistics-proof-banner">
            <div className="proof-metric">
              <strong>100%</strong>
              <span>{vi ? 'Chủ động điều phối chuỗi cung ứng' : 'Autonomous Supply Coordination'}</span>
            </div>
            <div className="proof-metric">
              <strong>24–35 {vi ? 'Ngày' : 'Days'}</strong>
              <span>{vi ? 'Tuyến hải trình thẳng đến EU & Mỹ' : 'Direct Ocean Routes to EU & USA'}</span>
            </div>
            <div className="proof-metric">
              <strong>24/7</strong>
              <span>{vi ? 'Giám sát chuỗi lạnh & Hỗ trợ đối tác' : 'Cold Chain & Client Desk Standby'}</span>
            </div>
            <div className="proof-metric">
              <strong>01</strong>
              <span>{vi ? 'Đầu mối duy nhất xuyên suốt' : 'Single Point of Accountability'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
