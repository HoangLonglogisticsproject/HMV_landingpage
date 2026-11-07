import { products } from '@/data/hmv';
import { PRODUCT_SLUG_VI } from '@/i18n/routes';
import { pageMetadata } from '@/next/seo';
import { ProductView } from '@/views/products/ProductView';
import { productMeta } from '@/views/meta';

type Props = { params: Promise<{ slug: string }> };

// Only the bundled products exist: any other slug is answered by the global 404.
export const dynamicParams = false;
export const generateStaticParams = () => products.map(p => ({ slug: PRODUCT_SLUG_VI[p.id] }));

const productAt = async ({ params }: Props) => {
  const { slug } = await params;
  return products.find(p => PRODUCT_SLUG_VI[p.id] === slug);
};

export async function generateMetadata(props: Props) {
  const product = await productAt(props);
  return pageMetadata({ lang: 'vi', path: `/products/${product.id}`, ...productMeta('vi', product) });
}

export default async function Page(props: Props) {
  return <ProductView lang="vi" product={await productAt(props)} />;
}
