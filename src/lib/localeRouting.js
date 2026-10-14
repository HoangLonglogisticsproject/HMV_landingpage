import { findArticle } from '../data/articles.js';

export const SUPPORTED_LANGS = ['en', 'vi'];

/**
 * Resolves the localized path for the target language.
 * Preserves product details, nested compliance, and translates blog slugs.
 */
export function getLocalizedPathname(targetLang, currentPathname) {
  if (!currentPathname) return `/${targetLang}`;

  // 1. EcoNews / Blog articles with localized slugs
  const blogMatch = currentPathname.match(/^\/(en|vi)\/blog\/([^/?#]+)/);
  if (blogMatch) {
    const currentSlug = blogMatch[2];
    const article = findArticle(currentSlug);
    if (article && article.slug && article.slug[targetLang]) {
      return `/${targetLang}/blog/${article.slug[targetLang]}`;
    }
    // Safe fallback if article or translation is not found
    return `/${targetLang}/insights`;
  }

  // 2. Standard locale-prefixed routes (products/:id, supply-chain, about, etc.)
  if (/^\/(en|vi)(\/|$)/.test(currentPathname)) {
    return currentPathname.replace(/^\/(en|vi)(\/|$)/, `/${targetLang}$2`);
  }

  // 3. Fallback for root or un-prefixed routes
  return `/${targetLang}${currentPathname.startsWith('/') ? currentPathname : '/' + currentPathname}`;
}

/**
 * Determines whether the transition between current and target route represents the same page
 * in a different locale, so that scroll position should be preserved rather than reset to top.
 */
export function isSamePageAcrossLocales(currentPathname, targetPathname) {
  if (!currentPathname || !targetPathname) return false;
  // If target redirected to fallback insights while user was on a blog article, it's not the same page
  const currBlog = currentPathname.match(/^\/(en|vi)\/blog\/([^/?#]+)/);
  const targBlog = targetPathname.match(/^\/(en|vi)\/blog\/([^/?#]+)/);
  if (currBlog && targBlog) {
    const a1 = findArticle(currBlog[2]);
    const a2 = findArticle(targBlog[2]);
    return Boolean(a1 && a2 && a1.id === a2.id);
  }
  if (currBlog && !targBlog) return false;

  // For general routes, compare paths with locale prefix stripped
  const currClean = currentPathname.replace(/^\/(en|vi)(\/|$)/, '/');
  const targClean = targetPathname.replace(/^\/(en|vi)(\/|$)/, '/');
  return currClean === targClean;
}
