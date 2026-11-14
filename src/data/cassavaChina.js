// The Simplified Chinese dried cassava chips page (/zh-cn/cassava-chips), the one page of the page-scoped zh-CN locale
// (i18n/routes.js PAGE_LOCALES): written for mainland-China factory procurement first (feed, starch, bioethanol), then
// importers and large-volume wholesalers. Rendered by views/products/CassavaChinaView.jsx.
// Claims are those of the EN/VI cassava page (data/productPages.js): its network figures, its Intertek sample results
// and its qualifications, translated. No new figures, specifications, certifications, customers or prices.
import { productPhotos } from './productPhotos.js';
import { cassavaEvidenceZh as evidence } from './productPages.js';

const card = (title, text) => ({ title, text });
const PHOTO = productPhotos['dried-cassava-chips'];

export const cassavaChina = {
  seo: {
    title: '越南木薯干片供应商与工厂批量采购方案',
    description: 'HMV Global 面向饲料厂、淀粉加工厂和生物乙醇企业提供木薯干片批量供应，按目的地、月度采购量和质量要求协调货源、取样、集货、单证及交付。',
  },
  nav: {
    label: '页面导航',
    // Section ids on this page.
    items: [['overview', '产品概览'], ['capability', '供应能力'], ['quality', '质量参考'], ['workflow', '供应流程']],
    languages: '语言',
  },
  // The HMV Trade Desk has no Chinese version yet: every call to action opens it in English, and says so.
  tradeDesk: '向 HMV 发送采购询盘（HMV Trade Desk 为英文界面）',
  hero: {
    eyebrow: 'HMV GLOBAL · 工业原料批量供应管理',
    h1: '由 HMV Global 管理的木薯干片批量供应方案',
    lead: 'HMV Global 面向饲料厂、淀粉加工厂和生物乙醇生产企业，提供持续、可执行的木薯干片批量供应方案；同时服务进口商及大宗批发采购。我们根据目的地、月度采购量和质量要求，统筹货源组织、取样、集货、单证与交付。',
    cta: '向 HMV 提交采购需求',
    secondary: '查看质量参考',
    trust: ['工厂原料采购', '月度批量供应', '按买方要求协调质量', '区域供应网络'],
  },
  figures: {
    eyebrow: 'HMV GLOBAL 供应网络能力',
    title: '整个供应网络的能力参考',
    items: evidence.figures,
    note: '以上为 HMV Global 供应网络的整体能力数据，仅作能力参考，并非对每一位买方的供货承诺。您订单的供货量以双方确认的供应方案及合同为准。',
  },
  intertek: {
    title: 'Intertek 样品参考',
    results: evidence.results.slice(0, 2),
    report: evidence.report,
    caption: '送检样品结果 · 非固定批次规格',
  },
  audience: {
    eyebrow: '为什么工厂采购团队选择 HMV',
    title: '不只是找到货源，而是由 HMV 管理整套供应执行',
    items: [
      card('供应网络', 'HMV 统筹多个供应点，以匹配工厂的月度采购量和交付计划，减少整个采购方案对单一来源的依赖。'),
      card('质量要求协调', '在承诺供货前先对齐买方的质量要求，并按每个供应方案协调取样、分析和确认。'),
      card('集货与装运协调', 'HMV 根据采购规模组织批次集货及装运安排，为工厂持续性、大宗原料采购提供执行支持。'),
      card('贸易执行', '由 HMV 统一协调商务方案、单证、订单跟进及交付计划，减少采购团队在多个环节之间重复协调。'),
    ],
  },
  network: {
    title: '区域供应网络',
    text: 'HMV 的区域供应网络覆盖越南及柬埔寨。具体原产地、规格、可供数量及商务条件均按每个供应方案和批次确认。',
  },
  quality: {
    eyebrow: 'INTERTEK 送检样品结果',
    title: '质量参考',
    note: '以下结果来自特定送检样品，仅作为质量参考，并不代表所有供应批次的固定规格。最终批次要求以双方确认的供应方案及合同为准。',
    head: ['指标', '结果'],
    rows: evidence.results,
    source: evidence.source,
    photo: { ...PHOTO, caption: { zh: '木薯干片特写，白色切面与褐色外皮' } },
    photoNote: '照片由 HMV 提供。',
  },
  applications: {
    eyebrow: '饲料 · 淀粉 · 生物乙醇',
    title: '主要应用',
    items: [
      card('饲料生产', '面向饲料生产企业的大宗原料采购需求。'),
      card('淀粉加工', '面向淀粉加工企业的原料供应需求。'),
      card('生物乙醇', '面向生物乙醇生产企业的工业原料采购。'),
    ],
  },
  // The EN/VI workflow (data/productPages.js), led by the buyer brief of its RFQ; field inspection and sampling are
  // one step here.
  workflow: {
    eyebrow: '供应流程',
    title: '从采购需求到交付',
    steps: [
      card('确认采购需求', '确认目的地、预计月度采购量及用途。'),
      card('组织适配货源', '按您的用途选择原料产区。'),
      card('取样与质量确认', '在产地检查原料，并按约定取样分析。'),
      card('批次集货', '集中各批次，准备出运。'),
      card('装运协调', '按您的要求装柜。'),
      card('单证与交付', '按约定条款办理单证与交付。'),
    ],
  },
  rfq: {
    eyebrow: '采购需求 · 木薯干片',
    // Two phrases: the heading breaks between them, never inside a word.
    title: ['让 HMV 为您的工厂', '制定木薯干片供应方案'],
    lead: '请提供目的地及预计月度采购量，HMV 将根据您的原料需求协调货源、质量要求及交付方案。',
    prepare: '提交时请准备：',
    items: ['工厂或公司名称', '目的地', '预计月度采购量（吨/月）'],
    cta: '向 HMV 提交采购需求',
    note: 'HMV Trade Desk 目前为英文界面。淀粉、水分、包装等技术要求可在 HMV 跟进时进一步确认。',
  },
  market: {
    eyebrow: '市场参考',
    title: '关注中国木薯市场',
    text: 'HMV 将持续整理中国进口需求、区域供应、天气及价格驱动因素，为工业采购团队提供市场参考。',
  },
  footer: { address: '总部' },
};
