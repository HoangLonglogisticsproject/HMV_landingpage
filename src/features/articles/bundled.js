// Bundled EcoNews articles (data/articles.js) in the view shape the CMS client returns (api.js).
// Pure, no hooks or transport: shared by the Vite hooks (hooks.js) and the Next.js routes.
import { photos } from '@/data/hmv';
import { articles, articleSlug, findArticle } from '@/data/articles';

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

export const listBundledArticles = (lang, { pageSize }) => ({
  status: 'ready',
  items: articles.slice(0, pageSize).map(a => staticView(a, lang)),
});

/** The article with this slug (in either language) as rendered in `lang`, or null. */
export function bundledArticle(slug, lang) {
  const a = findArticle(slug);
  return a ? staticView(a, lang) : null;
}

// MIGRATION-ONLY (Vite): URLs are locale-free, so one canonical (English) slug serves both languages. Next.js resolves
// slugs per locale (src/next/article.tsx).
export function resolveBundledArticle(slug, lang) {
  const a = findArticle(slug);
  if (!a) return { status: 'redirect', to: '/insights' };
  if (articleSlug(a) !== slug) return { status: 'redirect', to: `/blog/${articleSlug(a)}` };
  return { status: 'ready', article: staticView(a, lang) };
}
