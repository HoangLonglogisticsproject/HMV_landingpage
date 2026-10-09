import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { findArticle, articles } from '@/lib/articles';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/insights/$slug')({
  loader: ({ params }) => {
    const article = findArticle(params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} | HMV Global` : 'Perspective not found | HMV Global';
    const description = loaderData?.summary ?? 'The requested HMV Global perspective is unavailable.';
    return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' }, ...(!loaderData ? [{ name: 'robots', content: 'noindex' }] : [])], scripts: loaderData ? [{ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: loaderData.title, description: loaderData.summary, author: { '@type': 'Organization', name: 'HMV Global Co., LTD' }, publisher: { '@type': 'Organization', name: 'HMV Global Co., LTD' }, articleSection: loaderData.topic }) }] : [] };
  },
  component: ArticlePage,
  notFoundComponent: ArticleNotFound,
});
function ArticleNotFound() { return <main className="page-width py-24"><h1 className="text-3xl font-semibold">Perspective not found</h1><Button asChild variant="link" className="mt-6 px-0"><Link to="/insights"><ArrowLeft /> All perspectives</Link></Button></main>; }
function ArticlePage() {
  const article = Route.useLoaderData();
  return <main><article className="page-width py-12 lg:py-18"><Button asChild variant="link" className="mb-10 px-0"><Link to="/insights"><ArrowLeft /> All perspectives</Link></Button><div className="max-w-210"><p className="eyebrow text-primary">{article.topic} / HMV perspectives</p><h1 className="article-title mt-5 font-semibold">{article.title}</h1><p className="mt-6 max-w-170 text-base leading-8 text-muted-foreground">{article.summary}</p></div><img src={article.image} alt={article.imageAlt} width={1536} height={1024} loading="lazy" className="mt-10 aspect-[2/1] w-full object-cover" /><div className="mx-auto mt-12 max-w-180">{article.sections.map(section => <section key={section.heading} className="mb-10"><h2 className="text-2xl font-semibold">{section.heading}</h2><p className="mt-4 text-base leading-8 text-muted-foreground">{section.text}</p></section>)}<aside className="border-t border-border pt-7"><h2 className="eyebrow text-primary">Sources & further reading</h2><ul className="mt-4 grid gap-3">{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm text-primary underline underline-offset-4">{source.name}<ArrowUpRight className="size-4 shrink-0" /></a></li>)}</ul><p className="mt-6 text-xs leading-6 text-muted-foreground">General commercial information, not certification, investment or regulatory advice. Product specifications, supporting documentation and supply arrangements are confirmed per quotation.</p></aside></div></article><section className="border-t border-border bg-muted py-14"><div className="page-width"><h2 className="text-2xl font-semibold">More perspectives</h2><div className="mt-7 grid gap-6 md:grid-cols-3">{articles.filter(a => a.slug !== article.slug).slice(0,3).map(a => <Link key={a.slug} to="/insights/$slug" params={{ slug: a.slug }} className="border-t border-border py-5"><p className="eyebrow text-primary">{a.topic}</p><h3 className="mt-3 text-lg font-semibold">{a.title}</h3><ArrowUpRight className="mt-5 size-5 text-primary" /></Link>)}</div></div></section></main>;
}