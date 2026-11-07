// Vite data adapter for website pages: bundled copy, or the CMS public pages API from the browser in CMS mode.
import { browserCms } from '@/app/cms';
import { CMS_CONTENT, useFetched } from '@/lib/useFetched';
import { fetchPage } from './api.js';
import { bundledPage } from './bundled.js';

function useCmsPage(key, lang) {
  return useFetched(`${key}|${lang}`, signal => fetchPage(browserCms(signal), { key, locale: lang }));
}

/** States: loading | ready (`page: { content, seo }`) | not-found | error. Content shape: CMS page type for `key`. */
export const usePage = CMS_CONTENT ? useCmsPage : bundledPage;
