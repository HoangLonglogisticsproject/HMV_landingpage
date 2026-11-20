// Bundled EcoNews articles (data/articles.js) in the view shape the CMS client returns (api.js).
// Pure, no hooks or transport: shared by the Vite hooks (hooks.js) and the Next.js routes.
import { photos } from '@/data/hmv';
import { articles, articleSlug, findArticle } from '@/data/articles';
import { cassavaEvidence } from '@/data/cassavaEvidence';

const dims = { farm: [1280, 960], factory: [768, 1024], farmTeam: [1308, 1600] };
// Article photographs by key: the site's (data/hmv.js) and the cassava supply evidence as `cassava-<id>`.
const IMAGES = {
  ...Object.fromEntries(Object.entries(dims).map(([key, [width, height]]) => [key, { src: photos[key], width, height }])),
  ...Object.fromEntries(cassavaEvidence.photos.map(p => [`cassava-${p.id}`, p])),
};

// Inline links in bundled copy: `[text](/path)`, a Tiptap link mark, so RichText renders and checks them like CMS links.
// A linear scan rather than a regular expression (no backtracking); copy has no other square brackets.
function inline(text) {
  const nodes = [];
  let rest = text;
  for (;;) {
    const open = rest.indexOf('[');
    const middle = open < 0 ? -1 : rest.indexOf('](', open);
    const close = middle < 0 ? -1 : rest.indexOf(')', middle);
    if (close < 0) break;
    if (open > 0) nodes.push({ type: 'text', text: rest.slice(0, open) });
    nodes.push({ type: 'text', text: rest.slice(open + 1, middle), marks: [{ type: 'link', attrs: { href: rest.slice(middle + 2, close) } }] });
    rest = rest.slice(close + 1);
  }
  if (rest) nodes.push({ type: 'text', text: rest });
  return nodes;
}

function toNode([tag, c]) {
  if (tag === 'h2') return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: c }] };
  if (tag === 'ul') return { type: 'bulletList', content: c.map(([b, t]) => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: b, marks: [{ type: 'bold' }] }, ...inline(` ${t}`)] }] })) };
  return { type: 'paragraph', content: inline(c) };
}

/** Bundled copy blocks (['p' | 'h2', text] or ['ul', [[bold, text]]]) as a Tiptap document for RichText. */
export const toDoc = blocks => ({ type: 'doc', content: blocks.map(toNode) });

function staticView(a, lang) {
  const image = IMAGES[a.image];
  return {
    key: a.id,
    slug: articleSlug(a),
    alternates: { ...a.slug },
    title: a.title[lang],
    metaTitle: a.title[lang],
    description: a.description[lang],
    category: a.category[lang],
    author: null,
    date: { iso: a.iso, label: a.date[lang] },
    image: image?.src ? { src: image.src, width: image.width, height: image.height, alt: a.alt[lang], position: a.imagePosition } : null,
    content: toDoc(a.body[lang]),
    cta: a.cta[lang],
    product: a.product,
    // The analytics source of the article's HMV Trade Desk call to action, where it has one (ArticleView).
    tradeDesk: a.tradeDesk?.[lang],
  };
}

/** Every bundled article as `{ en, vi }` slugs (the same shape as the CMS index). */
export const bundledArticleIndex = () => articles.map(a => ({ ...a.slug }));

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
