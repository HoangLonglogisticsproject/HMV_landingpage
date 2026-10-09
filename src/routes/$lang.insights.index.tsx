import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { InsightsTabs } from '@/components/InsightsTabs';
import { Button } from '@/components/ui/button';
import { seoHead, ui, type Locale } from '@/lib/i18n';

const seo = {
  en: { title: 'Perspectives | HMV Global Agricultural Trade & Supply Chains', description: 'Concise HMV perspectives on agricultural supply chains, GLOBALG.A.P., cold chain, Southeast Asian investment, trade logistics and renewable energy.' },
  vi: { title: 'Góc nhìn | HMV Global – Thương mại nông sản & Chuỗi cung ứng', description: 'Bài viết tinh gọn của HMV về chuỗi cung ứng nông sản, GLOBALG.A.P., chuỗi lạnh, đầu tư Đông Nam Á, quy trình logistics và năng lượng tái tạo.' },
};
export const Route = createFileRoute('/$lang/insights/')({
  head: ({ params }) => { const locale = params.lang as Locale; return seoHead({ locale, path: '/insights', ...(seo[locale] ?? seo.en) }); },
  component: InsightsPage,
});
function InsightsPage() {
  const locale = Route.useParams().lang as Locale; const t = ui[locale].insights;
  return <main><section className="page-width py-16 lg:py-24"><p className="eyebrow text-primary">{t.eyebrow}</p><h1 className="mt-5 text-4xl font-semibold md:text-5xl">{t.pageTitle}</h1><p className="mt-6 max-w-145 text-sm leading-7 text-muted-foreground">{t.pageIntro}</p><div className="mt-12"><InsightsTabs locale={locale} /></div></section><section className="border-t border-border bg-secondary py-14"><div className="page-width flex flex-wrap items-center justify-between gap-6"><h2 className="text-2xl font-semibold">{t.bring}</h2><Button asChild><Link to="/$lang/contact" params={{ lang: locale }}>{t.talk} <ArrowUpRight /></Link></Button></div></section></main>;
}
