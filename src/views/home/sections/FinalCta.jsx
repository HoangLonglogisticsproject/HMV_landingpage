'use client';
import { ArrowRight, ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { address } from '@/data/hmv';
import { focusQuickRfq } from '@/features/inquiries/focus';
import { openTradeDesk } from '@/features/trade-desk/open';
import { track } from '@/lib/analytics';
import styles from './HomeSections.module.css';

const leaders = [
  { name: 'Mr. Ho Quang Minh', role: { en: 'Chairman', vi: 'Chủ tịch' }, email: 'minhho@hmvglobal.com' },
  { name: 'Mr. Hieu Truong', role: { en: 'Managing Director', vi: 'Giám đốc điều hành' }, email: 'hieutruong@hmvglobal.com' },
  { name: 'Ms. Van Nguyen', role: { en: 'General Manager', vi: 'Tổng giám đốc' }, email: 'vannguyen@hmvglobal.com' },
];

// The end of the page: a reminder of the two lanes, not a second form. "Get Supply Proposal" takes the buyer back to the
// Quick RFQ at the top (with what they have typed there); the HMV Trade Desk is the assisted lane. The leadership's
// addresses are a quiet disclosure.
export function FinalCta({ lang }) {
  const vi = lang === 'vi';
  return (
    <section data-final-cta aria-labelledby="final-cta-title" className="bg-(image:--day-sky) py-16 max-[600px]:py-12">
      <div className="content-width grid gap-6">
        <div className="grid gap-5">
          <h2 id="final-cta-title" className={`${styles.heading} max-w-[640px] font-['Plus_Jakarta_Sans'] text-3xl leading-tight font-extrabold text-balance text-ink max-[600px]:text-[26px]`}>{vi ? 'Sẵn sàng trao đổi nhu cầu thu mua của bạn?' : 'Ready to discuss your sourcing requirement?'}</h2>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Button type="button" size="lg" className="day-cta rfq-submit" onClick={() => { track('home_supply_plan_click', { source: 'final', locale: lang }); focusQuickRfq(); }}>{vi ? 'Nhận phương án cung ứng' : 'Get Supply Proposal'}<ArrowRight size={18} /></Button>
            <button type="button" className="text-link inline-flex min-h-11 items-center" onClick={() => openTradeDesk({ source: 'home_final_assisted' })}>{vi ? 'Trao đổi với HMV Trade Desk' : 'Ask HMV Trade Desk'}<ArrowUpRight size={18} /></button>
          </div>
        </div>
        <details className="text-sm">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-brand">{vi ? 'Muốn liên hệ trực tiếp với HMV?' : 'Prefer to write to HMV directly?'}</summary>
          <ul className="leader-list">
            {leaders.map(({ name, role, email }) => (
              <li key={email}><span className="review-avatar">{name.split(' ').pop()[0]}</span><div><strong>{name}</strong><em>{role[lang]}</em><a href={`mailto:${email}`}><Mail size={14} />{email}</a></div></li>
            ))}
          </ul>
          <p className="rfq-office"><MapPin size={16} />{address}</p>
        </details>
      </div>
    </section>
  );
}
