import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chainLabels, generalChain, getControlTower, getJourney, towerLabels } from '@/lib/valueChain';
import { getProducts } from '@/lib/catalog';
import type { Locale } from '@/lib/i18n';

export function ControlTower({ locale }: { locale: Locale }) {
  const nodes = getControlTower(locale); const t = towerLabels[locale];
  const [active, setActive] = useState(nodes[0]!.id);
  const node = nodes.find(n => n.id === active) ?? nodes[0]!;
  return <section id="control-tower" className="bg-secondary py-20"><div className="page-width">
    <p className="eyebrow mb-4 text-primary">{t.eyebrow}</p><h2 className="section-heading">{t.title}</h2><p className="mt-5 max-w-150 text-sm leading-7 text-muted-foreground">{t.intro}</p>
    <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <ol className="tower-chain" aria-label={t.eyebrow}>{nodes.map((n, i) => <li key={n.id}><button type="button" onClick={() => setActive(n.id)} aria-pressed={n.id === active} className={`tower-node ${n.id === active ? 'is-active' : ''}`}><span className="tower-index">0{i + 1}</span><span className="text-left text-sm font-semibold">{n.title}</span></button></li>)}</ol>
      <div className="rounded-lg border border-border bg-background p-7" aria-live="polite"><h3 className="text-2xl font-semibold text-ocean-deep">{node.title}</h3><dl className="mt-6 grid gap-5">{([[t.role, node.role], [t.problem, node.problem], [t.parties, node.parties], [t.scope, node.scope], [t.evidence, node.evidence]] as const).map(([k, v]) => <div key={k} className="border-t border-border pt-4"><dt className="eyebrow text-primary">{k}</dt><dd className="mt-2 text-sm leading-7 text-muted-foreground">{v}</dd></div>)}</dl></div>
    </div>
  </div></section>;
}

export function ProductJourney({ locale, productId }: { locale: Locale; productId: string }) {
  const t = chainLabels[locale]; const journey = getJourney(productId, locale);
  const [pathId, setPathId] = useState(journey?.paths[0]?.id);
  const path = journey?.paths.find(p => p.id === pathId) ?? journey?.paths[0];
  if (!journey || !path) return <div><h3 className="text-xl font-semibold">{t.general}</h3><ol className="journey-steps mt-6">{generalChain[locale].map((s, i) => <li key={s}><span>0{i + 1}</span>{s}</li>)}</ol><p className="mt-5 text-xs leading-6 text-muted-foreground">{t.generalNote}</p></div>;
  return <div>
    <p className="max-w-150 text-sm leading-7 text-muted-foreground">{journey.intro}</p>
    <div role="tablist" className="mt-6 flex flex-wrap gap-2">{journey.paths.map(p => <Button key={p.id} role="tab" aria-selected={p.id === path.id} variant={p.id === path.id ? 'default' : 'outline'} size="sm" onClick={() => setPathId(p.id)}>{p.label}</Button>)}</div>
    <ol className="journey-steps mt-7">{path.steps.map((s, i) => <li key={s}><span>0{i + 1}</span>{s}</li>)}</ol>
    <dl className="mt-7 grid gap-5 md:grid-cols-3">{([[t.output, path.output], [t.checkpoints, path.checkpoints], [t.storage, path.storage]] as const).map(([k, v]) => <div key={k} className="border-t border-border pt-4"><dt className="eyebrow text-primary">{k}</dt><dd className="mt-2 text-sm leading-6 text-muted-foreground">{v}</dd></div>)}</dl>
    <p className="mt-5 text-[11px] text-muted-foreground">{t.sample}</p>
  </div>;
}

export function FollowTheProduct({ locale }: { locale: Locale }) {
  const t = chainLabels[locale]; const products = getProducts(locale);
  const [id, setId] = useState(products[0]!.id);
  return <section className="py-20"><div className="page-width">
    <p className="eyebrow mb-4 text-primary">{t.eyebrow}</p><h2 className="section-heading">{t.title}</h2>
    <div className="mt-8 flex flex-wrap gap-2" aria-label={t.eyebrow}>{products.map(p => <Button key={p.id} variant={p.id === id ? 'default' : 'outline'} size="sm" aria-pressed={p.id === id} onClick={() => setId(p.id)}>{p.name}</Button>)}</div>
    <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]"><ProductJourney key={id} locale={locale} productId={id} /><NeedsList locale={locale} /></div>
    <Button asChild variant="link" className="mt-6 px-0"><Link to="/$lang/products/$id" params={{ lang: locale, id }}>{products.find(p => p.id === id)?.name} <ArrowUpRight /></Link></Button>
  </div></section>;
}

export function NeedsList({ locale }: { locale: Locale }) {
  const t = chainLabels[locale];
  return <aside className="rounded-lg border border-border bg-card p-6"><p className="text-sm font-semibold">{t.need}</p><ul className="mt-4 grid gap-3">{t.needs.map(n => <li key={n} className="flex gap-2 text-xs leading-5 text-muted-foreground"><Check className="size-4 shrink-0 text-primary" />{n}</li>)}</ul><Button asChild className="mt-6 w-full"><Link to="/$lang/contact" params={{ lang: locale }}>{locale === 'vi' ? 'Yêu cầu đề xuất thương mại' : 'Request a Trade Proposal'} <ArrowUpRight /></Link></Button></aside>;
}
