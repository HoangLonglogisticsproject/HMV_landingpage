// Page titles and descriptions, shared by the Vite head tags (PageMeta) and Next.js route metadata, so both
// builds emit the same values. Titles are without the " | HMV Global" suffix that both add. Pages framed by
// DetailLayout also use them as their visible heading.
import { baseUrl, copy } from '@/data/hmv';
import { regulationCopy } from '@/data/regulations';
import { articleCopy } from './article/copy';

export const homeMeta = lang => ({
  title: lang === 'vi' ? 'Chuỗi cung ứng nông nghiệp & thương mại quốc tế' : 'Agricultural Supply Chain & Global Trading',
  description: copy[lang].storyText,
});

// `state` is a usePage() result. Until the page is ready (CMS mode) the heading is the nav label.
export const aboutMeta = (lang, state) =>
  state.status === 'ready'
    ? {
        title: state.page.seo?.title || state.page.content.hero.title,
        description: state.page.seo?.description || state.page.content.hero.lead,
      }
    : { title: copy[lang].about, description: '' };

export const contactMeta = lang => ({ title: copy[lang].contact, description: copy[lang].contactText });
export const supplyChainMeta = lang => ({ title: copy[lang].supply, description: copy[lang].chainText });
const TRADE_SOLUTIONS = {
  en: 'Explore HMV Global’s agricultural portfolio and trade solutions, with sourcing, product preparation, quality requirements and commercial coordination built around each buyer brief.',
  vi: 'Khám phá danh mục nông sản và giải pháp thương mại của HMV Global, với nguồn hàng, hoàn thiện sản phẩm, yêu cầu chất lượng và điều phối thương mại theo từng nhu cầu người mua.',
};
export const tradeSolutionsMeta = lang => ({ title: copy[lang].trade, description: TRADE_SOLUTIONS[lang] });
export const activitiesMeta = lang => ({ title: copy[lang].activities, description: copy[lang].fieldText });
export const regulationsMeta = lang => ({ title: regulationCopy[lang].title, description: regulationCopy[lang].intro });

const INSIGHTS = {
  en: 'EcoNews: Perspectives on green supply chains, clean energy, and sustainable agriculture.',
  vi: 'Bản tin EcoNews: Góc nhìn về chuỗi cung ứng xanh, năng lượng điện gió và nông nghiệp xuất khẩu bền vững.',
};
export const insightsMeta = lang => ({ title: 'EcoNews', description: INSIGHTS[lang] });

// No brand suffix here: both builds add " | HMV Global" (decision D-06).
const LOGISTICS = {
  en: {
    title: 'International Logistics & Dangerous Goods Handling',
    description: 'Specialized Dangerous Goods handling (Air & Sea), chemical transport, special & general cargoes, Vietnam-Cambodia cross-border drayage, local agency handling and JC Trans global networking.',
  },
  vi: {
    title: 'Dịch Vụ Logistics Quốc Tế & Vận Chuyển Hàng Nguy Hiểm',
    description: 'Chuyên xử lý hàng nguy hiểm Dangerous Goods (Air & Sea), hàng hóa chất, hàng đặc biệt, tuyến xuyên biên giới Việt Nam - Campuchia, đại lý nội địa và mạng lưới toàn cầu JC Trans.',
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
export const productMeta = (lang, product) =>
  product
    ? {
        title: product[lang],
        description:
          lang === 'vi'
            ? `${product.vi} từ HMV Global — ${product.subVi}. Trao đổi dạng hàng, thông số, đóng gói, yêu cầu thị trường đích và điều kiện thương mại theo nhu cầu thu mua.`
            : `${product.en} from HMV Global — ${product.subEn}. Discuss product form, specifications, packaging, destination requirements and commercial terms for your sourcing brief.`,
      }
    : { title: copy[lang].notfound, description: copy[lang].chainText };

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
