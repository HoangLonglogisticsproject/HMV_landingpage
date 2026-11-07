// Vite data adapter for EcoNews: bundled articles, or the CMS public API from the browser in CMS mode.
import { CMS_CONTENT, useFetched } from '@/lib/useFetched';
import { fetchArticles, resolveArticle } from './api.js';
import { listBundledArticles, resolveBundledArticle } from './bundled.js';

// States: loading | ready | empty | error | not-found | unavailable | redirect

function useCmsList(lang, { pageSize }) {
  return useFetched(`${lang}|${pageSize}`, signal =>
    fetchArticles({ locale: lang, pageSize, signal }).then(items => ({ status: items.length ? 'ready' : 'empty', items })));
}

function useCmsArticle(slug, lang) {
  return useFetched(`${lang}|${slug}`, signal => resolveArticle({ slug, lang, signal }));
}

export const useArticleList = CMS_CONTENT ? useCmsList : listBundledArticles;
export const useArticle = CMS_CONTENT ? useCmsArticle : resolveBundledArticle;
