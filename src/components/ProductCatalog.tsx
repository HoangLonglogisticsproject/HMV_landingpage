import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getProducts, type Product } from '@/lib/catalog';
import { ui, type Locale } from '@/lib/i18n';

export function downloadSpecs(product: Product, locale: Locale) {
  const t = ui[locale].catalog;
  const text = `HMV Global Co., LTD — ${product.name}\n${t.sheetTitle}\n\n${product.specs.map(([key, value]) => `${key}: ${value}`).join('\n\n')}\n\n${t.disclaimer}\n\nContact: vannguyen@hmvglobal.com`;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `HMV-${product.id}-${locale}-specification-review.txt`; link.click(); URL.revokeObjectURL(url);
}
export function ProductCatalog({ locale = 'en', heading = 'h2' }: { locale?: Locale; heading?: 'h1' | 'h2' }) {
  const [selected, setSelected] = useState<Product>();
  const t = ui[locale].catalog;
  const H = heading;
  return <section id="commodities" className="py-20">
    <div className="page-width">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"><div><p className="eyebrow mb-4 text-primary">{t.eyebrow}</p><H className="section-heading">{t.title[0]}<br />{t.title[1]}</H></div><p className="max-w-90 text-sm leading-7 text-muted-foreground">{t.intro}</p></div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{getProducts(locale).map((product, index) => <article key={product.id} className="product-card overflow-hidden rounded-lg border border-border bg-card">
        <Link to="/$lang/products/$id" params={{ lang: locale, id: product.id }} className="relative block aspect-[1.7] overflow-hidden bg-muted"><img src={product.image} alt={product.name} width={502} height={502} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" /><span className="absolute left-4 top-4 bg-background/95 px-2.5 py-1 text-[10px] font-medium uppercase text-ocean-deep">{product.category}</span></Link>
        <div className="p-6"><div className="flex items-start justify-between gap-3"><h3 className="text-xl font-semibold"><Link to="/$lang/products/$id" params={{ lang: locale, id: product.id }}>{product.name}</Link></h3><span className="pt-1 text-[10px] text-muted-foreground">0{index + 1}</span></div><p className="mt-3 min-h-12 text-[13px] leading-6 text-muted-foreground">{product.description}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2"><Button variant="link" onClick={() => setSelected(product)} className="h-auto justify-start p-0 text-xs">{t.view} <ArrowUpRight className="size-3.5" /></Button><Button asChild variant="link" className="h-auto p-0 text-xs text-ocean-deep"><Link to="/$lang/products/$id" params={{ lang: locale, id: product.id }}>{t.details} <ArrowUpRight className="size-3.5" /></Link></Button></div></div>
      </article>)}</div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm"><span className="text-muted-foreground">{t.other}</span><Link to="/$lang/contact" params={{ lang: locale }} className="inline-flex items-center gap-2 font-medium text-primary">{t.talk} <ArrowUpRight className="size-4" /></Link></div>
    </div>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(undefined); }}><DialogContent className="max-h-[90svh] max-w-2xl overflow-y-auto">{selected && <><div className="flex items-center gap-2 text-xs font-medium text-primary"><FileText className="size-4" /> {t.sheet}</div><DialogTitle className="text-2xl">{selected.name}</DialogTitle><DialogDescription>{selected.description}</DialogDescription><table className="spec-table"><tbody>{selected.specs.map(([key, value]) => <tr key={key}><th scope="row">{key}</th><td>{value}</td></tr>)}</tbody></table><p className="text-xs leading-5 text-muted-foreground">{t.disclaimer}</p><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => downloadSpecs(selected, locale)}><Download /> {t.download}</Button><Button asChild onClick={() => setSelected(undefined)}><Link to="/$lang/contact" params={{ lang: locale }}>{t.quote} <ArrowUpRight /></Link></Button></div></>}</DialogContent></Dialog>
  </section>;
}
