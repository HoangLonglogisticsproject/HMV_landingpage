import { ArrowUpRight, FileCheck, Handshake, Route, ShieldCheck } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { copy } from '@/data/hmv';
import styles from './HomeSections.module.css';

// The short proof layer between the products and the story of how HMV executes: the four commitments the home page
// already states (they were the list under the map, GlobalReach), and the way to the photographs of the real work. The
// heading is the site's own (copy.businessTitle). No figure, certification, name or promise is added.
const PILLARS = [
  { icon: Route, en: 'End-to-End Supply Chain', vi: 'Chuỗi cung ứng xuyên suốt' },
  { icon: ShieldCheck, en: 'Strict Quality Control', vi: 'Kiểm soát chất lượng chặt chẽ' },
  { icon: FileCheck, en: 'Export Documentation Coordination', vi: 'Điều phối chứng từ xuất khẩu' },
  { icon: Handshake, en: 'One Commercial Point of Contact', vi: 'Một đầu mối thương mại' },
];

export function TrustStrip({ lang }) {
  const t = copy[lang];
  return (
    <section aria-labelledby="trust-title" className="border-y border-border bg-surface py-14 max-[600px]:py-10">
      <div className="content-width grid gap-8 min-[901px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] min-[901px]:items-center min-[901px]:gap-14">
        <div>
          <p className="eyebrow">{t.businessLabel}</p>
          <h2 id="trust-title" className={`${styles.heading} font-['Plus_Jakarta_Sans'] text-3xl leading-tight font-extrabold text-ink max-[600px]:text-[26px]`}>{t.businessTitle}</h2>
        </div>
        <div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-5 min-[901px]:grid-cols-4">
            {PILLARS.map(({ icon: Icon, ...labels }) => (
              <li key={labels.en} className="flex flex-col gap-2.5 border-t-2 border-brand/25 pt-4 text-[15px] font-semibold text-ink">
                <Icon size={22} className="text-brand" aria-hidden="true" />
                {labels[lang]}
              </li>
            ))}
          </ul>
          <Link className="text-link mt-6 inline-flex min-h-11 items-center" to="/activities">{lang === 'vi' ? 'Xem HMV trong thực tế' : 'See HMV in action'}<ArrowUpRight size={18} /></Link>
        </div>
      </div>
    </section>
  );
}
