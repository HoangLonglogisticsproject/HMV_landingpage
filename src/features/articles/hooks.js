import { useEffect, useState } from 'react';
import { photos } from '@/data/hmv';
import { articles, articleSlug, findArticle } from '@/data/articles';
import { fetchArticles, resolveArticle } from './api.js';

// `vite --mode cms` / `vite build --mode cms` (.env.cms) switch EcoNews to the CMS public API.
// Every other build, production included, keeps the bundled articles in data/articles.js.
// With the CMS on there is no fallback to bundled articles: failures render error states.
const CMS_CONTENT = import.meta.env.VITE_CMS_CONTENT === 'true';

// States: loading | ready | empty | error | not-found | unavailable | redirect
function useFetched(key, load) {
  const [state, setState] = useState({ key: null });
  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal).then(
      result => { if (!ctrl.signal.aborted) setState({ key, ...result }); },
      error => { if (!ctrl.signal.aborted) setState({ key, status: 'error', error }); },
    );
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` encodes every input of `load`
  }, [key]);
  return state.key === key ? state : { status: 'loading' };
}

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
