import { ArticlePage, articleMetadata, articleSlugs } from '@/next/article';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = articleSlugs;
export const generateMetadata = async ({ params }: Props) => articleMetadata('en', (await params).slug);

export default async function Page({ params }: Props) {
  return <ArticlePage lang="en" slug={(await params).slug} />;
}
