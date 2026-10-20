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

// Icons are presentation: assigned by position, whatever the CMS team order is.
const leaderIcons = [ShieldCheck, Briefcase, GraduationCap, Plane];

// `content` is the About page copy for one language (data/about.js, or the CMS `about` page).
export function CompanyStory({ content }) {
  const { purpose, vision, mission, values, team } = content;

  return (
    <div className="about-us-container">
      {/* VISION, MISSION, 2028 GOALS & CORE VALUES */}
      <section className="section-pad vision-mission-section">
        <div className="content-width">
          <div className="section-heading-center">
            <span className="eyebrow">
              <Compass size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              {purpose.eyebrow}
            </span>
            <h2>{purpose.title}</h2>
            <p>{purpose.intro}</p>
          </div>

          {/* DUAL PILLARS: VISION & MISSION */}
          <div className="vm-dual-grid">
            {/* VISION CARD */}
            <div className="vm-card vm-vision-card">
              <div className="vm-card-tag">
                <Sparkles size={16} />
                <span>{vision.label}</span>
              </div>
              <h3>&ldquo;{vision.quote}&rdquo;</h3>

              {/* 2028 GOAL EMBEDDED */}
              <div className="vm-goal-box">
                <div className="vm-goal-title">
                  <Target size={18} className="goal-icon" />
                  <strong>{vision.goalTitle}</strong>
                </div>
                <p className="vm-goal-desc">{vision.goalText}</p>
                <div className="market-badges-wrap">
                  {vision.markets.map((m, i) => (
                    <span key={i} className="market-badge">
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
                <span>{mission.label}</span>
              </div>
              <h3>{mission.title}</h3>
              <p className="vm-mission-body">{mission.text}</p>

              <div className="vm-highlights">
                {mission.highlights.map((h, i) => (
                  <div key={i} className="vm-highlight-item">
                    <CheckCircle2 size={18} className="check-icon" />
                    <div>
                      <strong>{h.title}</strong>
                      <span>{h.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CORE VALUES 4-GRID */}
          <div className="core-values-wrap">
            <div className="cv-header">
              <h4>{values.title}</h4>
            </div>
            <div className="core-values-grid">
              {values.items.map((cv, i) => (
                <div key={i} className="cv-item">
                  <span className="cv-bullet" />
                  <h5>{cv.title}</h5>
                  <p>{cv.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDING TEAM & LEADERSHIP SECTION */}
      <section className="section-pad leadership-section">
        <div className="content-width">
          <div className="section-heading-center">
            <span className="eyebrow">
              <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              {team.eyebrow}
            </span>
            <h2>{team.title}</h2>
            <p className="team-intro-lead">{team.intro}</p>
          </div>

          <div className="leadership-cards-grid">
            {team.members.map((leader, idx) => {
              const Icon = leaderIcons[idx] ?? Award;
              return (
                <div key={idx} className="leader-card">
                  <div className="leader-card-top">
                    <div className="leader-icon-circle">
                      <Icon size={20} className="leader-icon" />
                    </div>
                    <span className="leader-exp-badge">{leader.badge}</span>
                  </div>

                  <div className="leader-info">
                    <h3 className="leader-name">{leader.name}</h3>
                    <p className="leader-role">{leader.role}</p>
                  </div>

                  <p className="leader-expertise">{leader.bio}</p>

                  <div className="leader-tags">
                    {leader.specialties.map((s, i) => (
                      <span key={i} className="specialty-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* TEAM COMMITTED BANNER */}
          <div className="team-committed-banner">
            <div className="banner-left">
              <h4>{team.closingTitle}</h4>
              <p>{team.closingText}</p>
            </div>
            <Button asChild size="lg" variant="brand">
              <Link to="/contact">
                {team.ctaLabel}
                <ArrowUpRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
