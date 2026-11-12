// Page titles and descriptions, shared by the Vite head tags (PageMeta) and Next.js route metadata, so both
// builds emit the same values. Titles are without the " | HMV Global" suffix that both add. Pages framed by
// DetailLayout also use them as their visible heading and lead; Supply Chain, Trade Solutions and product pages
// keep their nav label or product name as the heading, since their titles target buyer search intent.
import { baseUrl, copy } from '@/data/hmv';
import { productPages } from '@/data/productPages';
import { privacyCopy } from '@/data/privacy';
import { regulationCopy } from '@/data/regulations';
import { articleCopy } from './article/copy';

const HOME = {
  en: {
    title: 'Vietnam Agricultural Sourcing & Supply Chain for Wholesale Buyers',
    description: 'HMV Global connects wholesale buyers, importers and distributors with Vietnamese agricultural sourcing, quality coordination, trade requirements and supply-chain execution.',
  },
  vi: {
    title: 'Nguồn hàng nông sản Việt Nam & chuỗi cung ứng cho khách hàng B2B',
    description: 'HMV Global kết nối khách hàng B2B, nhà nhập khẩu và nhà phân phối với nguồn nông sản Việt Nam, yêu cầu chất lượng, thương mại và thực thi chuỗi cung ứng.',
  },
};
export const homeMeta = lang => HOME[lang];

// `state` is a usePage() result. Until the page is ready (CMS mode) the heading is the nav label.
export const aboutMeta = (lang, state) =>
  state.status === 'ready'
    ? {
        title: state.page.seo?.title || state.page.content.hero.title,
        description: state.page.seo?.description || state.page.content.hero.lead,
      }
    : { title: copy[lang].about, description: '' };

export const contactMeta = lang => ({ title: copy[lang].contact, description: copy[lang].contactText });
const SUPPLY_CHAIN = {
  en: {
    title: 'Agricultural Supply Chain Execution from Vietnam',
    description: 'See how HMV Global coordinates sourcing, quality requirements, product readiness, trade documentation and delivery planning for international wholesale buyers.',
  },
  vi: {
    title: 'Thực thi chuỗi cung ứng nông sản từ Việt Nam',
    description: 'Tìm hiểu cách HMV Global phối hợp nguồn hàng, yêu cầu chất lượng, hoàn thiện sản phẩm, chứng từ thương mại và kế hoạch giao hàng cho khách hàng B2B quốc tế.',
  },
};
export const supplyChainMeta = lang => SUPPLY_CHAIN[lang];
const TRADE_SOLUTIONS = {
  en: {
    title: 'Agricultural Trade Solutions for Wholesale Buyers',
    description: 'Explore HMV Global’s agricultural portfolio and trade solutions for wholesale buyers, with sourcing, product preparation, quality requirements and commercial coordination built around each buyer brief.',
  },
  vi: {
    title: 'Giải pháp thương mại nông sản cho khách hàng B2B',
    description: 'Khám phá danh mục nông sản và giải pháp thương mại của HMV Global cho khách hàng B2B, với nguồn hàng, hoàn thiện sản phẩm, yêu cầu chất lượng và điều phối thương mại theo từng nhu cầu thu mua.',
  },
};
export const tradeSolutionsMeta = lang => TRADE_SOLUTIONS[lang];
export const activitiesMeta = lang => ({ title: copy[lang].activities, description: copy[lang].fieldText });
export const regulationsMeta = lang => ({ title: regulationCopy[lang].title, description: regulationCopy[lang].intro });
export const privacyMeta = lang => ({ title: privacyCopy[lang].title, description: privacyCopy[lang].intro });

const INSIGHTS = {
  en: 'EcoNews: Perspectives on green supply chains, clean energy, and sustainable agriculture.',
  vi: 'Bản tin EcoNews: Góc nhìn về chuỗi cung ứng xanh, năng lượng điện gió và nông nghiệp xuất khẩu bền vững.',
};
export const insightsMeta = lang => ({ title: 'EcoNews', description: INSIGHTS[lang] });

// No brand suffix here: both builds add " | HMV Global" (decision D-06). Logistics is an operational capability
// inside HMV Global's supply-chain execution, not a standalone service offer.
const LOGISTICS = {
  en: {
    title: 'Supply Chain Operations & Dangerous Goods Handling',
    description: 'Operational capabilities within HMV Global’s supply-chain execution, including dangerous-goods handling, cross-border coordination, local handling and international network connectivity.',
  },
  vi: {
    title: 'Năng lực vận hành chuỗi cung ứng & xử lý hàng nguy hiểm',
    description: 'Các năng lực vận hành trong quá trình thực thi chuỗi cung ứng của HMV Global, gồm xử lý hàng nguy hiểm, điều phối xuyên biên giới, xử lý tại Việt Nam và kết nối mạng lưới quốc tế.',
  },
};
export const logisticsMeta = lang => LOGISTICS[lang];

const PACKAGING = {
  en: {
    title: 'Packaging & Ocean Freight Logistics',
    description: 'Operational evidence of export packaging standards, ISPM 15 palletization, mechanized forklift cross-docking, and container transport to EU & US ports.',
  },
  vi: {
    title: 'Quy Cách Đóng Gói & Vận Chuyển Xuất Khẩu',
    description: 'Thực tế năng lực đóng gói hàng hóa, bọc màng co pallet ISPM 15, xếp dỡ cơ giới và vận chuyển container đường biển an toàn xuất khẩu sang EU & Mỹ.',
  },
};
export const packagingMeta = lang => PACKAGING[lang];

// `product` is undefined for an unknown id on the Vite site, which renders a not-found heading (Next.js: 404).
// Titles follow wholesale sourcing intent; the EN product name is title-cased ("Cavendish bananas" → "Cavendish Bananas").
// Products with a buyer page (data/productPages.js) carry their own title and description.
export const productMeta = (lang, product) => {
  if (!product) return { title: copy[lang].notfound, description: copy[lang].chainText };
  const seo = productPages[product.id]?.seo[lang];
  if (seo) return seo;
  if (lang === 'vi') {
    return {
      title: `${product.vi} Việt Nam cho nhu cầu thu mua B2B`,
      description: `Nguồn ${product.vi} Việt Nam cho khách hàng B2B — ${product.subVi}. Trao đổi dạng hàng, thông số, đóng gói, yêu cầu thị trường đích và điều kiện thương mại.`,
    };
  }
  return {
    title: `Vietnam ${product.en.replace(/\b\w/g, c => c.toUpperCase())} Sourcing for Wholesale Buyers`,
    description: `${product.en} sourcing from Vietnam for wholesale buyers — ${product.subEn}. Discuss product form, specifications, packaging, destination requirements and commercial terms.`,
  };
};

export const notFoundMeta = { title: 'Page not found', description: 'Return to HMV Global.' };

// `state` is an article resolution; without an article the title is the status message (CMS mode on Vite).
/** @param {'en' | 'vi'} lang @param {{ status: string, article?: object }} state */
export const articleMeta = (lang, { status, article }) =>
  article
    ? { title: article.metaTitle, description: article.description }
    : { title: articleCopy[lang].status[status]?.[0] || 'EcoNews', description: '' };

// Structured data holds only facts outside the D-12 review (fact register: SEO spec §8). No people or titles, phone
// numbers, emails, postal address, certifications, facilities or testimonials until HMV confirms them; the visible
// pages are corrected first, and this follows them.
const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${baseUrl}/#organization`,
  name: 'HMV Global Co., LTD',
  alternateName: 'HMV Global',
  url: baseUrl,
  logo: `${baseUrl}/favicon.png`,
};

/** JSON-LD as a string that is safe inside <script>. */
const jsonLd = data => JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');

/** Organization and WebSite, for the home page of each language. */
export const siteJsonLd = () =>
  jsonLd({
    '@graph': [
      ORGANIZATION,
      { '@type': 'WebSite', '@id': `${baseUrl}/#website`, name: 'HMV Global', url: baseUrl, inLanguage: ['en', 'vi'], publisher: { '@id': ORGANIZATION['@id'] } },
    ],
  });

/** Article structured data: the CMS author when there is one, else the organization. */
export const articleJsonLd = (lang, a) =>
  jsonLd({
    '@type': 'Article',
    headline: a.title,
    datePublished: a.date.iso,
    inLanguage: lang,
    image: a.image ? new URL(a.image.src, baseUrl).href : undefined,
    author: a.author ? { '@type': 'Person', name: a.author } : ORGANIZATION,
    publisher: ORGANIZATION,
  });
