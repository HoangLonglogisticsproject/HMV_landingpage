import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Capabilities, RfqSection, SupplySteps } from '@/components/sections';
import { seoHead, ui, type Locale } from '@/lib/i18n';
import { ControlTower, FollowTheProduct } from '@/components/ValueChain';
import { QualityScience, SupplyBlueprint } from '@/components/World2';

const SupplyGlobe = lazy(() => import('@/components/SupplyGlobe'));
const seo = {
  en: { title: 'Integrated Supply Chain | HMV Global Trading Solutions', description: 'Farm-to-factory supply chain in Vietnam: how HMV Global coordinates raw-material sourcing, processing partners, quality, documentation and export for international buyers.' },
  vi: { title: 'Chuỗi cung ứng tích hợp | Giải pháp thương mại HMV Global', description: 'Chuỗi cung ứng từ nông trại đến nhà máy tại Việt Nam: cách HMV Global điều phối nguồn nguyên liệu, đối tác chế biến, chất lượng, chứng từ và xuất khẩu cho khách hàng quốc tế.' },
};
export const Route = createFileRoute('/$lang/supply-chain')({
  head: ({ params }) => { const locale = params.lang as Locale; return seoHead({ locale, path: '/supply-chain', ...(seo[locale] ?? seo.en) }); },
  component: SupplyPage,
});
function SupplyPage() {
  const locale = Route.useParams().lang as Locale;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <main><span id="sourcing" /><section id="supply-chain" className="journey-section bg-secondary"><div className="page-width"><SupplySteps locale={locale} h1 /></div>{mounted && <Suspense fallback={null}><SupplyGlobe /></Suspense>}<p className="absolute bottom-5 right-5 text-[9px] text-muted-foreground">{ui[locale].supply.note}</p></section><FollowTheProduct locale={locale} /><QualityScience locale={locale} /><ControlTower locale={locale} /><div id="export"><Capabilities locale={locale} /></div><SupplyBlueprint locale={locale} /><RfqSection locale={locale} /></main>;
}
