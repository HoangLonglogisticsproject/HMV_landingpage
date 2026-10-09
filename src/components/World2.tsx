import { useState, type FormEvent } from 'react';

type Draft = Partial<Record<'product' | 'format' | 'spec' | 'qty' | 'season' | 'market' | 'incoterm' | 'documents', string>>;
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/catalog';
import { findArticle } from '@/lib/articles';
import type { Locale } from '@/lib/i18n';
import { blueprintLabels, buildBlueprint, quality, qualityArticles } from '@/lib/world2';

export function QualityScience({ locale }: { locale: Locale }) {
  const q = quality[locale]; const products = getProducts(locale);
  const [stage, setStage] = useState(0);
  const [pid, setPid] = useState(products[0]!.id);
  const active = q.stages[stage]!;
  return <section id="quality" className="quality-science py-20"><div className="page-width">
    <p className="eyebrow mb-4 text-primary">{q.eyebrow}</p><h2 className="section-heading">{q.title}</h2><p className="mt-5 max-w-150 text-sm leading-7 text-muted-foreground">{q.intro}</p>
    <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <div className="science-orbit" aria-hidden="true"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" className="science-track" /><circle cx="100" cy="100" r="86" className="science-arc" style={{ strokeDashoffset: 540 - (540 * (stage + 1)) / q.stages.length }} /><circle cx="100" cy="100" r="58" className="science-inner" /></svg><div className="science-core"><FlaskConical className="size-7 text-primary" /><span className="font-display text-3xl text-ocean-deep">0{stage + 1}</span></div></div>
        <ol className="mt-8 grid gap-2 sm:grid-cols-2">{q.stages.map((s, i) => <li key={s.id}><button type="button" aria-pressed={i === stage} onClick={() => setStage(i)} className={`science-step ${i === stage ? 'is-active' : ''}`}><span className="tower-index">0{i + 1}</span>{s.title}</button></li>)}</ol>
        <p className="mt-6 rounded-lg border border-border bg-background p-5 text-sm leading-7 text-muted-foreground" aria-live="polite"><strong className="block text-ocean-deep">{active.title}</strong>{active.text}</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-7">
        <h3 className="text-lg font-semibold">{q.paramsTitle}</h3>
        <div className="mt-5 flex flex-wrap gap-2">{products.map(p => <Button key={p.id} size="sm" variant={p.id === pid ? 'default' : 'outline'} aria-pressed={p.id === pid} onClick={() => setPid(p.id)}>{p.name}</Button>)}</div>
        <ul className="mt-6 grid grid-cols-2 gap-3">{(q.params[pid] ?? []).map(x => <li key={x} className="science-param"><span className="science-dot" />{x}</li>)}</ul>
        <p className="mt-6 text-[11px] leading-5 text-muted-foreground">{q.note}</p>
        <p className="eyebrow mt-7 text-primary">{q.related}</p>
        <ul className="mt-3 grid gap-2">{qualityArticles.map(slug => { const a = findArticle(slug, locale); return a ? <li key={slug}><Link to="/$lang/insights/$slug" params={{ lang: locale, slug }} className="inline-flex items-center gap-2 text-sm text-ocean-deep hover:text-primary">{a.title} <ArrowUpRight className="size-4" /></Link></li> : null; })}</ul>
      </div>
    </div>
  </div></section>;
}

export function SupplyBlueprint({ locale }: { locale: Locale }) {
  const t = blueprintLabels[locale]; const products = getProducts(locale);
  const [stages, setStages] = useState<string[] | null>(null);
  const [data, setData] = useState<Draft>({});
  function build(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Draft;
    setData(d);
    setStages(buildBlueprint({ product: d.product ?? '', format: d.format ?? 'To be discussed', market: d.market ?? '', season: d.season ?? '', documents: d.documents ?? '' }, locale));
  }
  function send() {
    const p = products.find(x => x.id === data.product);
    const requirements = [`${t.eyebrow}:`, ...(stages ?? []).map((s, i) => `${i + 1}. ${s}`), data.spec ? `${t.spec}: ${data.spec}` : '', data.season ? `${t.season}: ${data.season}` : ''].filter(Boolean).join('\n');
    window.dispatchEvent(new CustomEvent('hmv:blueprint', { detail: { product: p?.nameEn ?? '', product_format: data.format, quantity: data.qty, destination: data.market, incoterm: data.incoterm, documents: data.documents, requirements } }));
    document.getElementById('rfq')?.scrollIntoView({ behavior: 'smooth' });
  }
  return <section id="blueprint" className="bg-secondary py-20"><div className="page-width">
    <p className="eyebrow mb-4 text-primary">{t.eyebrow}</p><h2 className="section-heading">{t.title}</h2><p className="mt-5 max-w-150 text-sm leading-7 text-muted-foreground">{t.intro}</p>
    <div className="mt-10 grid gap-10 lg:grid-cols-2">
      <form onSubmit={build} className="grid gap-4 rounded-lg border border-border bg-background p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">{t.material}<select className="field" name="product" defaultValue={products[0]!.id}>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="field-label">{t.format}<select className="field" name="format" defaultValue="Fresh">{Object.entries(t.formats).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        </div>
        <label className="field-label">{t.spec}<input className="field" name="spec" maxLength={300} /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="field-label">{t.qty}<input className="field" name="qty" maxLength={100} /></label><label className="field-label">{t.season}<input className="field" name="season" maxLength={150} /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="field-label">{t.market}<input className="field" name="market" maxLength={150} /></label><label className="field-label">{t.incoterm}<input className="field" name="incoterm" maxLength={50} /></label></div>
        <label className="field-label">{t.docs}<input className="field" name="documents" maxLength={500} /></label>
        <Button type="submit" variant="outline" className="h-11">{t.build}</Button>
      </form>
      <div aria-live="polite">{stages ? <div className="rounded-lg border border-primary/30 bg-background p-7">
        <h3 className="text-lg font-semibold">{t.result}</h3>
        <ol className="blueprint-chain mt-6">{stages.map((s, i) => <li key={s}><span className="tower-index">0{i + 1}</span>{s}</li>)}</ol>
        <p className="mt-6 text-[11px] leading-5 text-muted-foreground">{t.disclaimer}</p>
        <Button className="mt-6 h-12 w-full justify-between px-5" onClick={send}>{t.send} <ArrowUpRight /></Button>
      </div> : <div className="blueprint-empty"><p className="text-sm text-muted-foreground">{t.disclaimer}</p></div>}</div>
    </div>
  </div></section>;
}
