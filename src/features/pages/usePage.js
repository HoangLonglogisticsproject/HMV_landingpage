import { about } from '@/data/about';
import { CMS_CONTENT, useFetched } from '@/lib/useFetched';
import { fetchPage } from './api.js';

// Bundled copy per page key, in the same shape the CMS serves.
const BUNDLED = { about };

function useCmsPage(key, lang) {
  return useFetched(`${key}|${lang}`, signal => fetchPage({ key, locale: lang, signal }));
}

function useBundledPage(key, lang) {
  const content = BUNDLED[key][lang];
  return { status: 'ready', page: { content, seo: { title: content.hero.title, description: content.hero.lead } } };
}

/** States: loading | ready (`page: { content, seo }`) | not-found | error. Content shape: CMS page type for `key`. */
export const usePage = CMS_CONTENT ? useCmsPage : useBundledPage;
