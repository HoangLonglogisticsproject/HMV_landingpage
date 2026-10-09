import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { articles } from '@/lib/articles';

export function InsightsTabs() {
  return <Tabs defaultValue={articles[0]?.slug}>
    <TabsList aria-label="Article topics" className="insight-tabs h-auto w-full justify-start gap-3 rounded-none border-b border-border bg-transparent p-0">{articles.map(article => <TabsTrigger key={article.slug} value={article.slug} className="shrink-0 rounded-none border-b-2 border-transparent px-0 py-4 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">{article.topic}</TabsTrigger>)}</TabsList>
    {articles.map((article, i) => <TabsContent key={article.slug} value={article.slug} className="mt-8"><div className="grid items-center gap-8 md:grid-cols-2 lg:gap-16"><Link to="/insights/$slug" params={{ slug: article.slug }} aria-label={article.title} className="overflow-hidden"><img src={article.image} width={1536} height={1024} loading="lazy" alt={article.imageAlt} className="aspect-[3/2] w-full object-cover transition-transform duration-700 hover:scale-105" /></Link><div><p className="eyebrow text-primary">Perspective 0{i + 1} / {article.topic}</p><h3 className="mt-5 text-2xl font-semibold leading-snug lg:text-3xl"><Link to="/insights/$slug" params={{ slug: article.slug }}>{article.title}</Link></h3><p className="mt-5 max-w-110 text-sm leading-7 text-muted-foreground">{article.summary}</p><Button asChild variant="link" className="mt-5 px-0"><Link to="/insights/$slug" params={{ slug: article.slug }}>Read perspective <ArrowUpRight /></Link></Button></div></div></TabsContent>)}
  </Tabs>;
}