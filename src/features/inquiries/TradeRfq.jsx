'use client';
import { Mail, MapPin } from 'lucide-react';
import { address } from '@/data/hmv';
import { QuickRfq } from './QuickRfq';
import { quickRfqCopy } from './quickRfqCopy';

const leaders = [
  { name: 'Mr. Ho Quang Minh', role: { en: 'Chairman', vi: 'Chủ tịch' }, email: 'minhho@hmvglobal.com' },
  { name: 'Mr. Hieu Truong', role: { en: 'Managing Director', vi: 'Giám đốc điều hành' }, email: 'hieutruong@hmvglobal.com' },
  { name: 'Ms. Van Nguyen', role: { en: 'General Manager', vi: 'Tổng giám đốc' }, email: 'vannguyen@hmvglobal.com' },
];

// The homepage's sourcing section (`#initiate-trade`): the Quick RFQ, which sends a real inquiry through the same
// pipeline as the HMV Trade Desk. The leadership's addresses are a quiet disclosure, not part of the decision.
export function TradeRfq({ lang }) {
  const c = quickRfqCopy[lang];
  return (
    <section className="rfq-section" id="initiate-trade" aria-labelledby="rfq-title">
      <div className="content-width rfq-grid">
        <div className="rfq-info">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 id="rfq-title" className="text-balance">{c.title}</h2>
          <p className="rfq-lead">{c.lead}</p>
          <details className="text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-brand">{c.direct}</summary>
            <ul className="leader-list">
              {leaders.map(({ name, role, email }) => (
                <li key={email}><span className="review-avatar">{name.split(' ').pop()[0]}</span><div><strong>{name}</strong><em>{role[lang]}</em><a href={`mailto:${email}`}><Mail size={14} />{email}</a></div></li>
              ))}
            </ul>
            <p className="rfq-office"><MapPin size={16} />{address}</p>
          </details>
        </div>
        <QuickRfq lang={lang} />
      </div>
    </section>
  );
}
