import landscape from '@/assets/agri-landscape.jpg';
import fruit from '@/assets/passion-fruit.jpg';
import bananas from '@/assets/bananas.jpg';
import energy from '@/assets/renewable-energy.jpg';

export type Article = { slug: string; topic: string; title: string; summary: string; image: string; imageAlt: string; sections: { heading: string; text: string }[]; sources: { name: string; url: string }[] };
export const articles: Article[] = [
  {
    slug: 'from-farm-to-market', topic: 'Supply Chain', title: 'From farm to market: a trading-first supply chain',
    summary: 'The commodity comes first. How HMV approaches sourcing, specification alignment and coordinated delivery for international buyers.', image: landscape, imageAlt: 'Illustrative Vietnamese farmland and international port',
    sections: [
      { heading: 'Begin with the buying requirement', text: 'An agricultural trade starts with a precise question: which product, in which format, for which market? Fresh fruit, puree, spices and starch have different commercial and handling requirements. Product specifications, volumes, destination requirements and delivery expectations should be aligned before a shipment is planned.' },
      { heading: 'HMV’s coordination approach', text: 'HMV Global brings commodity trading and supply-chain coordination into one discussion. The proposed approach begins with sourcing and specification alignment, then connects quality review, packing requirements, documentation and delivery planning. Actual suppliers, controls, responsibilities and timelines are confirmed for each quotation; this overview is not a report of a completed shipment.' },
      { heading: 'Logistics serves the trade', text: 'Transport is an enabling layer, not the starting point. The appropriate mode and route depend on product characteristics, shelf life, order size and the buyer’s commercial priorities. A clear allocation of responsibilities helps buyers evaluate an offer beyond its headline price.' },
    ], sources: [{ name: 'World Bank — Agrifood value-chain coordination', url: 'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/723591554284022235/addressing-the-aggregation-and-coordination-problems-in-smallholder-based-value-chains' }],
  },
  {
    slug: 'globalgap-fruit-buyers', topic: 'GLOBALG.A.P.', title: 'GLOBALG.A.P.: what fruit buyers should verify',
    summary: 'A concise buyer perspective on farm assurance, traceability and the difference between a requirement and a verified certificate.', image: fruit, imageAlt: 'Yellow and purple passion fruit',
    sections: [
      { heading: 'Understand the scope', text: 'GLOBALG.A.P. Integrated Farm Assurance for fruit and vegetables covers topics including food safety, environmental sustainability and workers’ health, safety and welfare. It is a farm-assurance framework; it does not remove the need to assess the destination market’s import rules or the buyer’s own specifications.' },
      { heading: 'Verify, do not assume', text: 'Ask for the producer’s identification, certificate validity, covered products and sites, and the applicable standard version. Confirm that the product offered falls within the certificate’s scope. Traceability through handling and trading also needs review, including whether Chain of Custody requirements apply to the parties involved.' },
      { heading: 'Make assurance part of the quotation', text: 'Buyers should state the certification and traceability requirements in their inquiry. HMV will discuss the supporting documentation relevant to the proposed source. No GLOBALG.A.P. certification for HMV or its offered products is claimed on this website; any certification must be evidenced for the specific quotation.' },
    ], sources: [{ name: 'GLOBALG.A.P. — IFA for fruit and vegetables', url: 'https://www.globalgap.org/what-we-do/integrated-farm-assurance/fruit-and-vegetables/' }],
  },
  {
    slug: 'cold-chain-critical-handoffs', topic: 'Cold Chain', title: 'Cold chain: the risk lives between the handoffs',
    summary: 'Pre-cooling, packaging, delays and temperature records: the practical questions that protect a fresh-fruit trade.', image: bananas, imageAlt: 'Fresh Cavendish bananas',
    sections: [
      { heading: 'A container is not the entire cold chain', text: 'A refrigerated journey includes preparation at origin, storage, loading, transport, border handling and receipt. UNEP and FAO describe food cold chains as interconnected systems. A refrigeration plan should therefore address handoffs and waiting time, not just the transport equipment.' },
      { heading: 'Match the protocol to the commodity', text: 'Different fruits require different temperatures, humidity and handling conditions. A single universal temperature range is inappropriate for a tropical-fruit portfolio. Buyers and suppliers should agree the commodity-specific protocol, pre-cooling requirements, packaging ventilation and compatibility before dispatch.' },
      { heading: 'Clarify the exception plan', text: 'Discuss who reviews temperature records, who responds to delays and how a receiving discrepancy is documented. HMV’s coordination discussion can include these requirements alongside product specifications. Shelf life, handling protocols and monitoring arrangements remain subject to the agreed quotation; no loss-free delivery is guaranteed.' },
    ], sources: [{ name: 'UNEP / FAO — Sustainable food cold chains', url: 'https://www.unep.org/resources/report/sustainable-food-cold-chains-opportunities-challenges-and-way-forward' }],
  },
  {
    slug: 'vietnam-southeast-asia-investment', topic: 'Global Investment', title: 'Vietnam and Southeast Asia in a shifting investment map',
    summary: 'Why diversified production networks matter for agricultural sourcing — and why regional momentum still requires local due diligence.', image: landscape, imageAlt: 'Illustrative Vietnamese agricultural and trade infrastructure',
    sections: [
      { heading: 'A regional supply-chain perspective', text: 'The ASEAN Investment Report 2024 examines foreign direct investment and supply-chain development across Southeast Asia. Regional production networks and investment decisions affect the supporting infrastructure on which agricultural trade depends, from processing and packaging to transport and energy.' },
      { heading: 'Look beyond a relocation headline', text: 'A regional investment trend does not establish that a particular facility, supplier or route is ready for a buyer’s order. Local capacity, market access, quality systems, operating costs and regulatory requirements still need individual assessment. Vietnam should be evaluated within this broader regional context rather than as a guaranteed substitute for another origin.' },
      { heading: 'What it means for commodity buyers', text: 'Diversification can begin with a structured sourcing conversation: product availability, processing options, continuity, documentation and commercial terms. HMV’s agricultural trading focus provides that starting point. This article is general commercial context, not investment advice or a claim that HMV operates an investment project.' },
    ], sources: [{ name: 'UNCTAD — ASEAN Investment Report 2024', url: 'https://unctad.org/publication/asean-investment-report-2024' }],
  },
  {
    slug: 'air-sea-cross-border-process', topic: 'Trade Logistics', title: 'Air, sea and cross-border: plan the process around the product',
    summary: 'A commercial checklist for choosing a transport mode, preparing documents and coordinating border handoffs.', image: landscape, imageAlt: 'Illustrative international port linked to agricultural origins',
    sections: [
      { heading: 'One trade, different operating paths', text: 'Air, sea and cross-border road movements follow different handling and documentation paths. Mode selection should consider shelf life, shipment volume, urgency, route availability and landed cost. Faster transport alone cannot resolve missing documents or an unsuitable handling protocol.' },
      { heading: 'Align the documents before dispatch', text: 'A practical review covers the commercial invoice, packing list, agreed transport document and origin, phytosanitary or other documents required by the specific destination and product. IATA’s Cargo Border Management programme emphasises coordinated border processes and information exchange. Requirements must be verified with the relevant authorities and qualified parties for the actual trade.' },
      { heading: 'Make responsibilities explicit', text: 'Agree the delivery term and its version, insurance responsibilities, customs arrangements, handling instructions and the receiving contact. HMV integrates shipment coordination into the commodity proposal rather than presenting transport as a standalone promise. This is a planning overview, not a universal clearance procedure or a guarantee of import eligibility.' },
    ], sources: [{ name: 'IATA — Cargo Border Management', url: 'https://www.iata.org/en/programs/cargo/cbm/' }],
  },
  {
    slug: 'wind-solar-food-supply-chains', topic: 'Renewable Energy', title: 'Wind, solar and the future footprint of food supply chains',
    summary: 'Renewable power can support lower-emission processing and cooling, but environmental outcomes depend on the whole system.', image: energy, imageAlt: 'Illustrative wind turbines and solar panels near Vietnamese farmland',
    sections: [
      { heading: 'Why energy belongs in the conversation', text: 'Food processing, storage and refrigeration use electricity. Changes in the electricity supply can therefore affect the environmental footprint of an agricultural supply chain. The IEA’s Renewables 2024 report identifies solar PV and wind as the main drivers of projected renewable capacity growth through 2030; those projections are not guaranteed outcomes.' },
      { heading: 'Benefits require system-level planning', text: 'Wind and solar power can contribute to reducing dependence on fossil-fuel generation. Their integration requires attention to grids, flexibility and reliability. Environmental assessment should also consider land use, material supply, equipment life cycles and end-of-life management rather than treating renewable electricity as impact-free.' },
      { heading: 'Ask for evidence in commercial decisions', text: 'A buyer evaluating an environmental claim should ask what is measured, which operations are covered and what documentation supports the claim. For HMV, renewable energy is an editorial perspective on the future of supply chains. This article does not claim HMV owns wind or solar assets, sells energy projects or supplies certified low-carbon products.' },
    ], sources: [{ name: 'IEA — Renewables 2024 executive summary', url: 'https://www.iea.org/reports/renewables-2024/executive-summary' }, { name: 'IRENA — World Energy Transitions Outlook 2024', url: 'https://www.irena.org/Publications/2024/Nov/World-Energy-Transitions-Outlook-2024' }],
  },
];
import type { Locale } from './i18n';
import { viArticles } from './articles.vi';

export type ArticleStatus = 'draft' | 'review' | 'published';
// Editorial workflow metadata, shared by every locale edition. Only published editions are listed and indexed.
const editorial: Record<string, { published: string; updated: string; status: Record<Locale, ArticleStatus> }> = Object.fromEntries(articles.map(a => [a.slug, { published: '2026-10-01', updated: '2026-10-09', status: { en: 'published', vi: viArticles[a.slug] ? 'published' : 'draft' } }]));

export function getArticles(locale: Locale = 'en') {
  return articles.flatMap(a => {
    const meta = editorial[a.slug]!;
    if (meta.status[locale] !== 'published') return [];
    const vi = locale === 'vi' ? viArticles[a.slug] : undefined;
    return [{ ...a, ...(vi ?? {}), id: a.slug, locale, published: meta.published, updated: meta.updated }];
  });
}
export type LocalizedArticle = ReturnType<typeof getArticles>[number];
export function findArticle(slug: string, locale: Locale = 'en') { return getArticles(locale).find(a => a.slug === slug); }
export function articleLocales(slug: string) { const m = editorial[slug]; return m ? (Object.keys(m.status) as Locale[]).filter(l => m.status[l] === 'published') : []; }