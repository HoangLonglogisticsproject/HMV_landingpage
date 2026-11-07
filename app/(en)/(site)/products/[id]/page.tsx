import { notFound } from 'next/navigation';
import { products } from '@/data/hmv';
import { pageMetadata } from '@/next/seo';
import { ProductView } from '@/views/products/ProductView';
import { productMeta } from '@/views/meta';

type Props = { params: Promise<{ id: string }> };

// Only the bundled products exist: any other id is answered by the global 404.
export const dynamicParams = false;
export const generateStaticParams = () => products.map(p => ({ id: p.id }));

const productAt = async ({ params }: Props) => {
  const { id } = await params;
  return products.find(p => p.id === id) ?? notFound();
};

export async function generateMetadata(props: Props) {
  const product = await productAt(props);
  return pageMetadata({ lang: 'en', path: `/products/${product.id}`, ...productMeta('en', product) });
}

export default async function Page(props: Props) {
  return <ProductView lang="en" product={await productAt(props)} />;
}
