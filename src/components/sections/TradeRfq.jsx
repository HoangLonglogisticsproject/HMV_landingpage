import { useState } from 'react';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { address } from '@/data/hmv';
import { toRfqRow } from '@/lib/rfq';
import { supabase } from '@/integrations/supabase/client';

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
  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    let row;
    try { row = toRfqRow(Object.fromEntries(new FormData(form)), lang); } catch { setState('invalid'); return; }
    setState('sending');
    const { error } = await supabase.from('rfqs').insert(row);
    if (error) { console.error('rfq', error.message); setState(/limit/i.test(error.message) ? 'limit' : 'error'); return; }
    form.reset();
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
            <div className="rfq-success" role="status"><span>✓</span><p>{L('Thank you. Our trade team will be in touch shortly.', 'Cảm ơn bạn. Đội ngũ giao thương của chúng tôi sẽ liên hệ sớm nhất.')}</p><button type="button" onClick={() => setState('idle')}>{L('Send another request', 'Gửi yêu cầu khác')}</button></div>
          ) : (
            <Button type="submit" size="lg" className="day-cta rfq-submit" disabled={state === 'sending'}>{state === 'sending' ? L('Sending…', 'Đang gửi…') : L('Submit RFQ', 'Gửi yêu cầu báo giá')}<ArrowUpRight size={18} /></Button>
          )}
          {['invalid', 'error', 'limit'].includes(state) && <p role="alert" className="rfq-error">{state === 'invalid' ? L('Please check your company, work email and commodity.', 'Vui lòng kiểm tra tên doanh nghiệp, email và sản phẩm.') : state === 'limit' ? L('Too many requests from this email. Please email vannguyen@hmvglobal.com.', 'Email này đã gửi quá nhiều yêu cầu. Vui lòng gửi tới vannguyen@hmvglobal.com.') : L('Something went wrong. Please try again or email vannguyen@hmvglobal.com.', 'Đã có lỗi. Vui lòng thử lại hoặc gửi email tới vannguyen@hmvglobal.com.')}</p>}
        </form>
      </div>
    </section>
  );
}
