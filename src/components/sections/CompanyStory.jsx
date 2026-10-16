import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Award,
  Target,
  Sparkles,
  Compass,
  CheckCircle2,
  Users,
  Briefcase,
  GraduationCap,
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy, photos } from '@/data/hmv';
import { foundingTeam, companyVisionMission } from '@/data/leadershipTeam';

export function CompanyStory({ lang, full = false }) {
  const t = copy[lang];
  const vi = lang === 'vi';
  const { vision, goals2028, mission, coreValues } = companyVisionMission;

  const getLeaderIcon = (index) => {
    switch (index) {
      case 0:
        return <ShieldCheck size={20} className="leader-icon" />;
      case 1:
        return <Briefcase size={20} className="leader-icon" />;
      case 2:
        return <GraduationCap size={20} className="leader-icon" />;
      case 3:
        return <Plane size={20} className="leader-icon" />;
      default:
        return <Award size={20} className="leader-icon" />;
    }
  };

  return (
    <div className="about-us-container">
      {/* 1. HERO / STORY INTRO SECTION */}
      {/* <section id="story" className="section-pad story-section">
        <div className="content-width story-grid">
          <div>
            <p className="eyebrow">{t.storyLabel}</p>
            <h2>{t.storyTitle}</h2>
            <p className="body-copy">
              {full
                ? vi
                  ? 'HMV Global là cầu nối thương mại nông sản và chuỗi cung ứng thực thi giữa Việt Nam và thế giới. Chúng tôi kết hợp nguồn nông sản sạch đạt chuẩn, kinh nghiệm hải quan dày dạn và điều phối vận tải quốc tế chuyên nghiệp.'
                  : 'HMV Global connects agricultural sourcing, processing coordination and international trade. Our focus is a coherent supply-chain approach built around the needs of international buyers with single point of contact.'
                : vi
                ? 'Kết nối nguồn nguyên liệu, chất lượng và thương mại quốc tế. HMV đồng hành từ vùng trồng đến yêu cầu của thị trường.'
                : 'Connecting agricultural origins, quality and international trade. HMV brings people and supply-chain coordination together.'}
            </p>

            {!full && (
              <Button variant="text" size="text" asChild>
                <Link to="/about">
                  {t.more}
                  <ArrowUpRight />
                </Link>
              </Button>
            )}
          </div>

          <figure className="story-figure">
            <img
              src={photos.farm}
              alt={vi ? 'Chanh dây tại vùng trồng' : 'Passion fruit at the growing area'}
              width="1280"
              height="960"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>HMV GLOBAL · CONNECTING THE WORLD</span>
              <p>{t.storyQuote}</p>
            </figcaption>
          </figure>
        </div>
      </section> */}

      {/* FULL ABOUT PAGE SECTIONS */}
      {full && (
        <>
          {/* 2. VISION, MISSION, 2028 GOALS & CORE VALUES */}
          <section className="section-pad vision-mission-section">
            <div className="content-width">
              <div className="section-heading-center">
                <span className="eyebrow">
                  <Compass size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  {vi ? 'ĐỊNH HƯỚNG PHÁT TRIỂN' : 'STRATEGIC PURPOSE'}
                </span>
                <h2>{vi ? 'Tầm Nhìn, Sứ Mệnh & Giá Trị Cốt Lõi' : 'Vision, Mission & Core Values'}</h2>
                <p>
                  {vi
                    ? 'Cam kết phụng sự nền nông nghiệp xuất khẩu và chuỗi cung ứng logistics tin cậy của Việt Nam vươn tầm quốc tế.'
                    : 'Dedicated to connecting certified Vietnamese agro-commodities to the global arena with absolute reliability.'}
                </p>
              </div>

              {/* DUAL PILLARS: VISION & MISSION */}
              <div className="vm-dual-grid">
                {/* VISION CARD */}
                <div className="vm-card vm-vision-card">
                  <div className="vm-card-tag">
                    <Sparkles size={16} />
                    <span>{vi ? vision.titleVi : vision.titleEn}</span>
                  </div>
                  <h3>&ldquo;{vi ? vision.quoteVi : vision.quoteEn}&rdquo;</h3>

                  {/* 2028 GOAL EMBEDDED */}
                  <div className="vm-goal-box">
                    <div className="vm-goal-title">
                      <Target size={18} className="goal-icon" />
                      <strong>{vi ? goals2028.titleVi : goals2028.titleEn}</strong>
                    </div>
                    <p className="vm-goal-desc">{vi ? goals2028.descVi : goals2028.descEn}</p>
                    <div className="market-badges-wrap">
                      {goals2028.markets.map((m) => (
                        <span key={m.name} className="market-badge">
                          <span className="market-flag">{m.flag}</span>
                          <span>{m.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MISSION CARD */}
                <div className="vm-card vm-mission-card">
                  <div className="vm-card-tag">
                    <Globe size={16} />
                    <span>{vi ? mission.titleVi : mission.titleEn}</span>
                  </div>
                  <h3>{vi ? 'Giải Pháp Trọn Gói End-to-End' : 'End-to-End Supply Chain Execution'}</h3>
                  <p className="vm-mission-body">{vi ? mission.descVi : mission.descEn}</p>

                  <div className="vm-highlights">
                    <div className="vm-highlight-item">
                      <CheckCircle2 size={18} className="check-icon" />
                      <div>
                        <strong>{vi ? 'Tìm kiếm nguồn hàng chất lượng' : 'Quality Product Sourcing'}</strong>
                        <span>{vi ? 'Nông sản chọn lọc đạt chuẩn GlobalGAP' : 'Vetted farms meeting export standards'}</span>
                      </div>
                    </div>
                    <div className="vm-highlight-item">
                      <CheckCircle2 size={18} className="check-icon" />
                      <div>
                        <strong>{vi ? 'Kiểm soát tiêu chuẩn kỹ thuật' : 'Rigorous Standard Controls'}</strong>
                        <span>{vi ? 'Kiểm nghiệm dư lượng MRLs và chứng thư kiểm dịch' : 'MRLs pesticide validation & phytosanitary'}</span>
                      </div>
                    </div>
                    <div className="vm-highlight-item">
                      <CheckCircle2 size={18} className="check-icon" />
                      <div>
                        <strong>{vi ? 'Thủ tục xuất khẩu & giao tận nơi' : 'Export Clearance & Door Delivery'}</strong>
                        <span>{vi ? 'Một đầu mối duy nhất cho mọi quy trình (Single Contact)' : 'Delivered to door with a single point of contact'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CORE VALUES 4-GRID */}
              <div className="core-values-wrap">
                <div className="cv-header">
                  <h4>{vi ? '4 Giá Trị Cốt Lõi (Core Values)' : 'Four Pillars of Value'}</h4>
                </div>
                <div className="core-values-grid">
                  {coreValues.map((cv) => (
                    <div key={cv.key} className="cv-item">
                      <span className="cv-bullet" />
                      <h5>{vi ? cv.titleVi : cv.titleEn}</h5>
                      <p>{vi ? cv.descVi : cv.descEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. FOUNDING TEAM & LEADERSHIP SECTION */}
          <section className="section-pad leadership-section">
            <div className="content-width">
              <div className="section-heading-center">
                <span className="eyebrow">
                  <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  {vi ? 'ĐỘI NGŨ SÁNG LẬP & LÃNH ĐẠO' : 'FOUNDING TEAM & LEADERSHIP'}
                </span>
                <h2>{vi ? 'Hội Đồng Sáng Lập HMV Global' : 'Founding Team Expertise'}</h2>
                <p className="team-intro-lead">
                  {vi
                    ? 'Đội ngũ sáng lập sở hữu bề dày kinh nghiệm sâu rộng trong hải quan, thương mại quốc tế, logistics & chuỗi cung ứng, cùng chuyên gia trình độ Tiến sĩ về nông nghiệp sạch xuất khẩu.'
                    : 'A founding team with deep experience in customs, international trade, logistics and supply chain, plus PhD-level expertise in clean agriculture for export.'}
                </p>
              </div>

              <div className="leadership-cards-grid">
                {foundingTeam.map((leader, idx) => (
                  <div key={leader.name} className="leader-card">
                    <div className="leader-card-top">
                      <div className="leader-icon-circle">
                        {getLeaderIcon(idx)}
                      </div>
                      <span className="leader-exp-badge">
                        {vi ? leader.badgeVi : leader.badgeEn}
                      </span>
                    </div>

                    <div className="leader-info">
                      <h3 className="leader-name">{leader.name}</h3>
                      <p className="leader-role">{vi ? leader.roleVi : leader.roleEn}</p>
                    </div>

                    <p className="leader-expertise">
                      {vi ? leader.expertiseVi : leader.expertiseEn}
                    </p>

                    <div className="leader-tags">
                      {leader.specialties.map((s) => (
                        <span key={s} className="specialty-tag">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* TEAM COMMITTED BANNER */}
              <div className="team-committed-banner">
                <div className="banner-left">
                  <h4>{vi ? 'Kết Nối Thế Giới Với Tinh Thần Trách Nhiệm' : 'Connecting the World with Integrity'}</h4>
                  <p>
                    {vi
                      ? 'Kinh nghiệm kết hợp giữa chuyên môn kỹ thuật hải quan 30 năm, học thuật nông nghiệp Tiến sĩ và hạ tầng logistics đa phương thức.'
                      : 'Combining 30 years of customs knowledge, agricultural PhD rigor, and global logistics execution into one unified partner.'}
                  </p>
                </div>
                <Button asChild size="lg" variant="brand">
                  <Link to="/contact">
                    {t.contact}
                    <ArrowUpRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
