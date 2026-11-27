import { notFound } from 'next/navigation';
import { products } from '@/data/hmv';
import { PRODUCT_SEGMENTS, PRODUCT_SLUG_VI, SEGMENT_ID } from '@/i18n/routes';
import { pageMetadata } from '@/next/seo';
import { ProductView } from '@/views/products/ProductView';
import { productMeta } from '@/views/meta';

type Props = Readonly<{ params: Promise<{ slug: string; segment: string }> }>;

// A product's buyer-segment pages under their Vietnamese slugs (i18n/routes.js PRODUCT_SEGMENTS): only the declared ones
// exist, any other URL is answered by the global 404.
export const dynamicParams = false;
export const generateStaticParams = () =>
  Object.entries(PRODUCT_SEGMENTS).flatMap(([id, segments]) => Object.values(segments).map(segment => ({ slug: PRODUCT_SLUG_VI[id], segment })));

const pageAt = async ({ params }: Props) => {
  const { slug, segment: viSegment } = await params;
  const product = products.find(p => PRODUCT_SLUG_VI[p.id] === slug);
  const segment = product && SEGMENT_ID[product.id]?.[viSegment];
  return product && segment ? { product, segment } : notFound();
};

export async function generateMetadata(props: Props) {
  const { product, segment } = await pageAt(props);
  return pageMetadata({ lang: 'vi', path: `/products/${product.id}/${segment}`, ...productMeta('vi', product, segment) });
}

export default async function Page(props: Props) {
  const { product, segment } = await pageAt(props);
  return <ProductView lang="vi" product={product} segment={segment} />;
}
