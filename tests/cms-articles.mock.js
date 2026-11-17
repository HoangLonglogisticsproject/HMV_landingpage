// @ts-check
// The mocked CMS public API of the CMS article specs, with payloads shaped like CMS_HMV docs/api/openapi-spec.json.
export const API = '/api/v1/public';
export const category = { en: { code: 'SUPPLY_CHAIN_INSIGHTS', name: 'Supply Chain Insights' }, vi: { code: 'SUPPLY_CHAIN_INSIGHTS', name: 'Thông Tin Chuỗi Cung Ứng' } };
export const content = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Intro with ' }, { type: 'text', text: 'a source', marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'https://example.com/report', target: '_blank', rel: 'noopener noreferrer nofollow' } }] }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Section heading' }] },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Sub heading' }] },
    { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quoted line' }] }] },
    { type: 'orderedList', attrs: { start: 1, type: null }, content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Step one' }] }] }] },
    { type: 'image', attrs: { src: '/favicon.png', alt: 'Inline image alt', title: null, width: null, height: null, mediaId: '0199f3a0-0000-7000-8000-000000000001' } },
    { type: 'horizontalRule' },
  ],
};
export function article(locale, slug, title, alternates) {
  return {
    id: `id-${slug}`, locale, slug, title, excerpt: `${title} excerpt`, category: category[locale],
    cover: { url: '/og-image.jpg', width: 1200, height: 630, alt: `${title} cover` },
    isFeatured: false, authorName: null, authorRole: null, readTimeMinutes: 1,
    publishedAt: '2026-10-13T10:00:00.000Z', updatedAt: '2026-10-13T10:00:00.000Z',
    content, seo: { title, description: `${title} description` }, alternates,
  };
}
export const A_EN = article('en', 'test-econews-integration', '[TEST] EcoNews integration', [{ locale: 'vi', slug: 'test-econews-tich-hop' }]);
export const A_VI = article('vi', 'test-econews-tich-hop', '[TEST] Tích hợp EcoNews', [{ locale: 'en', slug: 'test-econews-integration' }]);
export const B_VI = article('vi', 'test-chi-tieng-viet', '[TEST] Chỉ tiếng Việt', []);
export const summary = ({ content: _c, seo: _s, alternates: _a, ...rest }) => rest;
export const list = (...items) => ({ items: items.map(summary), page: 1, pageSize: items.length, total: items.length });

export const PUBLISHED = {
  [`${API}/articles?locale=en&pageSize=3`]: list(A_EN),
  [`${API}/articles?locale=en&pageSize=100`]: list(A_EN),
  [`${API}/articles?locale=vi&pageSize=3`]: list(A_VI, B_VI),
  [`${API}/articles?locale=vi&pageSize=100`]: list(A_VI, B_VI),
  [`${API}/articles/test-econews-integration?locale=en`]: A_EN,
  [`${API}/articles/test-econews-tich-hop?locale=vi`]: A_VI,
  [`${API}/articles/test-chi-tieng-viet?locale=vi`]: B_VI,
};
export const STATIC_TITLES = /Exporting Passion Fruit|Optimizing Tropical Agri-Logistics|Circular Agriculture/;

/** routes: path+query → JSON body or HTTP status. Returns the intercepted requests. */
export async function mockCms(page, routes = PUBLISHED, { delay = 0 } = {}) {
  const requests = [];
  await page.route(`**${API}/**`, async route => {
    const req = route.request();
    const url = new URL(req.url());
    const key = url.pathname + url.search;
    requests.push({ key, headers: await req.allHeaders() });
    if (delay) await new Promise(r => setTimeout(r, delay));
    const r = routes[key];
    if (typeof r === 'number') return route.fulfill({ status: r, json: { statusCode: r, code: 'INTERNAL_ERROR', message: 'Unavailable' } });
    if (r) return route.fulfill({ json: r });
    return route.fulfill({ status: 404, json: { statusCode: 404, code: 'ARTICLE_NOT_FOUND', message: 'Article not found' } });
  });
  return requests;
}
