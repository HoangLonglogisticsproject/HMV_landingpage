'use client';
import { useState } from 'react';
import { Mail, MapPin } from 'lucide-react';
import { address } from '@/data/hmv';
import { toRfqRow } from './rfq';
import { createInquiryMailto } from './inquiry';
import { RfqSubmit } from './RfqSubmit';

const commodities = ['Passion Fruit', 'Dried Cassava Chips', 'Cavendish Bananas', 'Dragon Fruit', 'Spices (Pepper, Cinnamon, Star Anise)', 'Cashew Nuts', 'Tapioca Starch', 'Other'];
const leaders = [
  ['Mr. Ho Quang Minh', { en: 'Chairman', vi: 'Chủ tịch' }, 'minhho@hmvglobal.com'],
  ['Mr. Hieu Truong', { en: 'Managing Director', vi: 'Giám đốc điều hành' }, 'hieutruong@hmvglobal.com'],
  ['Ms. Van Nguyen', { en: 'General Manager', vi: 'Tổng giám đốc' }, 'vannguyen@hmvglobal.com'],
];

export function TradeRfq({ lang }) {
  const vi = lang === 'vi';
  const [state, setState] = useState('idle');
  const L = (e, v) => (vi ? v : e);
  const submit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    // Reuse the RFQ validation rules, then hand the brief to the user's email app.
    try { toRfqRow(data, lang); } catch { setState('invalid'); return; }
    window.location.href = createInquiryMailto(data);
    setState('done');
  };
  return (
    <section className="rfq-section" id="initiate-trade" aria-labelledby="rfq-title">
      <div className="content-width rfq-grid">
        <div className="rfq-info">
          <p className="eyebrow">RFQ · REQUEST FOR QUOTATION</p>
          <h2 id="rfq-title">{L('Discuss Your Sourcing Requirements', 'Trao đổi nhu cầu thu mua')}</h2>
          <p className="rfq-lead">{L('Share your product, estimated volume, destination and key requirements so HMV Global can review the sourcing and trade brief.', 'Chia sẻ sản phẩm, sản lượng dự kiến, thị trường đích và các yêu cầu chính để HMV Global xem xét nhu cầu nguồn hàng và giao thương.')}</p>
          <ul className="leader-list">
            {leaders.map(([n, r, m]) => (
              <li key={m}><span className="review-avatar">{n.split(' ').pop()[0]}</span><div><strong>{n}</strong><em>{r[lang]}</em><a href={`mailto:${m}`}><Mail size={14} />{m}</a></div></li>
            ))}
          </ul>
          <p className="rfq-office"><MapPin size={16} />{address}</p>
        </div>
        <form className="rfq-form glass" onSubmit={submit}>
          <div className="rfq-fields">
            <label>{L('Company Name', 'Tên doanh nghiệp')}<input name="company" required maxLength={150} autoComplete="organization" /></label>
            <label>{L('Work Email', 'Email công việc')}<input name="email" type="email" required maxLength={255} autoComplete="email" inputMode="email" /></label>
            <label>{L('Commodity of Interest', 'Sản phẩm quan tâm')}<select name="product" required defaultValue=""><option value="" disabled>{L('Select a commodity', 'Chọn sản phẩm')}</option>{commodities.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label>{L('Estimated Volume', 'Sản lượng dự kiến')}<input name="volume" maxLength={100} placeholder={L('e.g. 2 × 40ft / month', 'VD: 2 cont 40ft / tháng')} /></label>
            <label className="rfq-wide">{L('Destination Port', 'Cảng đến')}<input name="port" maxLength={100} placeholder={L('e.g. Rotterdam, Los Angeles', 'VD: Rotterdam, Los Angeles')} /></label>
            <label className="rfq-wide">{L('Message', 'Lời nhắn')}<textarea name="message" rows={4} required maxLength={3000} /></label>
          </div>
          <RfqSubmit lang={lang} state={state} onReset={() => setState('idle')} invalidText={L('Please check your company, work email and commodity.', 'Vui lòng kiểm tra tên doanh nghiệp, email và sản phẩm.')} />
        </form>
      </div>
    </section>
  );
}
