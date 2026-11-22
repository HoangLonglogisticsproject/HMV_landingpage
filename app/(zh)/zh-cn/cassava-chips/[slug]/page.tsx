import { cassavaChinaGuides } from '@/data/cassavaChinaGuides';
import { pageMetadata } from '@/next/seo';
import { CassavaGuideView } from '@/views/products/CassavaGuideView';

type Props = Readonly<{ params: Promise<{ slug: string }> }>;
type Slug = keyof typeof cassavaChinaGuides.items;

// Simplified Chinese guides and market updates about dried cassava chips (i18n/routes.js ZH_CASSAVA_GUIDES): original
// content in one language, so its own canonical and no hreflang. Only the entries of the data exist (404 otherwise).
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(cassavaChinaGuides.items).map(slug => ({ slug }));

export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug as Slug;
  return pageMetadata({ lang: 'zh-CN', path: `/zh-cn/cassava-chips/${slug}`, languages: {}, ...cassavaChinaGuides.items[slug].seo });
}

export default async function Page({ params }: Props) {
  return <CassavaGuideView slug={(await params).slug} />;
}
