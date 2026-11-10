// Vite page adapter: the product from the router's :id; an unknown id renders a not-found heading (soft 404).
import { useParams } from 'react-router-dom';
import { PageMeta } from '@/components/common/PageMeta';
import { products } from '@/data/hmv';
import { useLang } from '@/i18n/LanguageContext';
import { productMeta } from '../meta';
import { ProductView } from './ProductView';

export function ProductDetailPage() {
  const lang = useLang();
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  return (
    <>
      <PageMeta lang={lang} {...productMeta(lang, product)} />
      <ProductView lang={lang} product={product} />
    </>
  );
}
