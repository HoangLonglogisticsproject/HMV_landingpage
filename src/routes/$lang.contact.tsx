import { createFileRoute } from '@tanstack/react-router';
import { FaqSection, RfqSection } from '@/components/sections';
import { seoHead, type Locale } from '@/lib/i18n';

const seo = {
  en: { title: 'Request for Quotation | HMV Global Agricultural Commodities', description: 'Send an RFQ to HMV Global for passion fruit, bananas, dragon fruit, spices, cashews, tapioca starch or other tropical commodities from Vietnam.' },
  vi: { title: 'Yêu cầu báo giá | HMV Global – Nông sản Việt Nam', description: 'Gửi yêu cầu báo giá đến HMV Global cho chanh dây, chuối, thanh long, gia vị, hạt điều, tinh bột sắn hoặc nông sản nhiệt đới khác từ Việt Nam.' },
};
export const Route = createFileRoute('/$lang/contact')({
  head: ({ params }) => { const locale = params.lang as Locale; return seoHead({ locale, path: '/contact', ...(seo[locale] ?? seo.en) }); },
  component: () => { const locale = Route.useParams().lang as Locale; return <main><RfqSection locale={locale} h1 /><FaqSection locale={locale} /></main>; },
});
