import { photos } from '@/data/hmv';
import { articles, articleSlug, findArticle } from '@/data/articles';
import { CMS_CONTENT, useFetched } from '@/lib/useFetched';
import { fetchArticles, resolveArticle } from './api.js';

// States: loading | ready | empty | error | not-found | unavailable | redirect

function useCmsList(lang, { pageSize }) {
  return useFetched(`${lang}|${pageSize}`, signal =>
    fetchArticles({ locale: lang, pageSize, signal }).then(items => ({ status: items.length ? 'ready' : 'empty', items })));
}

function useCmsArticle(slug, lang) {
  return useFetched(`${lang}|${slug}`, signal => resolveArticle({ slug, lang, signal }));
}

// Bundled articles, mapped to the same view shape as CMS articles (see api.js).
const dims = { farm: [1280, 960], factory: [768, 1024], farmTeam: [1308, 1600] };

const toDoc = blocks => ({
  type: 'doc',
  content: blocks.map(([tag, c]) =>
    tag === 'h2' ? { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: c }] }
    : tag === 'ul' ? { type: 'bulletList', content: c.map(([b, t]) => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: b, marks: [{ type: 'bold' }] }, { type: 'text', text: ` ${t}` }] }] })) }
    : { type: 'paragraph', content: [{ type: 'text', text: c }] }),
});

function staticView(a, lang) {
  const [width, height] = dims[a.image] ?? [];
  return {
    key: a.id,
    slug: articleSlug(a),
    title: a.title[lang],
    metaTitle: a.title[lang],
    description: a.description[lang],
    category: a.category[lang],
    date: { iso: a.iso, label: a.date[lang] },
    image: photos[a.image] ? { src: photos[a.image], width, height, alt: a.alt[lang], position: a.imagePosition } : null,
    content: toDoc(a.body[lang]),
    cta: a.cta[lang],
  };
}

function useStaticList(lang, { pageSize }) {
  return { status: 'ready', items: articles.slice(0, pageSize).map(a => staticView(a, lang)) };
}

function useStaticArticle(slug, lang) {
  const a = findArticle(slug);
  if (!a) return { status: 'redirect', to: '/insights' };
  // One canonical (English) slug serves both languages.
  if (articleSlug(a) !== slug) return { status: 'redirect', to: `/blog/${articleSlug(a)}` };
  return { status: 'ready', article: staticView(a, lang) };
}

export const useArticleList = CMS_CONTENT ? useCmsList : useStaticList;
export const useArticle = CMS_CONTENT ? useCmsArticle : useStaticArticle;
