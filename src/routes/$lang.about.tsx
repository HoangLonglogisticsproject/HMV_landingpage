import { createFileRoute } from '@tanstack/react-router';
import { AboutSection, Capabilities, RfqSection } from '@/components/sections';
import { seoHead, type Locale } from '@/lib/i18n';
import { jsonLd, organization } from '@/lib/schema';

const seo = {
  en: { title: 'About HMV Global | Vietnam Agricultural Trading Partner', description: 'HMV Global Co., LTD is a Ho Chi Minh City agricultural trading company combining commodity sourcing with integrated supply-chain coordination. Meet our leadership.' },
  vi: { title: 'Về HMV Global | Đối tác thương mại nông sản tại Việt Nam', description: 'HMV Global Co., LTD là công ty thương mại nông sản tại TP. Hồ Chí Minh, kết hợp tìm nguồn hàng hóa với điều phối chuỗi cung ứng tích hợp. Gặp gỡ ban lãnh đạo.' },
};
export const Route = createFileRoute('/$lang/about')({
  head: ({ params }) => { const locale = params.lang as Locale; const s = seo[locale] ?? seo.en; return { ...seoHead({ locale, path: '/about', ...s }), scripts: [jsonLd([{ ...organization, description: s.description }])] }; },
  component: () => { const locale = Route.useParams().lang as Locale; return <main><AboutSection locale={locale} h1 /><Capabilities locale={locale} /><RfqSection locale={locale} /></main>; },
});
