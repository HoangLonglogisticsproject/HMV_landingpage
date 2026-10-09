import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { articleLocales, findArticle, getArticles } from '@/lib/articles';
import { isLocale, seoHead, ui, type Locale } from '@/lib/i18n';
import { breadcrumbLd, jsonLd } from '@/lib/schema';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/$lang/insights/$slug')({
  loader: ({ params }) => {
    if (!isLocale(params.lang)) throw notFound();
    const article = findArticle(params.slug, params.lang);
    if (!article) throw notFound();
    return { article, locale: params.lang };
  },
  head: ({ params, loaderData }) => {
    const locale = (isLocale(params.lang) ? params.lang : 'en') as Locale;
    if (!loaderData) return seoHead({ locale, path: `/insights/${params.slug}`, title: `${ui[locale].insights.notFound} | HMV Global`, description: ui[locale].insights.notFound, noindex: true });
    const a = loaderData.article; const t = ui[locale];
    return { ...seoHead({ locale, path: `/insights/${a.slug}`, title: `${a.title} | HMV Global`, description: a.summary, type: 'article', available: articleLocales(a.slug) }), scripts: [jsonLd([{ '@type': 'Article', headline: a.title, description: a.summary, inLanguage: locale, datePublished: a.published, dateModified: a.updated, image: a.image, articleSection: a.topic, author: { '@type': 'Organization', name: 'HMV Global Co., LTD' }, publisher: { '@type': 'Organization', name: 'HMV Global Co., LTD' }, mainEntityOfPage: `/${locale}/insights/${a.slug}` }, breadcrumbLd([['HMV Global', `/${locale}`], [t.nav.insights, `/${locale}/insights`], [a.title, `/${locale}/insights/${a.slug}`]])])] };
  },
  component: ArticlePage,
  notFoundComponent: ArticleNotFound,
});
function ArticleNotFound() { return <main className="page-width py-24"><h1 className="text-3xl font-semibold">Perspective not found / Không tìm thấy bài viết</h1><Button asChild variant="link" className="mt-6 px-0"><Link to="/$lang/insights" params={{ lang: 'en' }}><ArrowLeft /> All perspectives</Link></Button></main>; }
function ArticlePage() {
  const { article, locale } = Route.useLoaderData();
  const t = ui[locale].insights;
  const date = (d: string) => new Date(d).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return <main><article className="page-width py-12 lg:py-18"><Button asChild variant="link" className="mb-10 px-0"><Link to="/$lang/insights" params={{ lang: locale }}><ArrowLeft /> {t.all}</Link></Button><div className="max-w-210"><p className="eyebrow text-primary">{article.topic} / HMV</p><h1 className="article-title mt-5 font-semibold">{article.title}</h1><p className="mt-6 max-w-170 text-base leading-8 text-muted-foreground">{article.summary}</p><p className="mt-5 text-xs text-muted-foreground">{t.published} <time dateTime={article.published}>{date(article.published)}</time> · {t.updated} <time dateTime={article.updated}>{date(article.updated)}</time></p></div><img src={article.image} alt={article.imageAlt} width={1536} height={1024} loading="lazy" className="mt-10 aspect-[2/1] w-full object-cover" /><div className="mx-auto mt-12 max-w-180">{article.sections.map(section => <section key={section.heading} className="mb-10"><h2 className="text-2xl font-semibold">{section.heading}</h2><p className="mt-4 text-base leading-8 text-muted-foreground">{section.text}</p></section>)}<aside className="border-t border-border pt-7"><h2 className="eyebrow text-primary">{t.sources}</h2><ul className="mt-4 grid gap-3">{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm text-primary underline underline-offset-4">{source.name}<ArrowUpRight className="size-4 shrink-0" /></a></li>)}</ul><p className="mt-6 text-xs leading-6 text-muted-foreground">{t.disclaimer}</p></aside></div></article><section className="border-t border-border bg-muted py-14"><div className="page-width"><h2 className="text-2xl font-semibold">{t.more}</h2><div className="mt-7 grid gap-6 md:grid-cols-3">{getArticles(locale).filter(a => a.slug !== article.slug).slice(0, 3).map(a => <Link key={a.slug} to="/$lang/insights/$slug" params={{ lang: locale, slug: a.slug }} className="border-t border-border py-5"><p className="eyebrow text-primary">{a.topic}</p><h3 className="mt-3 text-lg font-semibold">{a.title}</h3><ArrowUpRight className="mt-5 size-5 text-primary" /></Link>)}</div></div></section></main>;
}
