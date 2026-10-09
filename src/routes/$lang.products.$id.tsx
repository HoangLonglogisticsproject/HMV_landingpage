import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadSpecs } from '@/components/ProductCatalog';
import { findProduct, getProducts } from '@/lib/catalog';
import { findArticle } from '@/lib/articles';
import { isLocale, seoHead, ui, type Locale } from '@/lib/i18n';
import { breadcrumbLd, jsonLd, organization, productLd } from '@/lib/schema';

export const Route = createFileRoute('/$lang/products/$id')({
  loader: ({ params }) => {
    if (!isLocale(params.lang)) throw notFound();
    const product = findProduct(params.id, params.lang);
    if (!product) throw notFound();
    return { product, locale: params.lang };
  },
  head: ({ params, loaderData }) => {
    const locale = (isLocale(params.lang) ? params.lang : 'en') as Locale;
    if (!loaderData) return seoHead({ locale, path: `/products/${params.id}`, title: `${ui[locale].product.notFound} | HMV Global`, description: ui[locale].product.notFound, noindex: true });
    const p = loaderData.product; const t = ui[locale];
    return { ...seoHead({ locale, path: `/products/${p.id}`, title: `${p.name} | HMV Global`, description: `${p.description} ${t.product.ctaText}`.slice(0, 300), type: 'product' }), scripts: [jsonLd([{ ...organization }, productLd(p, locale), breadcrumbLd([['HMV Global', `/${locale}`], [t.nav.products, `/${locale}/products`], [p.name, `/${locale}/products/${p.id}`]])])] };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});
function ProductNotFound() { return <main className="page-width py-24"><h1 className="text-3xl font-semibold">Commodity not found / Không tìm thấy mặt hàng</h1><Button asChild variant="link" className="mt-6 px-0"><Link to="/$lang/products" params={{ lang: 'en' }}><ArrowLeft /> All commodities</Link></Button></main>; }
function ProductPage() {
  const { product: p, locale } = Route.useLoaderData();
  const t = ui[locale]; const c = t.catalog;
  const related = getProducts(locale).filter(x => x.id !== p.id).slice(0, 3);
  const articles = p.articles.map(slug => findArticle(slug, locale)).filter(a => a !== undefined);
  return <main>
    <section className="page-width grid gap-10 py-12 lg:grid-cols-2 lg:py-18">
      <div><Button asChild variant="link" className="mb-8 px-0"><Link to="/$lang/products" params={{ lang: locale }}><ArrowLeft /> {t.product.back}</Link></Button><p className="eyebrow text-primary">{p.category}</p><h1 className="article-title mt-5 font-semibold">{p.name}</h1><p className="mt-6 text-base leading-8 text-muted-foreground">{p.description}</p><div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link to="/$lang/contact" params={{ lang: locale }}>{c.quote} <ArrowUpRight /></Link></Button><Button variant="outline" onClick={() => downloadSpecs(p, locale)}><Download /> {c.download}</Button></div></div>
      <img src={p.image} alt={p.name} width={502} height={502} className="aspect-[4/3] w-full rounded-lg object-cover" />
    </section>
    <section className="border-t border-border bg-secondary py-16"><div className="page-width grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="eyebrow mb-4 text-primary">{c.sheet}</p><h2 className="section-heading">{t.product.specs}</h2><p className="mt-5 text-xs leading-6 text-muted-foreground">{c.disclaimer}</p></div><table className="spec-table bg-background"><tbody>{p.specs.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table></div></section>
    <section className="py-16"><div className="page-width grid gap-6 rounded-lg border border-border p-8 md:grid-cols-[1fr_auto] md:items-center"><div><h2 className="text-2xl font-semibold">{t.product.ctaTitle}</h2><p className="mt-3 max-w-150 text-sm leading-7 text-muted-foreground">{t.product.ctaText}</p></div><Button asChild className="h-12 px-6"><Link to="/$lang/contact" params={{ lang: locale }}>{t.nav.trade} <ArrowUpRight /></Link></Button></div></section>
    {articles.length > 0 && <section className="border-t border-border py-14"><div className="page-width"><h2 className="text-2xl font-semibold">{t.product.articles}</h2><div className="mt-7 grid gap-6 md:grid-cols-2">{articles.map(a => <Link key={a.slug} to="/$lang/insights/$slug" params={{ lang: locale, slug: a.slug }} className="border-t border-border py-5"><p className="eyebrow text-primary">{a.topic}</p><h3 className="mt-3 text-lg font-semibold">{a.title}</h3><ArrowUpRight className="mt-4 size-5 text-primary" /></Link>)}</div></div></section>}
    <section className="border-t border-border bg-muted py-14"><div className="page-width"><h2 className="text-2xl font-semibold">{t.product.related}</h2><div className="mt-7 grid gap-6 md:grid-cols-3">{related.map(r => <Link key={r.id} to="/$lang/products/$id" params={{ lang: locale, id: r.id }} className="group overflow-hidden rounded-lg border border-border bg-card"><img src={r.image} alt={r.name} width={502} height={502} loading="lazy" className="aspect-[1.7] w-full object-cover" /><div className="p-5"><p className="text-[10px] uppercase text-muted-foreground">{r.category}</p><h3 className="mt-2 text-lg font-semibold group-hover:text-primary">{r.name}</h3></div></Link>)}</div></div></section>
  </main>;
}
