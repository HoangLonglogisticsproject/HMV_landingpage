import { useId, useRef, useState } from 'react';

const VN = { cx: 742, cy: 262 };

const markets = [
  {
    id: 'europe',
    label: 'EUROPE',
    cx: 478,
    cy: 150,
    // Quadratic bezier control point for the arc from VN → Europe
    path: 'M742 262 Q610 30 478 150',
    // Tooltip position relative to the SVG hub
    tipSide: 'left',
    en: { freight: 'Ocean freight: 24–28 days', note: 'Rotterdam / Hamburg' },
    vi: { freight: 'Đường biển: 24–28 ngày', note: 'Rotterdam / Hamburg' },
  },
  {
    id: 'usa',
    label: 'USA',
    cx: 210,
    cy: 180,
    path: 'M742 262 Q476 60 210 180',
    tipSide: 'right',
    en: { freight: 'Ocean freight: 28–35 days', note: 'Los Angeles / New York' },
    vi: { freight: 'Đường biển: 28–35 ngày', note: 'Los Angeles / New York' },
  },
];

export function LivingLogistics({ lang }) {
  const uid = useId().replace(/:/g, '');
  const [active, setActive] = useState(null);
  const vi = lang === 'vi';

  return (
    <div
      className="living-logistics"
      role="group"
      aria-label={vi ? 'Kết nối thị trường mục tiêu từ Việt Nam' : 'Target market connections from Vietnam'}
    >
      <svg viewBox="0 0 900 380" className="living-map" aria-hidden="true">
        <defs>
          {/* Subtle land-mass dot pattern */}
          <pattern id={`${uid}-dots`} width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="var(--map-land)" opacity=".5" />
          </pattern>

          {/* Gradient for comet trails: green → blue */}
          {markets.map((m) => (
            <linearGradient
              key={m.id}
              id={`${uid}-grad-${m.id}`}
              gradientUnits="userSpaceOnUse"
              x1={VN.cx} y1={VN.cy}
              x2={m.cx} y2={m.cy}
            >
              <stop offset="0%" stopColor="var(--farm-green)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--ocean-blue)" stopOpacity="0.85" />
            </linearGradient>
          ))}

          {/* Glow filter */}
          <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Clip path for comet: animated stroke-dashoffset "runs" along the path */}
        </defs>

        {/* Landmass */}
        <path
          fill={`url(#${uid}-dots)`}
          d="M90 110 C150 60 290 70 330 120 C350 170 300 220 250 240 C220 300 190 330 170 340 C150 280 120 230 90 200 Z M420 90 C470 60 560 70 600 100 C700 80 820 110 850 170 C830 230 760 270 720 280 C680 250 640 220 600 230 C560 260 540 330 500 340 C470 290 470 230 440 200 C420 160 410 120 420 90 Z"
        />

        {/* Route arcs */}
        {markets.map((m) => (
          <g key={m.id}>
            {/* Ghost base line */}
            <path
              d={m.path}
              fill="none"
              stroke="var(--ocean-blue)"
              strokeWidth="1.2"
              strokeDasharray="5 7"
              opacity=".22"
            />
            {/* Glow halo — wide, blurred */}
            <path
              d={m.path}
              fill="none"
              stroke={`url(#${uid}-grad-${m.id})`}
              strokeWidth="6"
              strokeLinecap="round"
              opacity=".25"
              filter={`url(#${uid}-glow)`}
              className={`living-comet-glow living-comet-glow--${m.id}`}
            />
            {/* Comet head — narrow, animated dash running along path */}
            <path
              d={m.path}
              fill="none"
              stroke={`url(#${uid}-grad-${m.id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
              className={`living-comet living-comet--${m.id}`}
            />
            {/* Destination dot */}
            <circle
              cx={m.cx} cy={m.cy}
              r="5.5"
              fill="var(--ocean-blue)"
              className="living-dest"
            />
            {/* Destination label */}
            <text
              x={m.cx}
              y={m.cy - 14}
              textAnchor="middle"
              fill="var(--ink)"
              fontSize="11"
              fontWeight="700"
              letterSpacing=".18em"
            >
              {m.label}
            </text>
          </g>
        ))}

        {/* Vietnam origin — radar rings */}
        <g className="living-origin">
          <circle cx={VN.cx} cy={VN.cy} r="28" className="living-radar living-radar--1" />
          <circle cx={VN.cx} cy={VN.cy} r="28" className="living-radar living-radar--2" />
          {/* Inner glow ring */}
          <circle cx={VN.cx} cy={VN.cy} r="11" fill="var(--farm-green)" opacity=".22" />
          {/* Core dot */}
          <circle cx={VN.cx} cy={VN.cy} r="6" fill="var(--farm-green)" />
          <text
            x={VN.cx} y={VN.cy + 24}
            textAnchor="middle"
            fill="var(--ink)"
            fontSize="10"
            fontWeight="700"
            letterSpacing=".2em"
          >
            VIETNAM
          </text>
        </g>
      </svg>

      {/* Overlay hub buttons for tooltips — positioned via CSS relative to map */}
      {markets.map((m) => (
        <div
          key={m.id}
          className={`living-hub living-hub--${m.id}`}
          onMouseLeave={() => setActive(null)}
        >
          <button
            type="button"
            className="living-hub-btn"
            aria-expanded={active === m.id}
            aria-describedby={active === m.id ? `${uid}-tip-${m.id}` : undefined}
            onMouseEnter={() => setActive(m.id)}
            onFocus={() => setActive(m.id)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(active === m.id ? null : m.id)}
            onKeyDown={(e) => { if (e.key === 'Escape') setActive(null); }}
          >
            <span className="living-hub-dot" />
            {m.label}
          </button>

          {active === m.id && (
            <div
              role="tooltip"
              id={`${uid}-tip-${m.id}`}
              className={`living-tip living-tip--${m.tipSide}`}
            >
              <span className="living-tip-badge">{vi ? 'DỮ LIỆU MẪU' : 'SAMPLE DATA'}</span>
              <strong>{vi ? 'Thị trường mục tiêu' : 'Target market'} · {m.label}</strong>
              <p>{vi ? m.vi.freight : m.en.freight}</p>
              <p className="living-tip-sub">{vi ? m.vi.note : m.en.note}</p>
              <small>{vi ? 'Minh họa, không phải lịch trình xác nhận.' : 'Illustrative, not a confirmed schedule.'}</small>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
