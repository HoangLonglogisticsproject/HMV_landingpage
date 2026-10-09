import { createFileRoute, Link } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowUpRight, Globe2, Layers3, Leaf, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCatalog } from '@/components/ProductCatalog';
import { WorldJourney } from '@/components/WorldJourney';
import { InsightsTabs } from '@/components/InsightsTabs';
import { AboutSection, Capabilities, FaqSection, RfqSection, SupplySteps } from '@/components/sections';
import { seoHead, ui, type Locale } from '@/lib/i18n';
import { homeLd } from '@/lib/schema';
import landscape from '@/assets/agri-landscape.jpg';

const SupplyGlobe = lazy(() => import('@/components/SupplyGlobe'));
const seo = {
  en: { title: 'HMV Global | Agri-Commodity Trading & Integrated Supply Chain', description: 'Source tropical agricultural commodities with HMV Global, Vietnam. Passion fruit, bananas, dragon fruit, spices, cashews and tapioca starch with integrated supply-chain coordination.' },
  vi: { title: 'HMV Global | Thương mại nông sản & Chuỗi cung ứng tích hợp', description: 'Tìm nguồn nông sản nhiệt đới Việt Nam cùng HMV Global: chanh dây, chuối, thanh long, gia vị, hạt điều và tinh bột sắn với năng lực điều phối chuỗi cung ứng quốc tế.' },
};
export const Route = createFileRoute('/$lang/')({
  head: ({ params }) => {
    const locale = params.lang as Locale; const s = seo[locale] ?? seo.en;
    const h = seoHead({ locale, path: '', ...s });
    return { ...h, links: [...h.links, { rel: 'preload', as: 'image', href: landscape }], scripts: [homeLd(locale, s.description)] };
  },
  component: Home,
});

function Home() {
  const locale = Route.useParams().lang as Locale;
  const t = ui[locale];
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <main>
    <WorldJourney locale={locale} />
    <section aria-label={t.focusLabel} className="border-b border-border"><div className="page-width grid grid-cols-2 gap-y-7 py-8 md:grid-cols-4">{t.focus.map(([label, sub], i) => { const I = [Leaf, Layers3, ShieldCheck, Globe2][i] ?? Leaf; return <div key={label} className="flex items-center gap-3.5 md:justify-center md:border-r md:border-border md:last:border-0"><I className="size-7 shrink-0 stroke-[1.4] text-primary" /><div><h2 className="text-[12px] font-semibold">{label}</h2><p className="mt-1 text-[10px] text-muted-foreground">{sub}</p></div></div>; })}</div></section>
    <ProductCatalog locale={locale} />
    <section id="supply-chain" className="journey-section bg-secondary"><div className="page-width"><SupplySteps locale={locale} /></div>{mounted && <Suspense fallback={null}><SupplyGlobe /></Suspense>}<p className="absolute bottom-5 right-5 text-[9px] text-muted-foreground">{t.supply.note}</p></section>
    <Capabilities locale={locale} />
    <AboutSection locale={locale} />
    <section className="border-t border-border py-18"><div className="page-width"><div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow mb-4 text-primary">{t.insights.eyebrow}</p><h2 className="section-heading">{t.insights.title}</h2></div><Button asChild variant="link" className="px-0"><Link to="/$lang/insights" params={{ lang: locale }}>{t.insights.all} <ArrowUpRight /></Link></Button></div><InsightsTabs locale={locale} /></div></section>
    <FaqSection locale={locale} />
    <RfqSection locale={locale} />
  </main>;
}
