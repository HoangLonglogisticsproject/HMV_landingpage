import { ArticlePage, articleMetadata, articleSlugs } from '@/next/article';

type Props = { params: Promise<{ slug: string }> };

// Known slugs are prerendered; others (new CMS articles) render on first request and are then cached. An unknown
// slug is a 404 with a client-rendered body (architecture §10).
export const dynamicParams = true;
export const generateStaticParams = articleSlugs;
export const generateMetadata = async ({ params }: Props) => articleMetadata('vi', (await params).slug);

export default async function Page({ params }: Props) {
  return <ArticlePage lang="vi" slug={(await params).slug} />;
}
