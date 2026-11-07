import 'server-only';
import { fetchArticleIndex, fetchArticles, resolveArticle } from '@/features/articles/api';
import { bundledArticle, bundledArticleIndex, listBundledArticles } from '@/features/articles/bundled';
import { fetchPage } from '@/features/pages/api';
import { bundledPage } from '@/features/pages/bundled';
import { cmsGet } from '@/next/cms';
import type { Lang } from '@/next/seo';

// Content for the Next.js routes, in the state shapes the shared views render: bundled, or the CMS when
// CMS_CONTENT=true (server environment, read at build and at regeneration).
const CMS = process.env.CMS_CONTENT === 'true';
// Emergency takedown without the CMS (architecture §9.3): a listed slug answers 404 under every URL form that
// resolves to it and leaves the lists, the alternates and the sitemap. Slugs are per locale: list both
// translations' slugs to remove an article in both languages.
const BLOCKED = new Set((process.env.CMS_BLOCKED_SLUGS ?? '').split(',').map(s => s.trim()).filter(Boolean));
const INDEX_SIZE = 100; // the CMS maximum page size
const NOT_FOUND = { status: 'not-found' } as const;

type Slugs = Partial<Record<Lang, string>>;
const withoutBlocked = (slugs: Slugs): Slugs => Object.fromEntries(Object.entries(slugs).filter(([, s]) => !BLOCKED.has(s)));

export const loadPage = (key: string, lang: Lang) => (CMS ? fetchPage(cmsGet, { key, locale: lang }) : bundledPage(key, lang));

export async function loadArticleList(lang: Lang, pageSize: number) {
  if (!CMS) return listBundledArticles(lang, { pageSize });
  const items = (await fetchArticles(cmsGet, { locale: lang, pageSize })).filter(a => !BLOCKED.has(a.slug));
  return { status: items.length ? 'ready' : 'empty', items };
}

/** Every article as `{ en?: slug, vi?: slug }`. */
export async function loadArticleIndex() {
  const index: Slugs[] = CMS ? await fetchArticleIndex(cmsGet, { pageSize: INDEX_SIZE }) : bundledArticleIndex();
  return index.map(withoutBlocked).filter(slugs => Object.keys(slugs).length);
}

/** ready | redirect (`to`: an English key path) | unavailable (published in `locale` only) | not-found. */
export async function loadArticle(lang: Lang, slug: string) {
  if (BLOCKED.has(slug)) return NOT_FOUND;
  const state = CMS ? await resolveArticle(cmsGet, { slug, lang }) : bundledResolution(lang, slug);
  if (state.status === 'redirect' && BLOCKED.has(state.to.split('/').pop() ?? '')) return NOT_FOUND;
  if (state.status === 'ready') return { ...state, article: { ...state.article, alternates: withoutBlocked(state.article.alternates) } };
  return state;
}

// Bundled pairs are known: the other language's slug redirects to this language's slug.
function bundledResolution(lang: Lang, slug: string) {
  const article = bundledArticle(slug, lang);
  if (!article) return NOT_FOUND;
  const own: string = article.alternates[lang];
  return own === slug ? { status: 'ready' as const, article } : { status: 'redirect' as const, to: `/blog/${own}` };
}
