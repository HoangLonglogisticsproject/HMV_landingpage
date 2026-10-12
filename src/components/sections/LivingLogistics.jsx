import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';

const markets = [
  { id: 'europe', label: 'EUROPE', x: 478, y: 150, route: 'M742 262 Q610 30 478 150' },
  { id: 'usa', label: 'USA', x: 210, y: 180, route: 'M742 262 Q476 60 210 180' },
];

export function LivingLogistics({ lang }) {
  const id = useId().replace(/:/g, '');
  const [selected, setSelected] = useState(null);
  const vi = lang === 'vi';
  return (
    <div className="living-logistics" role="group" aria-label={vi ? 'Kết nối thị trường mục tiêu từ Việt Nam' : 'Target market connections from Vietnam'}>
      <svg viewBox="0 0 900 380" className="living-map" aria-hidden="true">
        <defs>
          <pattern id={`${id}-dots`} width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" className="living-land-dot" /></pattern>
          <linearGradient id={`${id}-flow`} x1="742" y1="262" x2="210" y2="100" gradientUnits="userSpaceOnUse">
            <stop className="flow-green" /><stop offset="1" className="flow-blue" />
          </linearGradient>
        </defs>
        <path fill={`url(#${id}-dots)`} d="M90 110 C150 60 290 70 330 120 C350 170 300 220 250 240 C220 300 190 330 170 340 C150 280 120 230 90 200 Z M420 90 C470 60 560 70 600 100 C700 80 820 110 850 170 C830 230 760 270 720 280 C680 250 640 220 600 230 C560 260 540 330 500 340 C470 290 470 230 440 200 C420 160 410 120 420 90 Z" />
        {markets.map((market) => (
          <g key={market.id} className={`living-route living-route--${market.id}`}>
            <path d={market.route} className="living-route-base" />
            <path d={market.route} pathLength="100" stroke={`url(#${id}-flow)`} className="living-route-glow" />
            <path d={market.route} pathLength="100" stroke={`url(#${id}-flow)`} className="living-route-flow" />
            <circle cx={market.x} cy={market.y} r="5" className="living-destination" />
          </g>
        ))}
        <g className="living-origin">
          <circle cx="742" cy="262" r="24" className="living-radar" />
          <circle cx="742" cy="262" r="24" className="living-radar living-radar--second" />
          <circle cx="742" cy="262" r="11" className="living-origin-halo" />
          <circle cx="742" cy="262" r="6" className="living-origin-core" />
          <text x="742" y="300" textAnchor="middle" className="living-origin-label">VIETNAM</text>
        </g>
      </svg>
      {markets.map((market) => (
        <div key={market.id} className={`living-hub living-hub--${market.id}`} onMouseLeave={() => setSelected(null)}>
          <Button variant="ghost" className="living-hub-button" aria-expanded={selected === market.id} aria-describedby={selected === market.id ? `${id}-${market.id}-tip` : undefined}
            onMouseEnter={() => setSelected(market.id)} onFocus={() => setSelected(market.id)} onBlur={() => setSelected(null)}
            onClick={() => setSelected(selected === market.id ? null : market.id)} onKeyDown={(event) => { if (event.key === 'Escape') setSelected(null); }}>
            {market.label}
          </Button>
          {selected === market.id && <div role="tooltip" id={`${id}-${market.id}-tip`} className="living-tooltip">
            <span className="living-tooltip-sample">{vi ? 'DỮ LIỆU MẪU' : 'SAMPLE DATA'}</span>
            <strong>{vi ? 'Thị trường mục tiêu' : 'Target market'} · {market.label}</strong>
            <p>{vi ? 'Đường biển: 24–28 ngày' : 'Ocean freight: 24–28 days'}</p>
            <small>{vi ? 'Minh họa, không phải lịch trình xác nhận.' : 'Illustrative, not a confirmed schedule.'}</small>
          </div>}
        </div>
      ))}
    </div>
  );
}