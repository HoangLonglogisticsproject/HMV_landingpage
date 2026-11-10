// Server HTML helpers for the Next.js suites (tests/next, tests/next-cms): head tags and visible text, without a browser.

export const SITE = 'https://www.hmv-global.com';
// Next.js writes the root URL in head tags without the trailing slash.
export const abs = path => (path === '/' ? SITE : `${SITE}${path}`);

export const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) =>
    Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, k, v]) => [k.toLowerCase(), v])));
const ENTITIES = { '&amp;': '&', '&#x27;': "'", '&quot;': '"', '&lt;': '<', '&gt;': '>' };
const text = (html, re) =>
  (html.match(re)?.[1] ?? '').replace(/<[^>]+>/g, '').replace(/&(amp|#x27|quot|lt|gt);/g, e => ENTITIES[e]).trim();
export const head = html => {
  const links = tags(html, 'link');
  const metas = tags(html, 'meta');
  return {
    lang: html.match(/<html[^>]*\blang="([^"]+)"/)?.[1],
    title: text(html, /<title>([\s\S]*?)<\/title>/),
    h1: text(html, /<h1[^>]*>([\s\S]*?)<\/h1>/),
    description: metas.find(m => m.name === 'description')?.content,
    robots: metas.find(m => m.name === 'robots')?.content,
    canonical: links.find(l => l.rel === 'canonical')?.href,
    ogUrl: metas.find(m => m.property === 'og:url')?.content,
    hreflang: Object.fromEntries(links.filter(l => l.rel === 'alternate' && l.hreflang).map(l => [l.hreflang, l.href])),
    jsonLd: JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? 'null'),
  };
};
