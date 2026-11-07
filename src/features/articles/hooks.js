// Vite data adapter for EcoNews: bundled articles, or the CMS public API from the browser in CMS mode.
import { browserCms } from '@/app/cms';
import { CMS_CONTENT, useFetched } from '@/lib/useFetched';
import { fetchArticles, resolveArticle } from './api.js';
import { listBundledArticles, resolveBundledArticle } from './bundled.js';

// States: loading | ready | empty | error | not-found | unavailable | redirect

function useCmsList(lang, { pageSize }) {
  return useFetched(`${lang}|${pageSize}`, signal =>
    fetchArticles(browserCms(signal), { locale: lang, pageSize }).then(items => ({ status: items.length ? 'ready' : 'empty', items })));
}

function useCmsArticle(slug, lang) {
  return useFetched(`${lang}|${slug}`, signal => resolveArticle(browserCms(signal), { slug, lang }));
}

export const useArticleList = CMS_CONTENT ? useCmsList : listBundledArticles;
export const useArticle = CMS_CONTENT ? useCmsArticle : resolveBundledArticle;
