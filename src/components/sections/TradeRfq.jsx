import { useState } from 'react';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { address } from '@/data/hmv';
import { toRfqRow } from '@/lib/rfq';
import { createInquiryMailto } from '@/lib/inquiry';

const commodities = ['Passion Fruit', 'Cavendish Bananas', 'Dragon Fruit', 'Spices (Pepper, Cinnamon, Star Anise)', 'Cashew Nuts', 'Tapioca Starch', 'Other'];
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
          <h2 id="rfq-title">{L('Initiate Trade', 'Bắt đầu giao thương')}</h2>
          <p className="rfq-lead">{L('Share your commodity, volume and destination. Our leadership team reviews every brief personally.', 'Chia sẻ sản phẩm, sản lượng và cảng đến. Ban lãnh đạo HMV trực tiếp xem xét từng yêu cầu.')}</p>
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
          {state === 'done' ? (
            <div className="rfq-success" role="status"><span>✓</span><p>{L('Email draft prepared. Send it from your email application, or write to vannguyen@hmvglobal.com directly.', 'Đã chuẩn bị email. Hãy gửi từ ứng dụng email của bạn, hoặc liên hệ trực tiếp vannguyen@hmvglobal.com.')}</p><button type="button" onClick={() => setState('idle')}>{L('Prepare another request', 'Soạn yêu cầu khác')}</button></div>
          ) : (
            <>
              <Button type="submit" size="lg" className="day-cta rfq-submit">{L('Prepare RFQ email', 'Soạn email yêu cầu báo giá')}<ArrowUpRight size={18} /></Button>
              <p className="form-note">{L('Opens a draft in your email app. Your request is not sent until you send that email.', 'Mở bản nháp trong ứng dụng email. Yêu cầu chỉ được gửi khi bạn gửi email đó.')}</p>
            </>
          )}
          {state === 'invalid' && <p role="alert" className="rfq-error">{L('Please check your company, work email and commodity.', 'Vui lòng kiểm tra tên doanh nghiệp, email và sản phẩm.')}</p>}
        </form>
      </div>
    </section>
  );
}
