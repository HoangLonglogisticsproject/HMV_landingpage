import { getFaqs, getProducts } from './catalog';
import type { Locale } from './i18n';

export const organization = { '@type': 'Organization', '@id': '/#organization', name: 'HMV Global Co., LTD', slogan: 'Connecting the world', email: 'vannguyen@hmvglobal.com', address: { '@type': 'PostalAddress', streetAddress: 'Floor 5, 240 Nguyen Dinh Chinh St., Phu Nhuan Ward', addressLocality: 'Ho Chi Minh City', addressCountry: 'VN' }, contactPoint: [{ '@type': 'ContactPoint', name: 'Ms. Van Nguyen', contactType: 'General Manager', email: 'vannguyen@hmvglobal.com', availableLanguage: ['English', 'Vietnamese'] }, { '@type': 'ContactPoint', name: 'Mr. Hieu Truong', contactType: 'Managing Director', email: 'hieutruong@hmvglobal.com' }, { '@type': 'ContactPoint', name: 'Mr. Ho Quang Minh', contactType: 'Chairman', email: 'minhho@hmvglobal.com' }] };
export function productLd(p: ReturnType<typeof getProducts>[number], locale: Locale) {
  return { '@type': 'Product', '@id': `/${locale}/products/${p.id}#product`, name: p.name, description: p.description, category: p.category, inLanguage: locale, url: `/${locale}/products/${p.id}`, image: p.image, brand: { '@id': '/#organization' }, additionalProperty: p.specs.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })) };
}
export function jsonLd(graph: object[]) { return { type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }; }
export function homeLd(locale: Locale, description: string) {
  return jsonLd([{ ...organization, description }, { '@type': 'WebSite', '@id': '/#website', name: 'HMV Global', inLanguage: ['en', 'vi'], publisher: { '@id': '/#organization' } }, ...getProducts(locale).map(p => productLd(p, locale)), { '@type': 'FAQPage', inLanguage: locale, mainEntity: getFaqs(locale).map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }]);
}
export function breadcrumbLd(items: [string, string][]) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) };
}
