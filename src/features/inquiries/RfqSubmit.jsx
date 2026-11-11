import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// The end of an RFQ form (TradeRfq, ProductRfq): the submit button and its note, or, once the email draft is prepared,
// the draft-prepared message; and the validation message. `state`: 'idle' | 'done' | 'invalid'.
export function RfqSubmit({ lang, state, onReset, invalidText }) {
  const L = (e, v) => (lang === 'vi' ? v : e);
  return (
    <>
      {state === 'done' ? (
        <div className="rfq-success">
          <span aria-hidden="true">✓</span>
          <output className="rfq-success-message">{L('Email draft prepared. Send it from your email application, or write to vannguyen@hmvglobal.com directly.', 'Đã chuẩn bị email. Hãy gửi từ ứng dụng email của bạn, hoặc liên hệ trực tiếp vannguyen@hmvglobal.com.')}</output>
          <button type="button" onClick={onReset}>{L('Prepare another request', 'Soạn yêu cầu khác')}</button>
        </div>
      ) : (
        <>
          <Button type="submit" size="lg" className="day-cta rfq-submit">{L('Prepare RFQ email', 'Soạn email yêu cầu báo giá')}<ArrowUpRight size={18} /></Button>
          <p className="form-note">{L('Opens a draft in your email app. Your request is not sent until you send that email.', 'Mở bản nháp trong ứng dụng email. Yêu cầu chỉ được gửi khi bạn gửi email đó.')}</p>
        </>
      )}
      {state === 'invalid' && <p role="alert" className="rfq-error">{invalidText}</p>}
    </>
  );
}
