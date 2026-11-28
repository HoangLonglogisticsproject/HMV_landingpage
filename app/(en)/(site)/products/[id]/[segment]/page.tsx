import { notFound } from 'next/navigation';
import { products } from '@/data/hmv';
import { PRODUCT_SEGMENTS, isProductSegment } from '@/i18n/routes';
import { pageMetadata } from '@/next/seo';
import { ProductView } from '@/views/products/ProductView';
import { productMeta } from '@/views/meta';

type Props = Readonly<{ params: Promise<{ id: string; segment: string }> }>;

// A product's buyer-segment pages (i18n/routes.js PRODUCT_SEGMENTS): only the declared ones exist, any other URL is answered
// by the global 404.
export const dynamicParams = false;
export const generateStaticParams = () =>
  Object.entries(PRODUCT_SEGMENTS).flatMap(([id, segments]) => Object.keys(segments).map(segment => ({ id, segment })));

const pageAt = async ({ params }: Props) => {
  const { id, segment } = await params;
  const product = products.find(p => p.id === id);
  return product && isProductSegment(id, segment) ? { product, segment } : notFound();
};

export async function generateMetadata(props: Props) {
  const { product, segment } = await pageAt(props);
  return pageMetadata({ lang: 'en', path: `/products/${product.id}/${segment}`, ...productMeta('en', product, segment) });
}

export default async function Page(props: Props) {
  const { product, segment } = await pageAt(props);
  return <ProductView lang="en" product={product} segment={segment} />;
}
