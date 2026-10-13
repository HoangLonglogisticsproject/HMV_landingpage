import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Scale,
  Award,
  Globe2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Download,
  Building2,
  TreePine,
  Cpu,
  Sprout,
  Wind,
  Truck,
  Leaf,
  Layers,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CompliancePage({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const [activeSection, setActiveSection] = useState('ippc-ispm');

  const navItems = [
    {
      id: 'ippc-ispm',
      num: '01',
      title: vi ? 'IPPC & ISPM (Kiểm dịch)' : 'IPPC & ISPM (Phytosanitary)',
      sub: vi ? 'Kiểm dịch thực vật & Pallet gỗ' : 'Plant Health & Wood Packaging',
      tag: 'FAO · ISPM 15'
    },
    {
      id: 'efsa-fda',
      num: '02',
      title: vi ? 'EFSA & FDA (Dư lượng)' : 'EFSA & FDA (Residues)',
      sub: vi ? 'Kiểm soát MRLs & ISO 17025' : 'MRLs Control & ISO 17025',
      tag: 'EC 396/2005 · FDA'
    },
    {
      id: 'cbam-carbon',
      num: '03',
      title: vi ? 'CBAM (Điện gió & Carbon)' : 'CBAM (Wind & Carbon)',
      sub: vi ? 'Biên giới carbon & Scope 3' : 'Carbon Border & Scope 3',
      tag: 'EU 2023/956 · GHG'
    }
  ];

  // Scroll spy to highlight active menu item
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setActiveSection(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="compliance-doc-layout">
      {/* Top Authority Header & KPI Strip */}
      <section className="compliance-hero">
        <div className="content-width">
          <div className="compliance-breadcrumbs">
            <Link to={`/${lang}`}>{vi ? 'Trang chủ' : 'Home'}</Link>
            <span>/</span>
            <Link to={`/${lang}/supply-chain`}>{vi ? 'Chuỗi cung ứng' : 'Supply Chain'}</Link>
            <span>/</span>
            <strong>{vi ? 'Quy chuẩn Toàn cầu (Compliance)' : 'Global Compliance'}</strong>
          </div>

          <div className="compliance-hero-grid">
            <div className="compliance-hero-copy">
              <div className="compliance-authority-tag">
                <ShieldCheck size={14} />
                <span>{vi ? 'B2B COMPLIANCE & STANDARDS DOSSIER' : 'B2B COMPLIANCE & STANDARDS DOSSIER'}</span>
              </div>
              <h1>
                {vi
                  ? 'Quy Chuẩn Toàn Cầu & Kiểm Soát Pháp Lý Vận Hành'
                  : 'Global Regulatory Standards & Operational Compliance'}
              </h1>
              <p className="compliance-hero-sub">
                {vi
                  ? 'Khung pháp lý kỹ thuật, hồ sơ kiểm soát kiểm dịch IPPC/ISPM 15, chứng nhận phân tích dư lượng EFSA MRLs và cơ chế biên giới carbon CBAM bảo chứng năng lực thực thi độc lập của HMV Global trên thị trường Châu Âu & Hoa Kỳ.'
                  : 'Enterprise technical dossier detailing IPPC/ISPM 15 phytosanitary control, EFSA MRLs residue validation, and CBAM carbon accounting ensuring autonomous operational compliance across European and US markets.'}
              </p>
            </div>

            {/* Trust Badges Cluster */}
            <div className="compliance-badges-cluster">
              <div className="compliance-badge-chip">
                <span className="badge-flag">🇪🇺</span>
                <div>
                  <strong>EU Regulation</strong>
                  <small>EC 396/2005 · 2000/29/EC</small>
                </div>
              </div>
              <div className="compliance-badge-chip">
                <span className="badge-flag">🇺🇸</span>
                <div>
                  <strong>USDA & FDA</strong>
                  <small>APHIS · 21 CFR Compliant</small>
                </div>
              </div>
              <div className="compliance-badge-chip">
                <span className="badge-flag">🌐</span>
                <div>
                  <strong>UN FAO / IPPC</strong>
                  <small>ISPM 15 Certified HT/MB</small>
                </div>
              </div>
              <div className="compliance-badge-chip">
                <span className="badge-flag">🧪</span>
                <div>
                  <strong>ISO/IEC 17025</strong>
                  <small>Eurofins & SGS Tested</small>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="compliance-kpi-bar">
            <div className="kpi-box">
              <span className="kpi-num">0%</span>
              <span className="kpi-label">{vi ? 'Rủi ro giữ hàng (Hold rate) tại cảng' : 'Port Detention Rate'}</span>
            </div>
            <div className="kpi-divider" />
            <div className="kpi-box">
              <span className="kpi-num">100%</span>
              <span className="kpi-label">{vi ? 'Pallet gỗ đạt chuẩn nhiệt HT ISPM 15' : 'ISPM 15 HT-Treated Pallets'}</span>
            </div>
            <div className="kpi-divider" />
            <div className="kpi-box">
              <span className="kpi-num">&lt;0.01 mg/kg</span>
              <span className="kpi-label">{vi ? 'Ngưỡng kiểm soát dư lượng MRLs EU' : 'EU MRLs Detection Threshold'}</span>
            </div>
            <div className="kpi-divider" />
            <div className="kpi-box">
              <span className="kpi-num">Scope 3</span>
              <span className="kpi-label">{vi ? 'Khai báo phát thải CBAM theo GHG' : 'CBAM GHG Protocol Accounting'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Documentation 2-Column Section */}
      <div className="content-width compliance-body-wrapper">
        <div className="compliance-main-grid">
          {/* LEFT COLUMN: Sticky Documentation Navigation (30% width) */}
          <aside className="compliance-sidebar">
            <div className="sidebar-sticky-inner">
              <div className="sidebar-heading">
                <Scale size={14} />
                <span>{vi ? 'MỤC LỤC QUY CHUẨN' : 'STANDARDS DIRECTORY'}</span>
              </div>

              <nav className="sidebar-nav" aria-label={vi ? 'Mục lục quy chuẩn' : 'Standards directory'}>
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => scrollToSection(e, item.id)}
                    className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
                  >
                    <div className="nav-item-header">
                      <span className="nav-item-num">{item.num}</span>
                      <strong className="nav-item-title">{item.title}</strong>
                    </div>
                    <span className="nav-item-sub">{item.sub}</span>
                    <span className="nav-item-tag">{item.tag}</span>
                  </a>
                ))}
              </nav>

              {/* Sidebar Support Desk Mini-Card */}
              <div className="sidebar-desk-box">
                <div className="desk-box-header">
                  <div className="desk-pulse-dot" />
                  <strong>{vi ? 'B2B Compliance Desk' : 'B2B Compliance Desk'}</strong>
                </div>
                <p>
                  {vi
                    ? 'Quý đối tác cần tham chiếu COA mẫu, hồ sơ kiểm dịch hoặc báo cáo phát thải CBAM cụ thể?'
                    : 'Need sample COA data, quarantine records, or CBAM transport emission summaries?'}
                </p>
                <Button asChild size="sm" variant="brand" className="w-full">
                  <Link to={`/${lang}/contact?topic=compliance`}>
                    {vi ? 'Yêu cầu hồ sơ kỹ thuật' : 'Request Technical Dossier'}
                    <ArrowRight size={13} />
                  </Link>
                </Button>
              </div>

              <div className="sidebar-official-links">
                <span className="links-label">{vi ? 'NGUỒN THAM CHIẾU QUỐC TẾ' : 'REGULATORY SOURCES'}</span>
                <a href="https://www.ippc.int" target="_blank" rel="noopener noreferrer">
                  <span>IPPC / FAO Convention</span>
                  <ExternalLink size={12} />
                </a>
                <a href="https://www.efsa.europa.eu" target="_blank" rel="noopener noreferrer">
                  <span>EFSA European Standards</span>
                  <ExternalLink size={12} />
                </a>
                <a href="https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en" target="_blank" rel="noopener noreferrer">
                  <span>EU CBAM Portal (Taxation)</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Rich Prose Documentation (70% width) */}
          <main className="compliance-prose-content">
            {/* =========================================================
                SECTION 1: IPPC & ISPM 15
                ========================================================= */}
            <article id="ippc-ispm" className="doc-section">
              <div className="doc-section-header">
                <div className="doc-pillar-badge badge-green">
                  <Sprout size={12} />
                  <span>SECTION 01 · {vi ? 'RÀO CẢN KIỂM DỊCH THỰC VẬT' : 'PHYTOSANITARY BARRIERS'}</span>
                </div>
                <h2>
                  {vi
                    ? 'IPPC & Tiêu chuẩn ISPM - Rào cản Kiểm dịch Thực vật Toàn cầu'
                    : 'IPPC & ISPM Standards - Global Phytosanitary Defense & Packaging'}
                </h2>
                <div className="doc-authority-strip">
                  <span className="auth-chip">FAO / IPPC Secretariat</span>
                  <span className="auth-chip">EU Directive 2000/29/EC</span>
                  <span className="auth-chip">USDA-APHIS 7 CFR 319</span>
                  <span className="auth-chip">ISPM 15 HT Standard</span>
                </div>
              </div>

              {/* Exact Vietnamese Content Subsection: Nền tảng pháp lý */}
              <div className="legal-foundation-card">
                <div className="legal-card-header">
                  <Scale size={16} />
                  <strong>{vi ? 'Nền tảng pháp lý' : 'Legal Foundation'}</strong>
                </div>
                <p>
                  {vi ? (
                    <>
                      <strong>Công ước Bảo vệ Thực vật Quốc tế (IPPC)</strong> trực thuộc <strong>FAO</strong> (Tổ chức Lương thực và Nông nghiệp Liên Hợp Quốc).
                    </>
                  ) : (
                    <>
                      <strong>International Plant Protection Convention (IPPC)</strong> administered by the <strong>FAO</strong> (Food and Agriculture Organization of the United Nations).
                    </>
                  )}
                </p>
                <p className="legal-note">
                  {vi
                    ? 'Khung điều ước quốc tế ràng buộc ngăn ngừa sự du nhập và lây lan của dịch hại thực vật, áp dụng bắt buộc đối với tất cả thành viên WTO theo Hiệp định SPS.'
                    : 'Legally binding international treaty framework safeguarding global plant resources, applied across all WTO member nations under the SPS Agreement.'}
                </p>
              </div>

              {/* Exact Vietnamese Content Subsection: Thực thi đối với Nông sản */}
              <div className="doc-block">
                <h3>{vi ? 'Thực thi đối với Nông sản (Phytosanitary)' : 'Enforcement for Agricultural Produce (Phytosanitary)'}</h3>
                <div className="doc-paragraph-lead">
                  {vi ? (
                    <p>
                      Bất kỳ lô hàng chanh dây hay chuối Cavendish tươi nào nhập khẩu vào EU hoặc Mỹ đều bắt buộc phải có{' '}
                      <strong>Giấy chứng nhận kiểm dịch thực vật (Phytosanitary Certificate)</strong>. HMV Global đảm bảo
                      hàng hóa hoàn toàn không nhiễm các sinh vật gây hại (<em>quarantine pests</em>) theo danh mục kiểm dịch
                      nghiêm ngặt của EU (<strong>Chỉ thị 2000/29/EC</strong>) và <strong>USDA-APHIS (Mỹ)</strong>.
                    </p>
                  ) : (
                    <p>
                      Any fresh passion fruit or Cavendish banana shipment entering the EU or the United States strictly requires an official{' '}
                      <strong>Phytosanitary Certificate</strong>. HMV Global guarantees that every commercial consignment is certified 100% free of quarantine pests under stringent European standards (<strong>Directive 2000/29/EC</strong>) and <strong>USDA-APHIS (USA)</strong> regulations.
                    </p>
                  )}
                </div>

                <div className="doc-subcards-grid">
                  <div className="doc-subcard">
                    <div className="subcard-icon text-green">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4>{vi ? 'Kiểm soát Ruồi đục quả & Sâu bệnh' : 'Fruit Fly & Target Pest Screening'}</h4>
                      <p>
                        {vi
                          ? 'Kiểm tra nghiêm ngặt loài ruồi đục quả (Bactrocera dorsalis, Bactrocera correcta) và rệp sáp tại nguồn. 100% diện tích nhà đóng gói có bẫy sinh học và lưới chắn côn trùng chuẩn.'
                          : 'Systematic pre-harvest trapping and visual sorting for Bactrocera species and mealybugs. Packhouses operate sealed insect-proof netting barriers.'}
                      </p>
                    </div>
                  </div>

                  <div className="doc-subcard">
                    <div className="subcard-icon text-green">
                      <FileCheck2 size={18} />
                    </div>
                    <div>
                      <h4>{vi ? 'Mã số vùng trồng (PUC) & Cơ sở đóng gói (PHC)' : 'Registered Growing Units (PUC & PHC)'}</h4>
                      <p>
                        {vi
                          ? 'Mỗi lô hàng xuất khẩu đều liên kết trực tiếp với mã số vùng trồng được Cục Bảo vệ Thực vật cấp phép và đối chiếu đồng bộ với hệ thống TRACES NT của Châu Âu.'
                          : 'Every shipment maps directly to certified Production Unit Codes (PUC) and Packhouse Codes (PHC) synchronized with the EU TRACES NT customs gateway.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exact Vietnamese Content Subsection: Thực thi đối với Logistics (ISPM 15) */}
              <div className="doc-block">
                <h3>{vi ? 'Thực thi đối với Logistics (ISPM 15)' : 'Logistics Execution (ISPM 15 Wood Packaging)'}</h3>
                <div className="doc-paragraph-lead">
                  {vi ? (
                    <p>
                      Toàn bộ vật liệu đóng gói bằng gỗ (pallet, thùng mộc) đều được{' '}
                      <strong>xử lý nhiệt (HT - Heat Treatment)</strong> hoặc{' '}
                      <strong>xông hơi khử trùng (MB - Methyl Bromide)</strong> và đóng dấu hợp quy <strong>ISPM 15</strong>,
                      loại bỏ hoàn toàn rủi ro lô hàng bị giữ lại (<em>hold</em>) hoặc tiêu hủy tại cảng đến.
                    </p>
                  ) : (
                    <p>
                      All solid wood packaging materials (pallets, dunnage, crating) undergo certified{' '}
                      <strong>Heat Treatment (HT - 56°C core temp for 30+ minutes)</strong> or{' '}
                      <strong>Methyl Bromide fumigation (MB)</strong> and receive compliant official <strong>ISPM 15</strong> stamps, completely eliminating port detentions or destruction orders at destination terminals.
                    </p>
                  )}
                </div>

                {/* Visual ISPM 15 Stamp Simulator Card */}
                <div className="ispm-stamp-card">
                  <div className="stamp-graphic">
                    <div className="stamp-border">
                      <div className="stamp-ear">
                        <TreePine size={24} />
                        <span>IPPC</span>
                      </div>
                      <div className="stamp-details">
                        <strong>VN - 084</strong>
                        <span className="stamp-code">HT · [HMV-QC-PASS]</span>
                        <small>DB · NO BARK COMPLIANT</small>
                      </div>
                    </div>
                  </div>
                  <div className="stamp-explanation">
                    <h4>{vi ? 'Quy chuẩn đóng dấu hợp quy ISPM 15 HMV' : 'HMV ISPM 15 Certification Protocol'}</h4>
                    <ul>
                      <li>
                        <strong>VN:</strong> {vi ? 'Mã quốc gia ISO (Việt Nam)' : 'ISO country designation (Vietnam)'}
                      </li>
                      <li>
                        <strong>084:</strong> {vi ? 'Mã cơ sở khử trùng đăng ký kiểm định định kỳ' : 'Registered treatment provider accreditation number'}
                      </li>
                      <li>
                        <strong>HT:</strong> {vi ? 'Xử lý nhiệt thân thiện môi trường (Heat Treated 56°C/30m)' : 'Eco-compliant thermal treatment standard'}
                      </li>
                      <li>
                        <strong>100% Khử trùng:</strong> {vi ? 'Không dung thứ sâu bọ cánh cứng, tuyến trùng hại gỗ' : 'Zero tolerance for pinewood nematodes & wood-boring pests'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            {/* =========================================================
                SECTION 2: EFSA MRLs & FDA
                ========================================================= */}
            <article id="efsa-fda" className="doc-section">
              <div className="doc-section-header">
                <div className="doc-pillar-badge badge-cyan">
                  <Award size={12} />
                  <span>SECTION 02 · {vi ? 'HỆ THỐNG KIỂM SOÁT DƯ LƯỢNG' : 'CHEMICAL RESIDUES ARCHITECTURE'}</span>
                </div>
                <h2>
                  {vi
                    ? 'EFSA MRLs & FDA - Hệ thống Kiểm soát Dư lượng Hóa chất'
                    : 'EFSA MRLs & FDA - Chemical Residue & Laboratory Control System'}
                </h2>
                <div className="doc-authority-strip">
                  <span className="auth-chip">Regulation EC No 396/2005</span>
                  <span className="auth-chip">US FDA Title 21 CFR</span>
                  <span className="auth-chip">ISO/IEC 17025 Accreditations</span>
                  <span className="auth-chip">RASFF Zero-Alert Protocol</span>
                </div>
              </div>

              {/* Exact Vietnamese Content Subsection: Nền tảng pháp lý */}
              <div className="legal-foundation-card">
                <div className="legal-card-header">
                  <Scale size={16} />
                  <strong>{vi ? 'Nền tảng pháp lý' : 'Legal Foundation'}</strong>
                </div>
                <p>
                  {vi ? (
                    <>
                      <strong>Cơ quan An toàn Thực phẩm Châu Âu (EFSA - Regulation EC No 396/2005)</strong> và{' '}
                      <strong>Cục Quản lý Thực phẩm & Dược phẩm Hoa Kỳ (FDA/EPA)</strong>.
                    </>
                  ) : (
                    <>
                      <strong>European Food Safety Authority (EFSA - Regulation EC No 396/2005)</strong> and the{' '}
                      <strong>United States Food and Drug Administration / EPA (FDA/EPA)</strong>.
                    </>
                  )}
                </p>
                <p className="legal-note">
                  {vi
                    ? 'Khung định lượng pháp lý điều chỉnh giới hạn tối đa dư lượng thuốc bảo vệ thực vật trên và trong thực phẩm, bảo vệ tuyệt đối sức khỏe người tiêu dùng tại thị trường đích.'
                    : 'Statutory benchmarks governing maximum residue levels in food and feed crops, protecting public health with strict civil and border liability.'}
                </p>
              </div>

              {/* Exact Vietnamese Content Subsection: Thách thức MRLs */}
              <div className="doc-block">
                <h3>{vi ? 'Thách thức MRLs (Maximum Residue Levels)' : 'The MRLs Challenge (Maximum Residue Levels)'}</h3>
                <div className="doc-paragraph-lead">
                  {vi ? (
                    <p>
                      EU áp dụng mức dư lượng tối đa (<strong>MRLs</strong>) khắt khe nhất thế giới, thường ở mức{' '}
                      <strong>"không phát hiện" (0.01 mg/kg)</strong>. Vi phạm sẽ bị báo cáo lên{' '}
                      <strong>Hệ thống Cảnh báo Nhanh (RASFF - Rapid Alert System for Food and Feed)</strong>, gây thiệt hại nghiêm trọng.
                    </p>
                  ) : (
                    <p>
                      The European Union enforces the most rigorous Maximum Residue Levels (<strong>MRLs</strong>) worldwide, frequently set at the analytical limit of quantification—commonly designated as{' '}
                      <strong>"non-detect" (0.01 mg/kg)</strong>. Any detected breach triggers immediate flagging on the{' '}
                      <strong>Rapid Alert System for Food and Feed (RASFF)</strong>, inflicting devastating financial confiscation and brand damage.
                    </p>
                  )}
                </div>

                <div className="rasff-warning-callout">
                  <div className="warning-icon">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="warning-content">
                    <h4>{vi ? 'Rủi ro khi vướng cảnh báo RASFF tại Cảng Châu Âu' : 'Operational Ramifications of an EU RASFF Notification'}</h4>
                    <p>
                      {vi
                        ? 'Khi một container bị phát hiện vượt ngưỡng MRLs tại Rotterdam hoặc Hamburg: Lô hàng lập tức bị niêm phong, tiêu hủy hoặc tái xuất với chi phí nhà xuất khẩu chịu 100%. Toàn bộ các lô hàng tiếp theo của doanh nghiệp sẽ bị đưa vào danh sách kiểm soát tăng cường (tần suất kiểm tra 50%–100% tại cảng EU).'
                        : 'If an import container exceeds MRL thresholds at Rotterdam or Hamburg: The consignment is impounded for destruction or re-export at 100% exporter expense. Furthermore, subsequent shipments from that entity face enhanced physical border sampling (50% to 100% mandatory inspection rate).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Exact Vietnamese Content Subsection: Giải pháp từ HMV Global */}
              <div className="doc-block">
                <h3>{vi ? 'Giải pháp từ HMV Global' : 'HMV Global Integrated Solution'}</h3>
                <div className="doc-paragraph-lead">
                  {vi ? (
                    <p>
                      Năng lực logistics bắt đầu từ vùng trồng. <strong>Hệ thống truy xuất nguồn gốc (Traceability System)</strong> lưu trữ
                      nhật ký canh tác. HMV lấy mẫu test độc lập tại các phòng lab đạt chuẩn <strong>ISO/IEC 17025</strong> (như{' '}
                      <strong>Eurofins, SGS</strong>) trước khi thu hoạch, đảm bảo <strong>100%</strong> lô hàng xuất lên tàu đều có{' '}
                      <strong>chứng nhận phân tích (COA)</strong> vượt qua rào cản kỹ thuật (<strong>TBT</strong>).
                    </p>
                  ) : (
                    <p>
                      Logistics precision begins at the orchard roots. Our <strong>Traceability System</strong> archives day-by-day cultivation and pesticide spray logs. HMV executes blind pre-harvest testing at accredited{' '}
                      <strong>ISO/IEC 17025 laboratories</strong> (such as <strong>Eurofins and SGS</strong>), ensuring that <strong>100%</strong> of departed containers carry a certified{' '}
                      <strong>Certificate of Analysis (COA)</strong> seamlessly bypassing Technical Barriers to Trade (<strong>TBT</strong>).
                    </p>
                  )}
                </div>

                {/* 4-Stage Testing Pipeline Cards */}
                <div className="testing-pipeline">
                  <div className="pipeline-step">
                    <div className="step-num">Step 01</div>
                    <h4>{vi ? 'Giám Sát Nhật Ký Canh Tác' : 'Farm Spray Log Audit'}</h4>
                    <p>{vi ? 'Kiểm soát danh mục 500+ hoạt chất bị EU cấm, tuân thủ thời gian cách ly (PHI) tối thiểu 21 ngày.' : 'Auditing 500+ banned chemical compounds and enforcing 21-day pre-harvest intervals (PHI).'}</p>
                  </div>
                  <div className="pipeline-step">
                    <div className="step-num">Step 02</div>
                    <h4>{vi ? 'Lấy Mẫu Mù Độc Lập' : 'Blind Representative Sampling'}</h4>
                    <p>{vi ? 'Kỹ sư QC lấy mẫu ngẫu nhiên tại vườn trước thu hoạch 14 ngày, niêm phong mã vạch bảo mật.' : 'Independent QC technicians take randomized tree samples 14 days pre-harvest under tamper-evident seals.'}</p>
                  </div>
                  <div className="pipeline-step">
                    <div className="step-num">Step 03</div>
                    <h4>{vi ? 'Lab Test ISO 17025 (Eurofins/SGS)' : 'ISO 17025 Lab Analysis'}</h4>
                    <p>{vi ? 'Phân tích đa dư lượng GC-MS/MS và LC-MS/MS với giới hạn phát hiện 0.005–0.01 mg/kg.' : 'Multi-residue GC-MS/MS and LC-MS/MS screening with limit of detection calibrated to 0.005–0.01 mg/kg.'}</p>
                  </div>
                  <div className="pipeline-step">
                    <div className="step-num">Step 04</div>
                    <h4>{vi ? 'Cấp COA Kèm Vận Đơn B/L' : 'Validated COA Release'}</h4>
                    <p>{vi ? 'Chứng thư phân tích độc lập được đồng bộ cùng vận đơn gốc, CO EUR.1 và thông quan điện tử.' : 'Official COA released directly into buyer freight dossiers along with Bill of Lading and EUR.1.'}</p>
                  </div>
                </div>
              </div>
            </article>

            {/* =========================================================
                SECTION 3: CBAM & WIND ENERGY
                ========================================================= */}
            <article id="cbam-carbon" className="doc-section">
              <div className="doc-section-header">
                <div className="doc-pillar-badge badge-navy">
                  <Wind size={12} />
                  <span>SECTION 03 · {vi ? 'BIÊN GIỚI CARBON & ĐIỆN GIÓ' : 'CARBON BORDER & WIND ENERGY'}</span>
                </div>
                <h2>
                  {vi
                    ? 'CBAM & Logistics Dự án - Cơ chế Biên giới Carbon'
                    : 'CBAM & Project Logistics - Carbon Border Adjustment Mechanism'}
                </h2>
                <div className="doc-authority-strip">
                  <span className="auth-chip">Regulation EU 2023/956</span>
                  <span className="auth-chip">GHG Protocol Scope 3</span>
                  <span className="auth-chip">Breakbulk & Heavy Lift</span>
                  <span className="auth-chip">Net Zero Strategy</span>
                </div>
              </div>

              {/* Exact Vietnamese Content Subsection: Nền tảng pháp lý */}
              <div className="legal-foundation-card">
                <div className="legal-card-header">
                  <Scale size={16} />
                  <strong>{vi ? 'Nền tảng pháp lý' : 'Legal Foundation'}</strong>
                </div>
                <p>
                  {vi ? (
                    <>
                      <strong>Cơ chế Điều chỉnh Biên giới Carbon của EU (CBAM - Regulation EU 2023/956)</strong>.
                    </>
                  ) : (
                    <>
                      <strong>European Union Carbon Border Adjustment Mechanism (CBAM - Regulation EU 2023/956)</strong>.
                    </>
                  )}
                </p>
                <p className="legal-note">
                  {vi
                    ? 'Chính sách công cụ khí hậu mang tính bước ngoặt của EU nhằm cân bằng giá phát thải carbon giữa hàng hóa sản xuất nội địa và hàng nhập khẩu, áp dụng trong giai đoạn chuyển tiếp từ 10/2023 và chính thức thu thuế carbon từ 2026.'
                    : 'Landmark EU climate policy tool equalizing carbon price benchmarks between domestic production and imports, active in transition reporting since October 2023 with mandatory carbon levies phasing in.'}
                </p>
              </div>

              {/* Exact Vietnamese Content Subsection: Tác động đến Điện gió */}
              <div className="doc-block">
                <h3>{vi ? 'Tác động đến Điện gió' : 'Impact on Wind Energy & Structural Cargo'}</h3>
                <div className="doc-paragraph-lead">
                  {vi ? (
                    <p>
                      CBAM đánh thuế carbon lên các hàng hóa nhập khẩu có mức phát thải cao như <strong>Sắt, Thép và Nhôm</strong>{' '}
                      - các vật liệu cốt lõi cấu thành nên <strong>tuabin (turbine), tháp (tower) và móng điện gió ngoài khơi</strong>.
                    </p>
                  ) : (
                    <p>
                      CBAM imposes direct carbon financial liabilities on high-emission imported categories including{' '}
                      <strong>Iron, Steel, and Aluminum</strong>—the fundamental structural building blocks constituting modern{' '}
                      <strong>wind turbines, tubular steel towers, transition pieces, and offshore monopile foundations</strong>.
                    </p>
                  )}
                </div>

                <div className="cbam-material-breakdown">
                  <div className="material-card">
                    <div className="material-icon">
                      <Cpu size={20} />
                    </div>
                    <strong>{vi ? 'Tháp Tuabin Thép' : 'Tubular Steel Towers'}</strong>
                    <p>{vi ? 'Kết cấu thép hợp kim nặng 150–400 tấn, chịu định mức phát thải trực tiếp (Direct Embedded Emissions).' : '150–400 ton structural alloy steel assemblies subject to direct embedded emissions measurement.'}</p>
                  </div>
                  <div className="material-card">
                    <div className="material-icon">
                      <Layers size={20} />
                    </div>
                    <strong>{vi ? 'Móng & Cấu Kiện Ngoài Khơi' : 'Offshore Foundations'}</strong>
                    <p>{vi ? 'Móng cọc thép và Jacket siêu trường siêu trọng yêu cầu báo cáo minh bạch chuỗi cung ứng vật liệu.' : 'Heavy-lift steel monopiles and jacket sub-structures requiring comprehensive origin emission tracking.'}</p>
                  </div>
                  <div className="material-card">
                    <div className="material-icon">
                      <Truck size={20} />
                    </div>
                    <strong>{vi ? 'Vận Tải Dự Án (OOG)' : 'Oversized Project Freight'}</strong>
                    <p>{vi ? 'Vận chuyển biển Breakbulk đa phương thức yêu cầu hệ số phát thải theo tấn-hải lý chính xác.' : 'Specialized breakbulk ocean freight requiring certified tonne-kilometer greenhouse gas reporting.'}</p>
                  </div>
                </div>
              </div>

              {/* Exact Vietnamese Content Subsection: Sự sẵn sàng của HMV Global */}
              <div className="doc-block">
                <h3>{vi ? 'Sự sẵn sàng của HMV Global' : 'HMV Global Readiness & Scope 3 Execution'}</h3>
                <div className="doc-paragraph-lead">
                  {vi ? (
                    <p>
                      Khi điều phối logistics cho các cấu kiện điện gió khổng lồ (<strong>OOG & Breakbulk</strong>), HMV Global hỗ trợ minh bạch
                      hóa dữ liệu phát thải (<strong>Embedded Emissions Data</strong>) trong khâu vận tải. Việc sẵn sàng các báo cáo phát
                      thải (<strong>Scope 3 Emissions theo chuẩn GHG Protocol</strong>) giúp đối tác EPC thuận lợi kê khai CBAM, tránh phạt
                      nặng và giữ vững tiến độ dự án.
                    </p>
                  ) : (
                    <p>
                      When coordinating heavy-lift logistics for massive wind turbine structures (<strong>OOG & Breakbulk</strong>), HMV Global enables complete transparency of freight carbon data (<strong>Embedded Emissions Data</strong>). By pre-packaging verified transport emission reports (<strong>Scope 3 Emissions under the GHG Protocol</strong>), we empower EPC contractors to submit flawless CBAM declarations, eliminating financial penalty exposure and securing uninterrupted project timelines.
                    </p>
                  )}
                </div>

                {/* Scope 3 Readiness Grid */}
                <div className="scope3-readiness-box">
                  <div className="readiness-header">
                    <FileText size={18} />
                    <h4>{vi ? 'Hồ Sơ Hỗ Trợ Kê Khai CBAM Dành Cho Tổng Thầu EPC' : 'EPC CBAM Declarations Support Toolkit'}</h4>
                  </div>
                  <div className="readiness-grid">
                    <div className="readiness-item">
                      <CheckCircle2 size={16} className="text-cyan" />
                      <div>
                        <strong>{vi ? 'Tính toán Tấn-km (Tonne-km Emission Factors)' : 'Tonne-km Emission Factor Verification'}</strong>
                        <span>{vi ? 'Áp dụng hệ số phát thải chuẩn IMO / GLEC Framework cho từng chặng đường biển và bộ.' : 'Accurate IMO & GLEC framework calculation for multimodal sea and heavy-haul road legs.'}</span>
                      </div>
                    </div>
                    <div className="readiness-item">
                      <CheckCircle2 size={16} className="text-cyan" />
                      <div>
                        <strong>{vi ? 'Báo cáo mẫu CBAM XML tương thích EU Portal' : 'EU Registry-Compliant XML Templates'}</strong>
                        <span>{vi ? 'Hỗ trợ cấu trúc dữ liệu theo đúng định dạng nộp cổng thông tin Hải quan Châu Âu.' : 'Structured data outputs fully compatible with direct EU CBAM Transitional Registry upload.'}</span>
                      </div>
                    </div>
                    <div className="readiness-item">
                      <CheckCircle2 size={16} className="text-cyan" />
                      <div>
                        <strong>{vi ? 'Bảo đảm an toàn tiến độ không bị phạt' : 'Zero Regulatory Penalty Guarantee'}</strong>
                        <span>{vi ? 'Tránh mức phạt 10–50 Euro/tấn khí thải chưa báo cáo theo quy định của EC.' : 'Protecting EPC consortiums from 10–50 EUR per unreported tonne penalty sanctions.'}</span>
                      </div>
                    </div>
                    <div className="readiness-item">
                      <CheckCircle2 size={16} className="text-cyan" />
                      <div>
                        <strong>{vi ? 'Logistics xanh giảm phát thải tuyến Cát Lái - EU' : 'Optimized Low-Emission Ocean Routings'}</strong>
                        <span>{vi ? 'Ưu tiên các hãng tàu đạt chỉ số EEXI/CII hạng A & B trên tuyến Á - Âu.' : 'Partnering with ocean lines operating modern A & B CII energy-efficiency rated fleets.'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Bottom B2B Consultation Action Card */}
            <div className="compliance-bottom-action">
              <div className="bottom-action-content">
                <span className="action-tag">{vi ? 'ĐỐI TÁC THƯƠNG MẠI B2B & NHÀ THẦU EPC' : 'B2B COMMERCIAL PARTNERS & EPC CONTRACTORS'}</span>
                <h3>{vi ? 'Cần Thẩm Định Hồ Sơ Kỹ Thuật Cho Lô Hàng Của Bạn?' : 'Require Regulatory Verification for Your Consignments?'}</h3>
                <p>
                  {vi
                    ? 'HMV Global sẵn sàng cung cấp tài liệu kiểm dịch mẫu, chứng chỉ COA thực tế và phương án tính toán phát thải CBAM chi tiết cho kế hoạch xuất khẩu của quý doanh nghiệp.'
                    : 'HMV Global provides sample phytosanitary documents, verified lab COAs, and customized CBAM transport emission models tailored to your supply requirements.'}
                </p>
              </div>
              <div className="bottom-action-buttons">
                <Button asChild size="lg" variant="brand">
                  <Link to={`/${lang}/contact?topic=compliance`}>
                    {vi ? 'Liên hệ Ban Pháp chế & Kỹ thuật' : 'Contact Compliance Desk'}
                    <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to={`/${lang}/supply-chain`}>
                    {vi ? '← Quay lại Chuỗi cung ứng' : '← Back to Supply Chain'}
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
