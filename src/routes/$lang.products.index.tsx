import { createFileRoute } from '@tanstack/react-router';
import { ProductCatalog } from '@/components/ProductCatalog';
import { seoHead, ui, type Locale } from '@/lib/i18n';
import { getProducts } from '@/lib/catalog';
import { breadcrumbLd, jsonLd, productLd } from '@/lib/schema';

export const Route = createFileRoute('/$lang/products/')({
  head: ({ params }) => {
    const locale = params.lang as Locale; const t = ui[locale] ?? ui.en;
    return { ...seoHead({ locale, path: '/products', title: `${t.pages.productsTitle} | HMV Global`, description: t.pages.productsIntro }), scripts: [jsonLd([{ '@type': 'ItemList', itemListElement: getProducts(locale).map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: productLd(p, locale) })) }, breadcrumbLd([['HMV Global', `/${locale}`], [t.nav.products, `/${locale}/products`]])])] };
  },
  component: ProductsPage,
});
function ProductsPage() {
  const locale = Route.useParams().lang as Locale; const t = ui[locale];
  return <main><section className="page-width pt-16"><p className="eyebrow text-primary">{t.nav.products}</p><h1 className="mt-5 text-4xl font-semibold md:text-5xl">{t.pages.productsTitle}</h1><p className="mt-6 max-w-145 text-sm leading-7 text-muted-foreground">{t.pages.productsIntro}</p></section><ProductCatalog locale={locale} /></main>;
}
