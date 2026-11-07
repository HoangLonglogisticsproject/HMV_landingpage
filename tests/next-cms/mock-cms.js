// Mock of the HMV CMS public API for the Next.js CMS-mode suite: the routes and payload shapes of
// CMS_HMV docs/api/openapi-spec.json, the CMS's own Cache-Control on every response (404s included), and a
// /__mock control API to unpublish content, fail requests and read the request log.
import http from 'node:http';
import { about } from '../../src/data/about.js';
import { MOCK_PORT } from './env.js';

const API = '/api/v1/public';
const CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=300';
const doc = text => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });

function article(id, locale, slug, title, alternates) {
  return {
    id, locale, slug, title, excerpt: `${title} excerpt`,
    category: { code: 'SUPPLY_CHAIN_INSIGHTS', name: locale === 'vi' ? 'Thông Tin Chuỗi Cung Ứng' : 'Supply Chain Insights' },
    cover: null, isFeatured: false, authorName: null, authorRole: null, readTimeMinutes: 1,
    publishedAt: '2026-10-13T10:00:00.000Z', updatedAt: '2026-10-13T10:00:00.000Z',
    content: doc(`${title} body`), seo: { title, description: `${title} description` }, alternates,
  };
}
const pair = (id, [en, enTitle], [vi, viTitle]) => [
  article(id, 'en', en, enTitle, [{ locale: 'vi', slug: vi }]),
  article(id, 'vi', vi, viTitle, [{ locale: 'en', slug: en }]),
];
const page = (locale, content) => ({
  key: 'about', locale, title: content.hero.title, seo: { title: content.hero.title, description: content.hero.lead }, content,
  publishedAt: '2026-10-20T08:00:00.000Z', updatedAt: '2026-10-20T08:00:00.000Z', alternates: [],
});
const cmsAbout = lang => ({ ...about[lang], hero: { ...about[lang].hero, title: `[CMS] ${about[lang].hero.title}` } });

const initial = () => ({
  articles: [
    ...pair('a', ['cms-trade-update', '[CMS] Trade update'], ['cms-cap-nhat-thuong-mai', '[CMS] Cập nhật thương mại']),
    article('b', 'vi', 'cms-chi-tieng-viet', '[CMS] Chỉ tiếng Việt', []),
    ...pair('c', ['cms-blocked', '[CMS] Blocked'], ['cms-bi-chan', '[CMS] Bị chặn']),
    ...pair('d', ['cms-takedown', '[CMS] Takedown'], ['cms-go-bo', '[CMS] Gỡ bỏ']),
  ],
  pages: { en: page('en', cmsAbout('en')), vi: page('vi', cmsAbout('vi')) },
  fail: 0,
  requests: [],
});
let state = initial();

const summary = ({ content: _c, seo: _s, alternates: _a, ...rest }) => rest;
const notFound = { statusCode: 404, code: 'NOT_FOUND', message: 'Not found' };

function publicApi(url) {
  if (state.fail) return [state.fail, { statusCode: state.fail, code: 'UNAVAILABLE', message: 'Unavailable' }];
  const locale = url.searchParams.get('locale');
  const route = url.pathname.slice(API.length);
  if (route === '/articles') {
    const items = state.articles.filter(a => a.locale === locale).slice(0, Number(url.searchParams.get('pageSize')));
    return [200, { items: items.map(summary), page: 1, pageSize: items.length, total: items.length }];
  }
  if (route === '/pages/about') return state.pages[locale] ? [200, state.pages[locale]] : [404, notFound];
  const slug = decodeURIComponent(route.match(/^\/articles\/([^/]+)$/)?.[1] ?? '');
  const found = state.articles.find(a => a.slug === slug && a.locale === locale);
  return found ? [200, found] : [404, notFound];
}

function control(url) {
  const q = url.searchParams;
  switch (url.pathname) {
    case '/__mock/reset': state = initial(); break;
    case '/__mock/unpublish': state.articles = state.articles.filter(a => a.slug !== q.get('slug')); break;
    case '/__mock/unpublish-page': delete state.pages[q.get('locale')]; break;
    case '/__mock/fail': state.fail = Number(q.get('status')) || 0; break;
    case '/__mock/reset-requests': state.requests = []; break;
    case '/__mock/requests': return state.requests;
    case '/__mock/health': return { ok: true };
    default: return null;
  }
  return { ok: true };
}

export function startMockCms(port = MOCK_PORT) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (url.pathname.startsWith(API)) {
      state.requests.push({ path: url.pathname + url.search, cacheControl: req.headers['cache-control'] ?? null });
      const [status, body] = publicApi(url);
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': CACHE_CONTROL });
      return res.end(JSON.stringify(body));
    }
    const body = control(url);
    res.writeHead(body ? 200 : 404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body ?? notFound));
  });
  return new Promise(resolve => server.listen(port, () => resolve(server)));
}
