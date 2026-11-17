'use client';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { products } from '@/data/hmv';

const WIND = [
  { en: 'Onshore & Offshore Wind Projects', vi: 'Dự án điện gió trên bờ & ngoài khơi' },
  { en: 'Turbine & Infrastructure Supply Chain', vi: 'Chuỗi vật tư & cấu kiện tuabin' },
  { en: 'Green Transition & Net Zero Goals', vi: 'Chuyển đổi xanh & Tiêu chuẩn CBAM' },
];

// The four logistics services, each a group of links into its section of /logistics.
const LOGISTICS = [
  {
    key: 'dg',
    to: '/logistics#dangerous-goods',
    title: 'Specializing for Dangerous goods handling',
    toggle: 'Toggle Dangerous Goods menu',
    links: [
      { to: '/logistics#dg-air-sea', en: 'Dangerous Goods by Air & Sea', vi: 'Dangerous Goods by Air & Sea' },
      { to: '/logistics#special-cargoes', en: 'Special cargoes handling', vi: 'Special cargoes handling' },
      { to: '/logistics#general-cargoes', en: 'General Cargoes Handling', vi: 'General Cargoes Handling' },
      { to: '/logistics#factory-tour', en: 'Factory Tour', vi: 'Factory Tour' },
    ],
  },
  {
    key: 'cb',
    to: '/logistics#cross-border',
    title: 'Crossed border Vietnam - Cambodia',
    toggle: 'Toggle Cross Border menu',
    links: [
      { to: '/logistics#cross-border', en: 'Cross-border container drayage', vi: 'Vận tải container liên vận (VN ⇄ KH)' },
      { to: '/logistics#cross-border', en: 'Dual customs clearance (Moc Bai, Xa Mat, Hoa Lu)', vi: 'Thông quan 2 đầu cửa khẩu (Mộc Bài, Xa Mát, Hoa Lư)' },
      { to: '/logistics#cross-border', en: 'Express 12-24h transit (HCMC ⇄ Phnom Penh)', vi: 'Vận chuyển nhanh 12-24h (HCM ⇄ Phnom Penh)' },
    ],
  },
  {
    key: 'local',
    to: '/logistics#local-agency',
    title: 'Local agency handling in Vietnam',
    toggle: 'Toggle Local Agency menu',
    links: [
      { to: '/logistics#local-agency', en: 'Inbound consignee desk & D/O release', vi: 'Đại lý hàng đến & Phát hành D/O' },
      { to: '/logistics#local-agency', en: 'VNACCS electronic customs brokerage', vi: 'Khai thuê hải quan điện tử VNACCS' },
      { to: '/logistics#local-agency', en: 'Inland drayage for HPH, DAD, SGN, VUT hubs', vi: 'Vận tải nội địa bao phủ cảng HPH, DAD, SGN, VUT' },
    ],
  },
  {
    key: 'oversea',
    to: '/logistics#oversea-agency',
    title: 'Oversea agency networking ( JC Trans Membership )',
    toggle: 'Toggle Oversea Agency menu',
    links: [
      { to: '/logistics#oversea-agency', en: 'JC Trans GCP financial protection fund', vi: 'Bảo chứng tài chính quốc tế (GCP Protection)' },
      { to: '/logistics#oversea-agency', en: 'Global DDP, DAP & Ex-Works door delivery', vi: 'Dịch vụ DDP, DAP, Ex-Works toàn cầu' },
      { to: '/logistics#oversea-agency', en: '10,000+ partner forwarders across 160+ countries', vi: 'Mạng lưới 10,000+ đại lý tại 160+ quốc gia' },
    ],
  },
];

/** One group of the menu: its title links to the section, and the toggle shows or hides its links. */
function NavGroup({ to, title, titleStyle, toggleLabel, chevronSize = 14, listStyle, open, onToggle, close, children }) {
  return (
    <div className="log-text-group">
      <div className={`log-text-parent-row ${open ? 'is-active-dropdown' : ''}`}>
        <Link to={to} onClick={close} className="log-parent-title" style={titleStyle}>
          {title}
        </Link>
        <button
          type="button"
          className={`log-parent-toggle ${open ? 'is-open' : ''}`}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          aria-label={toggleLabel}
          aria-expanded={open}
        >
          <ChevronDown size={chevronSize} />
        </button>
      </div>

      {open && (
        <div className="log-text-sublist" style={listStyle}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * The supply chain mega dropdown: commodities, wind energy, logistics and its four services, and the overview.
 * Which groups are open is the header's state (`groups`), so they reopen as the visitor left them.
 */
export function SupplyChainMenu({ lang, close, groups, toggleGroup }) {
  const vi = lang === 'vi';
  const group = key => ({ open: Boolean(groups[key]), onToggle: () => toggleGroup(key), close });
  return (
    <div className="dropdown-panel logistics-text-dropdown" role="menu">
      <NavGroup
        to="/supply-chain#commodities"
        title={vi ? 'Nông nghiệp & Nông sản xuất khẩu' : 'Farming & Export Commodities'}
        toggleLabel="Toggle Farming Commodities menu"
        {...group('farming')}
      >
        {products.map(p => (
          <Link key={p.id} to={`/products/${p.id}`} onClick={close}>
            {p[lang]}
          </Link>
        ))}
        <Link to="/supply-chain#commodities" onClick={close} style={{ fontWeight: 600, color: 'var(--brand, #00297b)', marginTop: '4px' }}>
          {vi ? 'Tất cả sản phẩm & quy cách' : 'All products & specifications'}
        </Link>
      </NavGroup>

      <NavGroup
        to="/supply-chain#wind-energy"
        title={vi ? 'Dự án & Năng lượng điện gió' : 'Wind Energy & Clean Horizons'}
        toggleLabel="Toggle Wind Energy menu"
        {...group('wind')}
      >
        {WIND.map(l => (
          <Link key={l.en} to="/supply-chain#wind-energy" onClick={close}>
            {l[lang]}
          </Link>
        ))}
      </NavGroup>

      <NavGroup to="/logistics" title="Logistics" toggleLabel="Toggle Logistics menu" listStyle={{ paddingLeft: '12px' }} {...group('logistics')}>
        {LOGISTICS.map(s => (
          <NavGroup key={s.key} to={s.to} title={s.title} titleStyle={{ fontSize: '13px' }} toggleLabel={s.toggle} chevronSize={13} {...group(s.key)}>
            {s.links.map(l => (
              <Link key={l.en} to={l.to} onClick={close}>
                {l[lang]}
              </Link>
            ))}
          </NavGroup>
        ))}
      </NavGroup>

      <div className="log-text-group">
        <div className="log-text-parent-row">
          <Link to="/supply-chain" onClick={close} className="log-parent-title" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            {vi ? 'Tổng quan chuỗi cung ứng HMV' : 'HMV Supply Chain Overview'}
          </Link>
        </div>
      </div>
    </div>
  );
}
