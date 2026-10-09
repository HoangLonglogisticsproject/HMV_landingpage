import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { InsightsTabs } from '@/components/InsightsTabs';
import { Button } from '@/components/ui/button';

const title = 'Perspectives | HMV Global Agricultural Trade & Supply Chains';
const description = 'Concise HMV perspectives on agricultural supply chains, GLOBALG.A.P., cold chain, Southeast Asian investment, trade logistics and renewable energy.';
export const Route = createFileRoute('/insights/')({
  head: () => ({ meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: InsightsPage,
});
function InsightsPage() {
  return <main><section className="page-width py-16 lg:py-24"><p className="eyebrow text-primary">The HMV perspective</p><h1 className="mt-5 text-4xl font-semibold md:text-5xl">Trade, considered.</h1><p className="mt-6 max-w-145 text-sm leading-7 text-muted-foreground">Agricultural markets. Connected supply chains. A changing world. Concise perspectives on the decisions behind international trade.</p><div className="mt-12"><InsightsTabs /></div></section><section className="border-t border-border bg-secondary py-14"><div className="page-width flex flex-wrap items-center justify-between gap-6"><h2 className="text-2xl font-semibold">Bring your next trade into focus.</h2><Button asChild><Link to="/" hash="rfq">Talk to HMV <ArrowUpRight /></Link></Button></div></section></main>;
}