import { cassavaKoreaGuides } from '@/data/cassavaKoreaGuides';
import { pageMetadata } from '@/next/seo';
import { CassavaGuideView } from '@/views/products/CassavaGuideView';

type Props = Readonly<{ params: Promise<{ slug: string }> }>;
type Slug = keyof typeof cassavaKoreaGuides.items;

// Korean buyer guides about dried cassava chips (i18n/routes.js KO_CASSAVA_GUIDES): original content in one language, so
// its own canonical and no hreflang. Only the entries of the data exist (404 otherwise).
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(cassavaKoreaGuides.items).map(slug => ({ slug }));

export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug as Slug;
  return pageMetadata({ lang: 'ko', path: `/ko/tapioca-chips/${slug}`, languages: {}, ...cassavaKoreaGuides.items[slug].seo });
}

export default async function Page({ params }: Props) {
  return <CassavaGuideView locale="ko" slug={(await params).slug} />;
}
