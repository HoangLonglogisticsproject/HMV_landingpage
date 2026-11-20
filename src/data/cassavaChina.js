// The Simplified Chinese dried cassava chips page (/zh-cn/cassava-chips), the one page of the page-scoped zh-CN locale
// (i18n/routes.js PAGE_LOCALES): written for mainland-China factory procurement first (feed, starch, bioethanol), then
// importers and large-volume wholesalers. Rendered by views/products/CassavaChinaView.jsx.
// Claims are those of the EN/VI cassava page (data/productPages.js): its network figures, its Intertek sample results
// and its qualifications, translated. No new figures, specifications, certifications, customers, prices, stock or lead
// times. Its supply-evidence photographs and their Chinese captions: data/cassavaEvidence.js.
import { cassavaDossier } from './productPages.js';

const evidence = cassavaDossier('zh');

// A card; `key` names what it is, whatever its position (views/products/CassavaProcurement resolves its icon by it).
const card = (title, text, key) => ({ key, title, text });

export const cassavaChina = {
  seo: {
    title: '越南木薯干片供应商与工厂批量采购方案',
    description: 'HMV Global 面向饲料厂、淀粉加工厂和生物乙醇企业提供木薯干片批量供应，按目的地、月度采购量和质量要求协调货源、取样、集货、单证及交付。',
  },
  // The header's section links: the four a buyer looks for first.
  nav: {
    label: '页面导航',
    items: [['overview', '产品概览'], ['quality', '质量参考'], ['capability', '供应能力'], ['workflow', '采购流程']],
  },
  // The strip below the hero: every section of the page, in page order.
  sections: {
    label: '本页目录',
    items: [
      ['overview', '概览'],
      ['applications', '应用领域'],
      ['supply-evidence', '实景与装运'],
      ['quality', '质量参考'],
      ['capability', '供应能力'],
      ['workflow', '采购流程'],
      ['faq', '常见问题'],
    ],
  },
  // The HMV Trade Desk has no Chinese version yet: every call to action opens it in English, and says so.
  tradeDesk: '向 HMV 发送采购询盘（HMV Trade Desk 为英文界面）',
  hero: {
    eyebrow: 'HMV GLOBAL · 工业原料批量供应管理',
    h1: '由 HMV Global 管理的木薯干片批量供应方案',
    lead: 'HMV Global 面向饲料厂、淀粉加工厂和生物乙醇生产企业提供可执行的木薯干片批量供应方案，同时服务进口商及大宗批发采购。我们按目的地、月度采购量和质量要求，统筹货源、取样、集货、单证与交付。',
    cta: '向 HMV 提交采购需求',
    secondary: '查看质量参考',
    trust: ['工业原料供应', '月度批量供应', '按买方要求协调质量', '区域供应网络'],
  },
  figures: {
    eyebrow: 'HMV GLOBAL 供应网络能力',
    title: 'HMV 供应网络能力参考',
    items: evidence.figures,
    // The hero panel's qualification; the full one is in the supply network section.
    short: '供应网络能力参考，并非对单一买方的供货承诺。',
    note: '以上为 HMV Global 供应网络的整体能力数据，仅作能力参考，并非对每一位买方的供货承诺。您订单的供货量以双方确认的供应方案及合同为准。',
  },
  intertek: {
    title: 'Intertek 样品参考',
    results: evidence.results.slice(0, 2),
    report: evidence.report,
    caption: '送检样品结果 · 非固定批次规格',
  },
  applications: {
    title: '主要应用领域',
    text: '面向生物乙醇、饲料与淀粉加工企业的工业原料采购。',
    items: [
      {
        key: 'bioethanol',
        title: '生物乙醇生产',
        text: '木薯干片可作为乙醇发酵的工业碳水化合物原料。',
        points: ['重点关注淀粉含量与水分', '重视长期供应的连续性', 'HMV 协调货源组织与供应执行'],
      },
      {
        key: 'feed',
        title: '饲料原料',
        text: '可作为饲料配方的能量原料之一；实际用途及添加比例取决于买方的配方设计与原料策略。',
        points: ['关注水分、粗纤维与砂含量', '按月度采购计划批量供应', '规格以商务确认为准'],
      },
      {
        key: 'starch',
        title: '淀粉加工',
        text: '面向淀粉加工企业的原料采购。',
        points: ['淀粉含量与批次一致性是关键', '买方规格在商务阶段确认', 'HMV 按约定要求协调取样确认'],
      },
    ],
  },
  why: {
    title: '为什么选择 HMV Global',
    text: '面向工业买家的供应组织与执行能力。',
    items: [
      card('多产地组织', '在越南与柬埔寨协调货源，减少采购方案对单一来源的依赖。', 'network'),
      card('灵活的月度供应', '支持持续性的月度批量采购，按采购计划安排集货与装运。', 'monthly'),
      card('质量匹配', '对照买方质量要求与样品检测参考，协调取样、分析与确认。', 'quality'),
      card('出口与交付执行', '统筹集货、单证与交付协调，减少采购团队的多方沟通。', 'delivery'),
    ],
  },
  quality: {
    title: '质量参考',
    note: '送检样品结果，仅作采购评估参考；实际供货规格以双方确认的供应方案及合同为准。',
    highlights: evidence.highlights,
    head: ['指标', '结果'],
    rows: evidence.results,
    source: evidence.source,
    // The third-party evidence beside the results: the one laboratory analysis they come from, and how to read it.
    // An analysis of a submitted sample, not a certification of the product, the supplier or any shipment. Its report
    // pages, once committed: data/cassavaQualityReport.js.
    evidence: {
      title: '第三方实验室分析',
      en: 'Third-party laboratory analysis',
      name: `Intertek 越南分析报告 ${evidence.reportNo}`,
      details: [
        ['检测机构', 'Intertek 越南'],
        ['报告编号', evidence.reportNo],
        ['报告日期', evidence.reportDate],
        ['分析对象', '送检样品'],
      ],
      explain: {
        title: '如何理解本次样品结果？',
        points: [
          '这是一份经 Intertek 检测的送检样品结果，仅供采购评估参考。',
          '它不是每个供应批次的固定规格。',
          '实际供货要求由 HMV 与买方在供应方案及合同中确认。',
          'HMV 可按双方约定的质量要求协调货源组织与取样确认。',
        ],
      },
      view: '查看检测报告',
      close: '关闭检测报告',
      redacted: '报告中的发货人、收货人等商业信息已遮盖。',
    },
  },
  network: {
    title: '供应能力与网络',
    text: 'HMV 的区域供应网络覆盖越南及柬埔寨。具体原产地、规格、可供数量及商务条件均按每个供应方案和批次确认。',
    // Where each figure comes from, not a map: no route, distance or location beyond the figures' own labels.
    regions: {
      label: '供应网络示意（非地图）',
      items: [['柬埔寨', '货源与集货'], ['越南', '货源与工厂供应'], ['中国 · 广西', '交付参考']],
    },
    role: {
      title: 'HMV 的协调角色',
      points: ['区域货源组织与协调', '批次集货与装柜协调', '单证与交付执行跟进', '支持长期与月度采购计划'],
    },
  },
  workflow: {
    title: '合作与采购流程',
    text: '从采购需求到交付的标准流程。',
    steps: [
      card('提交需求', '说明目的地、用途与月度采购量'),
      card('匹配货源', '按用途与质量要求组织适配产区'),
      card('样品与确认', '按约定取样、检测并确认指标'),
      card('商务协商', '确认数量、规格、价格与交付条款'),
      card('集货与装运', '批次集货、装柜与出运协调'),
      card('交付与跟进', '单证、交付与后续供应跟进'),
    ],
  },
  faq: {
    title: '常见问题',
    text: '工业买家采购木薯干片时的常见问题。',
    items: [
      {
        q: '木薯干片适合哪些工业用途？',
        a: '木薯干片主要用作生物乙醇（酒精）生产、饲料原料和淀粉加工的工业原料。具体是否适用取决于买方的工艺、配方与质量要求，HMV 会在商务阶段与买方确认用途和规格。',
      },
      {
        q: '采购木薯干片通常关注哪些质量指标？',
        a: '工业买家通常关注淀粉含量、水分、粗纤维、灰分、砂和二氧化硅，以及杂质和重金属等指标。各项要求因用途而异，应在供应方案和合同中明确约定；本页的 Intertek 样品结果可作参考。',
        link: ['#quality', '查看质量参考'],
      },
      {
        q: '木薯干片的淀粉含量如何确认？',
        a: '淀粉含量按双方约定的取样与检测方式确认。本页所示 71.1% 为一份 Intertek 送检样品的结果，并非固定批次规格；每个供应批次的淀粉要求及检测安排在供应方案及合同中约定。',
      },
      {
        q: 'HMV 是否支持大批量月度采购？',
        a: '支持。HMV 面向持续性的月度批量采购组织货源、集货与装运。页面所列的供应网络数据为能力参考，并非对单一买方的供货承诺；您的月度供货量以双方确认的供应方案及合同为准。',
        link: ['#capability', '查看供应能力'],
      },
      {
        q: '可以根据买方规格协调供应吗？',
        a: '可以。请在询盘中说明用途以及淀粉、水分、包装等要求，HMV 会据此协调货源与取样确认。能否满足特定规格，需在取样检测和商务确认后确定。',
      },
      {
        q: '越南与柬埔寨货源如何选择？',
        a: 'HMV 的区域供应网络覆盖越南及柬埔寨。选用哪一产区，取决于买方的目的地、用途、质量要求和采购计划，并在每个供应方案中确认。',
      },
    ],
  },
  rfq: {
    title: '获取木薯干片采购方案',
    lead: '请提供以下信息，HMV 将根据您的原料需求协调货源、质量要求及交付方案。',
    items: [
      { key: 'destination', label: '目的地', hint: '交付港口或城市' },
      { key: 'volume', label: '月度需求量', hint: '预计吨/月' },
      { key: 'application', label: '用途', hint: '乙醇 · 饲料 · 淀粉加工' },
    ],
    cta: '向 HMV 提交采购需求',
    note: 'HMV Trade Desk 目前为英文界面。淀粉、水分、包装等技术要求可在 HMV 跟进时进一步确认。',
  },
  footer: { address: '总部' },
};
