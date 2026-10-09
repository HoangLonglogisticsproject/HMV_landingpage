import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Capabilities, RfqSection, SupplySteps } from '@/components/sections';
import { seoHead, ui, type Locale } from '@/lib/i18n';

const SupplyGlobe = lazy(() => import('@/components/SupplyGlobe'));
const seo = {
  en: { title: 'Integrated Supply Chain | HMV Global Trading Solutions', description: 'How HMV Global aligns origin sourcing, quality preparation, documentation and shipment coordination around each agricultural commodity trade.' },
  vi: { title: 'Chuỗi cung ứng tích hợp | Giải pháp thương mại HMV Global', description: 'Cách HMV Global kết nối tìm nguồn tại vùng gốc, chuẩn bị chất lượng, chứng từ và điều phối lô hàng xoay quanh từng giao dịch nông sản.' },
};
export const Route = createFileRoute('/$lang/supply-chain')({
  head: ({ params }) => { const locale = params.lang as Locale; return seoHead({ locale, path: '/supply-chain', ...(seo[locale] ?? seo.en) }); },
  component: SupplyPage,
});
function SupplyPage() {
  const locale = Route.useParams().lang as Locale;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <main><section id="supply-chain" className="journey-section bg-secondary"><div className="page-width"><SupplySteps locale={locale} h1 /></div>{mounted && <Suspense fallback={null}><SupplyGlobe /></Suspense>}<p className="absolute bottom-5 right-5 text-[9px] text-muted-foreground">{ui[locale].supply.note}</p></section><Capabilities locale={locale} /><RfqSection locale={locale} /></main>;
}
