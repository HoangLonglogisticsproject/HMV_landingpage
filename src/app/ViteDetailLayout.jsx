import { PageMeta } from '@/components/common/PageMeta';
import { DetailLayout } from '@/components/layout/DetailLayout';

// Vite only: DetailLayout plus the client-side head tags it used to render itself.
// `seo` overrides the meta title/description when they differ from the visible heading (CMS pages).
export function ViteDetailLayout({ seo, ...props }) {
  return (
    <>
      <PageMeta lang={props.lang} title={seo?.title || props.title} description={seo?.description || props.description} />
      <DetailLayout {...props} />
    </>
  );
}
