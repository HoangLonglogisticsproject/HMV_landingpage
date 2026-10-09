import { describe, expect, it } from 'vitest';
import { isLocale, seoHead, switchLocalePath } from '@/lib/i18n';
import { getArticles } from '@/lib/articles';
import { getProducts } from '@/lib/catalog';

describe('i18n', () => {
  it('only en and vi are active locales', () => { expect(isLocale('en')).toBe(true); expect(isLocale('vi')).toBe(true); expect(isLocale('zh')).toBe(false); });
  it('switches locale keeping product id', () => { expect(switchLocalePath('/en/products/bananas', 'vi')).toBe('/vi/products/bananas'); });
  it('emits self canonical, reciprocal hreflang and x-default to English', () => {
    const links = seoHead({ locale: 'vi', path: '/about', title: 't', description: 'd' }).links;
    expect(links).toContainEqual({ rel: 'canonical', href: '/vi/about' });
    expect(links).toContainEqual({ rel: 'alternate', hrefLang: 'en', href: '/en/about' });
    expect(links).toContainEqual({ rel: 'alternate', hrefLang: 'x-default', href: '/en/about' });
  });
  it('noindex pages have no canonical', () => { expect(seoHead({ locale: 'en', path: '/x', title: 't', description: 'd', noindex: true }).links).toHaveLength(0); });
  it('products share language-independent ids across locales', () => { expect(getProducts('vi').map(p => p.id)).toEqual(getProducts('en').map(p => p.id)); });
  it('publishes all six articles in both languages', () => { expect(getArticles('en')).toHaveLength(6); expect(getArticles('vi')).toHaveLength(6); });
});
