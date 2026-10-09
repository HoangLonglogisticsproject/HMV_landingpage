import { useState } from 'react';
import { ArrowUpRight, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { products, type Product } from '@/lib/catalog';

function downloadSpecs(product: Product) {
  const text = `HMV Global Co., LTD — ${product.name}\nProduct specification review sheet\n\n${product.specs.map(([key,value]) => `${key}: ${value}`).join('\n\n')}\n\nFinal numerical specifications, origin, availability, packing and quality documentation must be confirmed per quotation. This sheet is not a certificate of analysis or a binding product offer.\n\nContact: vannguyen@hmvglobal.com`;
  const url = URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=`HMV-${product.id}-specification-review.txt`;link.click(); URL.revokeObjectURL(url);
}
export function ProductCatalog() {
  const [selected,setSelected]=useState<Product>();
  return <section id="commodities" className="py-20">
    <div className="page-width">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"><div><p className="eyebrow mb-4 text-primary">Our commodity portfolio</p><h2 className="section-heading">Rooted in Vietnam.<br />Ready for the world.</h2></div><p className="max-w-90 text-sm leading-7 text-muted-foreground">Tropical produce and agricultural ingredients, sourced around your specifications and your market.</p></div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product,index) => <article key={product.id} className="product-card overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative aspect-[1.7] overflow-hidden bg-muted"><img src={product.image} alt={product.name} width={502} height={502} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" /><span className="absolute left-4 top-4 bg-background/95 px-2.5 py-1 text-[10px] font-medium uppercase text-ocean-deep">{product.category}</span></div>
        <div className="p-6"><div className="flex items-start justify-between gap-3"><h3 className="text-xl font-semibold">{product.name}</h3><span className="pt-1 text-[10px] text-muted-foreground">0{index+1}</span></div><p className="mt-3 min-h-12 text-[13px] leading-6 text-muted-foreground">{product.description}</p><Button variant="link" onClick={() => setSelected(product)} className="mt-4 h-auto justify-start p-0 text-xs">View product specifications <ArrowUpRight className="size-3.5" /></Button></div>
      </article>)}</div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm"><span className="text-muted-foreground">Looking for another tropical commodity?</span><a href="#rfq" className="inline-flex items-center gap-2 font-medium text-primary">Talk to our trading team <ArrowUpRight className="size-4" /></a></div>
    </div>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(undefined); }}><DialogContent className="max-h-[90svh] max-w-2xl overflow-y-auto">{selected && <><div className="flex items-center gap-2 text-xs font-medium text-primary"><FileText className="size-4" /> PRODUCT SPECIFICATION REVIEW</div><DialogTitle className="text-2xl">{selected.name}</DialogTitle><DialogDescription>{selected.description}</DialogDescription><table className="spec-table"><tbody>{selected.specs.map(([key,value]) => <tr key={key}><th scope="row">{key}</th><td>{value}</td></tr>)}</tbody></table><p className="text-xs leading-5 text-muted-foreground">Final numerical specifications, availability and documents are confirmed per quotation. This review sheet is not a certificate of analysis or a binding offer.</p><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => downloadSpecs(selected)}><Download /> Download review sheet</Button><Button asChild onClick={() => setSelected(undefined)}><a href="#rfq">Request a quotation <ArrowUpRight /></a></Button></div></>}</DialogContent></Dialog>
  </section>;
}