'use client';
import { useState } from 'react';
import { toRfqRow } from './rfq';
import { createInquiryMailto } from './inquiry';
import { RfqSubmit } from './RfqSubmit';

const INCOTERMS = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'];

// The RFQ of a product page: fixed to the page's product (not selectable), with its requirement fields (`fields`, from
// data/productPages.js) after the shared ones. Same validation and email hand-off as the home RFQ (TradeRfq): a draft is prepared, never sent.
export function ProductRfq({ lang, product, text, fields }) {
  const vi = lang === 'vi';
  const L = (e, v) => (vi ? v : e);
  const [state, setState] = useState('idle');
  const submit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try { toRfqRow(data, lang); } catch { setState('invalid'); return; }
    window.location.href = createInquiryMailto({ ...data, requirements: fields.map(f => [f.label.en, data[f.name]]) });
    setState('done');
  };
  return (
    <section className="rfq-section" id="rfq" aria-labelledby="product-rfq-title">
      <div className="content-width rfq-grid">
        <div className="rfq-info">
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="product-rfq-title">{text.title}</h2>
          <p className="rfq-lead">{text.lead}</p>
        </div>
        <form className="rfq-form glass" onSubmit={submit}>
          <div className="rfq-fields">
            <label>{L('Company Name', 'Tên doanh nghiệp')}<input name="company" required maxLength={150} autoComplete="organization" /></label>
            <label>{L('Work Email', 'Email công việc')}<input name="email" type="email" required maxLength={255} autoComplete="email" inputMode="email" /></label>
            {/* Fixed to the page's product: the requirement fields below belong to it. */}
            <label>
              {L('Product', 'Sản phẩm')}
              <input value={product[lang]} readOnly aria-readonly="true" />
              <input type="hidden" name="product" value={product.en} />
            </label>
            <label>{text.volume}<input name="volume" maxLength={100} placeholder={text.volumePlaceholder} /></label>
            {fields.map(f => (
              <label key={f.name}>
                {f.label[lang]}
                {f.options ? (
                  <select name={f.name} defaultValue="">
                    <option value="">{L('Select', 'Chọn')}</option>
                    {f.options.map(o => <option key={o.en} value={o.en}>{o[lang]}</option>)}
                  </select>
                ) : (
                  <input name={f.name} maxLength={150} placeholder={f.placeholder[lang]} />
                )}
              </label>
            ))}
            <label>{L('Destination port / market', 'Cảng đến / thị trường đích')}<input name="port" maxLength={100} placeholder={L('e.g. Rotterdam, Los Angeles', 'VD: Rotterdam, Los Angeles')} /></label>
            <label>
              <span>Incoterm</span>
              <select name="incoterm" defaultValue="">
                <option value="">{L('To be discussed', 'Sẽ trao đổi')}</option>
                {INCOTERMS.map(i => <option key={i}>{i}</option>)}
              </select>
            </label>
            <label className="rfq-wide">{L('Other requirements', 'Yêu cầu khác')}<textarea name="message" rows={4} maxLength={3000} /></label>
          </div>
          <RfqSubmit lang={lang} state={state} onReset={() => setState('idle')} invalidText={L('Please check your company, work email and product.', 'Vui lòng kiểm tra tên doanh nghiệp, email và sản phẩm.')} />
        </form>
      </div>
    </section>
  );
}
