// Vite page adapter: the product from the router's :id; an unknown id renders a not-found heading (soft 404).
import { useParams } from 'react-router-dom';
import { PageMeta } from '@/components/common/PageMeta';
import { products } from '@/data/hmv';
import { useLang } from '@/i18n/LanguageContext';
import { PRODUCT_SEGMENTS } from '@/i18n/routes';
import { productMeta } from '../meta';
import { ProductView } from './ProductView';

export function ProductDetailPage() {
  const lang = useLang();
  const { id, segment } = useParams();
  // A segment page exists only where the route contract declares it (i18n/routes.js PRODUCT_SEGMENTS).
  const product = products.find(p => p.id === id && (!segment || Object.hasOwn(PRODUCT_SEGMENTS[id] ?? {}, segment)));
  return (
    <>
      <PageMeta lang={lang} {...productMeta(lang, product, segment)} />
      <ProductView lang={lang} product={product} segment={segment} />
    </>
  );
}
