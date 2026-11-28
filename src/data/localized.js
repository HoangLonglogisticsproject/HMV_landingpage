// Resolves the localized leaves of a content tree (a leaf is a function of the language, `lang => text`); everything else
// is shared as is. Used by the product pages' content (productPages.js, passionFruitPages.js).
export const resolve = (node, lang) => {
  if (typeof node === 'function') return node(lang);
  if (Array.isArray(node)) return node.map(n => resolve(n, lang));
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolve(v, lang)]));
  return node;
};
