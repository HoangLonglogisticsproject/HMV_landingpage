import { BrandLogo } from '@/components/common/BrandLogo';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { copy, address } from '@/data/hmv';
const mapSrc = 'https://www.google.com/maps?q=' + encodeURIComponent('240 Nguyen Dinh Chinh, Phu Nhuan, Ho Chi Minh City, Vietnam') + '&z=15&output=embed';
export function Footer({ lang }) {
  const t = copy[lang];
  const links = [
    ['logistics', 'Logistics'],
    ['packaging-logistics', lang === 'vi' ? 'Đóng gói & Vận chuyển' : 'Packaging & Freight'],
    ['supply-chain', t.supply],
    ['trade-solutions', lang === 'vi' ? 'Sản phẩm' : 'Products'],
    ['about', t.about],
    ['activities', t.activities],
    ['insights', 'EcoNews'],
    ['contact', t.contact]
  ];
  return (
    <footer className="site-footer premium-footer">
      <div className="content-width">
        <div className="pf-grid">
          <div className="pf-brand"><Link className="wordmark footer-wordmark" to={`/${lang}`}><BrandLogo /></Link><p className="footer-slogan">Connecting the world.</p><p>{t.footerLine}</p></div>
          <div><h3>{lang === 'vi' ? 'Trụ sở chính' : 'Headquarters'}</h3><p className="pf-row"><MapPin size={16} />{address}</p><a className="pf-row" href="mailto:vannguyen@hmvglobal.com"><Mail size={16} />vannguyen@hmvglobal.com</a></div>
          <nav aria-label={lang === 'vi' ? 'Liên kết nhanh' : 'Quick links'}><h3>{lang === 'vi' ? 'Liên kết nhanh' : 'Quick links'}</h3>{links.map(([path, label]) => <Link key={path} to={`/${lang}/${path}`}>{label}<ArrowUpRight size={14} /></Link>)}</nav>
          <div className="pf-map"><iframe title={lang === 'vi' ? 'Bản đồ trụ sở HMV Global' : 'HMV Global headquarters map'} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} {t.rights}</span><span>VIETNAM → THE WORLD</span></div>
      </div>
    </footer>
  );
}
