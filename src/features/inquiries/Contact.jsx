import { Suspense } from 'react';
import {
  ArrowUpRight,
  ClipboardList,
  Mail,
  MapPin,
  PhoneCall,
} from 'lucide-react';
import { TradeDeskButton } from '@/features/trade-desk/TradeDeskButton';
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
            <TradeDeskButton variant="secondary" size="lg" source="home_contact">
              <ClipboardList size={16} />
              {t.support}
              <ArrowUpRight />
            </TradeDeskButton>
          )}
        </div>
        {full && (
          <div className="contact-grid">
            <Suspense fallback={<ContactForm lang={lang} />}>
              <ContactFormFromUrl lang={lang} />
            </Suspense>
            <aside>
              <div className="office-block support-desk-card">
                <h3>HMV Trade Desk</h3>
                <p>
                  {vi
                    ? 'Mô tả sản phẩm, khối lượng, điểm đến và yêu cầu trong bốn bước. Yêu cầu được gửi tới bộ phận thương mại HMV kèm mã tham chiếu.'
                    : 'Describe the product, volume, destination and requirements in four steps. Your inquiry reaches the HMV commercial team with a reference number.'}
                </p>
                <TradeDeskButton size="lg" className="day-cta" source="contact_page">
                  {vi ? 'Mở HMV Trade Desk' : 'Open HMV Trade Desk'}
                  <ArrowUpRight size={18} />
                </TradeDeskButton>
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
