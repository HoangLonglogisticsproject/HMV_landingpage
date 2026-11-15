import { koreaTapiocaMarket } from '@/data/koreaTapiocaMarket';
import { pageMetadata } from '@/next/seo';
import { TapiocaMarketView } from '@/views/tapioca-market/TapiocaMarketView';

// Korean-only original content (i18n/routes.js SCOPED_CONTENT_PAGES): its own canonical, no translations, so no hreflang.
export const metadata = pageMetadata({ lang: 'ko', path: '/ko/tapioca-market', languages: {}, ...koreaTapiocaMarket.seo });

export default function Page() {
  return <TapiocaMarketView />;
}
