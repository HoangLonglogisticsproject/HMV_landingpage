import { Suspense } from 'react';
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Headphones,
  PhoneCall,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';
import { copy, address } from '@/data/hmv';
import { ContactForm, ContactFormFromUrl } from './ContactForm';
export function Contact({ lang, full = false }) {
  const t = copy[lang];
  const vi = lang === 'vi';
  return (
    <section
      className={`section-pad contact-section ${full ? 'contact-full' : ''}`}
    >
      <div className="content-width">
        <div className="contact-heading">
          <div>
            <p className="eyebrow">{t.contactLabel}</p>
            <h2>{t.contactTitle}</h2>
            <p>{t.contactText}</p>
          </div>
          {!full && (
            <Button asChild variant="secondary" size="lg">
              <Link to="/contact">
                <Headphones size={16} />
                {t.support || '24/7 Support'}
                <ArrowUpRight />
              </Link>
            </Button>
          )}
        </div>
        {full && (
          <div className="contact-grid">
            <Suspense fallback={<ContactForm lang={lang} />}>
              <ContactFormFromUrl lang={lang} />
            </Suspense>
            <aside>
              <div className="office-block support-desk-card">
                <div className="support-live-badge">
                  <span className="live-status-dot" />
                  <strong>
                    {vi ? 'TRỰC TUYẾN 24/7' : '24/7 LIVE SUPPORT'}
                  </strong>
                </div>
                <h3>
                  {vi
                    ? 'Bàn Điều Phối & Hỗ Trợ 24/7'
                    : '24/7 Priority Support Desk'}
                </h3>
                <p>
                  {vi
                    ? 'Bộ phận thương mại và chuỗi cung ứng túc trực 24/7 phản hồi yêu cầu báo giá nông sản, tư vấn hạ tầng điện gió và xử lý thủ tục vận chuyển.'
                    : 'Our global trade and logistics desk is available 24/7 to process RFQs, coordinate wind energy projects and monitor shipments.'}
                </p>
                <div className="support-desk-channels">
                  <a href="tel:+84909123456" className="support-channel-link">
                    <PhoneCall size={14} />
                    <span>+84 (0) 909 123 456 (Hotline/WhatsApp)</span>
                  </a>
                  <a
                    href="mailto:support@hmvglobal.com"
                    className="support-channel-link"
                  >
                    <Mail size={14} />
                    <span>support@hmvglobal.com</span>
                  </a>
                </div>
              </div>
              <div className="office-block">
                <MapPin />
                <h3>{t.office}</h3>
                <p>{address}</p>
              </div>
              <div className="office-block">
                <Mail />
                <h3>Ms. Van Nguyen</h3>
                <p>General Manager</p>
                <a href="mailto:vannguyen@hmvglobal.com">
                  vannguyen@hmvglobal.com
                </a>
              </div>
              <p className="commercial-note">{t.confirmed}</p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
