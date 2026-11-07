import { localizePath } from '@/i18n/routes';
import { loadArticle } from '@/next/content';

// The CMS admin's public link format (URL matrix M-56): to the Vietnamese article when the slug is Vietnamese,
// else to the English one, else 404.
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  for (const lang of ['vi', 'en'] as const) {
    if ((await loadArticle(lang, slug)).status === 'ready') {
      return Response.redirect(new URL(localizePath(`/blog/${slug}`, lang), request.url), 308);
    }
  }
  return new Response('Not found', { status: 404 });
}
