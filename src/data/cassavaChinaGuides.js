// Simplified Chinese procurement content for dried cassava chips, at /zh-cn/cassava-chips/<slug>: original Chinese pages
// (i18n/routes.js ZH_CASSAVA_GUIDES, listed there by slug), rendered by views/products/CassavaGuideView.jsx. Each links
// back to the Chinese procurement page (/zh-cn/cassava-chips, the money page; these pages never target its supplier
// keyword) and opens the HMV Trade Desk with its own analytics source (`source`).
// Claims are those of the Chinese procurement page (data/cassavaChina.js): the network in Vietnam and Cambodia, one
// Intertek-analysed sample, quality agreed before commitment. No specification limit, price, minimum order, stock, lead
// time, certification or customer. Body blocks: the bundled article format (features/articles/bundled.js toDoc), with
// `[text](path)` links.
//
// Two kinds:
// - `guide`: a buyer guide.
// - `market`: a dated market update. It reports external data (`data`) with the original source of every figure
//   (`sources`: publisher, title, url, date), kept apart from HMV's reading of it (`buyers`, 对采购商意味着什么？).
//   Figures are written in the entry, never in the view. `updated` is the date of the last revision, if any.

export const cassavaChinaGuides = {
  copy: {
    navLabel: '页面导航',
    nav: { guide: '正文', 'market-data': '市场数据', buyers: '采购解读', 'commercial-support': '中文商务支持', related: '相关资料' },
    // Between a date's label and the date.
    colon: '：',
    // The header action and the link above the title: the procurement page.
    page: '越南木薯干片采购方案',
    published: '发布日期',
    updated: '更新日期',
    related: '相关采购资料',
    cta: {
      title: '提交木薯干片采购需求',
      lead: '请说明目的地与预计月度采购量，HMV 将据此协调货源、质量要求与交付方案。',
      button: '向 HMV 提交采购需求',
      note: 'HMV Trade Desk 目前为英文界面；淀粉、水分、包装等技术要求可在 HMV 跟进时进一步确认。',
    },
    market: {
      data: '外部市场数据',
      dataNote: '以下数据摘自外部公开来源，数值以原始来源为准，不代表 HMV 的价格、预测或供货承诺。',
      sources: '原始来源',
      buyers: '对采购商意味着什么？',
      buyersNote: '以下为 HMV 对上述数据的采购解读，仅供参考。',
      newWindow: '在新窗口打开',
    },
  },
  items: {
    'procurement-guide': {
      kind: 'guide',
      source: 'zh_procurement_guide',
      published: '2026-11-21',
      seo: {
        title: '越南木薯干片采购指南：询盘前需要明确的要点',
        description: '面向饲料厂、淀粉加工厂和生物乙醇企业的越南木薯干片采购指南：用途、目的地、月度采购量、质量指标、取样确认、集货装运与单证要点。',
      },
      eyebrow: 'HMV GLOBAL · 采购指南',
      h1: '越南木薯干片采购指南',
      lead: '采购木薯干片时，决定方案能否执行的是需求是否说清楚：用途、目的地、月度采购量和质量要求。本指南整理工业买家在询盘前需要明确的要点，以及 HMV Global 如何据此组织供应方案。',
      body: [
        ['h2', '一、先明确用途'],
        ['p', '木薯干片主要用于生物乙醇（酒精）生产、饲料原料和淀粉加工。不同用途关注的指标不同：乙醇企业首先关注淀粉含量，饲料企业还关注粗纤维、砂和杂质，淀粉加工企业重视淀粉含量与批次一致性。用途明确后，质量要求和取样安排才有依据。'],
        ['h2', '二、询盘时需要提供的信息'],
        ['ul', [
          ['目的地：', '交付港口或工厂所在城市，决定运输路线与所需单证。'],
          ['月度采购量：', '预计每月吨数、开始月份，以及工厂需求是否有季节性变化。'],
          ['质量要求：', '淀粉、水分、粗纤维、砂和二氧化硅、杂质等指标及其检测方式。'],
          ['包装与装运：', '散装或袋装、集装箱类型及装柜检查方式。'],
          ['采购周期：', '试单、季度计划或年度持续供应。'],
        ]],
        ['p', '首次询盘只需说明目的地和预计月度采购量，其余技术要求可在 HMV 跟进时逐项确认。'],
        ['h2', '三、货源：越南与柬埔寨'],
        ['p', 'HMV 的区域供应网络覆盖越南及柬埔寨，可在多个供应点之间协调货源，并按约定的出运量集货，而不是依赖单一来源完成整个采购计划。具体选用哪一产区，取决于目的地、用途、质量要求和采购计划，并在每个供应方案中确认。供应能力参考见[越南木薯干片采购方案](/zh-cn/cassava-chips#capability)。'],
        ['h2', '四、质量确认'],
        ['p', '质量要求应在承诺之前约定，包括指标、限值和检测方式。样品检测结果只代表送检样品，不等于每个批次的固定规格。HMV 公布了一份 Intertek 越南的送检样品分析结果，可作采购评估参考；如何阅读这类报告，见[木薯干片质量指标指南](/zh-cn/cassava-chips/quality-guide)。'],
        ['h2', '五、从询盘到交付'],
        ['ul', [
          ['提交需求：', '说明目的地、用途与月度采购量。'],
          ['匹配货源：', '按用途与质量要求组织适配产区。'],
          ['样品与确认：', '按约定取样、检测并确认指标。'],
          ['商务协商：', '确认数量、规格、价格与交付条款。'],
          ['集货与装运：', '批次集货、装柜与出运协调。'],
          ['交付与跟进：', '单证、交付与后续供应跟进。'],
        ]],
        ['h2', '六、进口单证'],
        ['p', '进口所需的检验检疫要求和单证，以中国主管部门的现行规定及双方合同约定为准。建议在首单前，由贵司进口或报关团队与 HMV 共同确认所需文件。'],
        ['h2', '七、下一步'],
        ['p', '准备好目的地和预计月度采购量后，即可通过 HMV Trade Desk 提交需求。生物乙醇企业还可参阅[木薯干片用于乙醇生产的采购要点](/zh-cn/cassava-chips/ethanol-guide)。'],
      ],
    },
    'quality-guide': {
      kind: 'guide',
      source: 'zh_quality_guide',
      published: '2026-11-21',
      seo: {
        title: '木薯干片质量指标：淀粉、水分、粗纤维与杂质',
        description: '工业买家采购木薯干片时如何约定和核对质量指标：淀粉、水分、粗纤维、灰分、砂和二氧化硅、杂质与重金属，以及如何阅读实验室样品检测结果。',
      },
      eyebrow: 'HMV GLOBAL · 质量指南',
      h1: '木薯干片质量指标：淀粉、水分、粗纤维与杂质',
      lead: '质量是木薯干片采购中装柜后最难纠正的部分。本指南说明工业买家通常约定的质量指标、如何阅读实验室送检样品结果，以及质量要求如何写入供应方案。',
      body: [
        ['h2', '买家通常约定的指标'],
        ['ul', [
          ['淀粉：', '乙醇生产和淀粉加工的核心价值所在。'],
          ['水分：', '影响储存稳定性，也决定随货购买的水分多少。'],
          ['粗纤维：', '非淀粉成分，影响饲料配方与加工得率。'],
          ['灰分：', '矿物质含量，部分来自随原料带入的泥土。'],
          ['砂和二氧化硅：', '泥沙会磨损设备，是装柜检查的常见关注点。'],
          ['杂质：', '石块、木屑、塑料等非木薯物料。'],
          ['重金属：', '铅、镉、汞等，按目的地或用途的限值要求约定。'],
        ]],
        ['p', '不同用途的侧重点不同：乙醇企业首先关注淀粉含量；饲料企业还关注粗纤维、砂和杂质；淀粉加工企业关注淀粉含量与批次一致性。乙醇用途的详细要点见[木薯干片用于乙醇生产](/zh-cn/cassava-chips/ethanol-guide)。'],
        ['h2', '如何阅读实验室样品结果'],
        ['p', '实验室报告给出的是实验室收到的那一份样品的数值，不代表其他批次，也不能说明该样品以外的产品或供应商情况。比较不同供应方的检测结果时，建议核对：'],
        ['ul', [
          ['检测机构与报告编号：', '由谁检测，报告是否可追溯。'],
          ['报告日期：', '检测完成的时间。'],
          ['样品来源：', '由谁送检、如何取样。'],
          ['检测方法与计算基准：', '所用方法，以及结果按原样基还是干基计算。'],
        ]],
        ['p', 'HMV 公布的参考结果来自 Intertek 越南对一份送检样品的分析：淀粉 71.1%，水分 11.55%，粗纤维 2.99%，灰分 1.86%，砂和二氧化硅 0.45%，杂质未检出。以上仅为该送检样品的结果，并非每个批次的固定规格；完整结果与报告见[质量参考](/zh-cn/cassava-chips#quality)。'],
        ['h2', '质量要求如何写入供应方案'],
        ['ul', [
          ['承诺前约定：', '指标、限值和计算基准在供应方案及合同中明确。'],
          ['取样计划：', '何时、何地取样，由哪家实验室检测。'],
          ['集货：', '为同一批出运集货的各批次按约定要求准备。'],
          ['超出限值：', '检测结果超出约定限值时如何处理，属于合同条款的一部分。'],
        ]],
        ['h2', '提交您的质量要求'],
        ['p', '请先说明目的地和预计月度采购量；淀粉、水分、包装等要求可在 HMV 跟进时确认。供应网络与采购流程见[越南木薯干片采购方案](/zh-cn/cassava-chips)。'],
      ],
    },
    'ethanol-guide': {
      kind: 'guide',
      source: 'zh_ethanol_guide',
      published: '2026-11-21',
      seo: {
        title: '木薯干片用于乙醇生产：采购商需要关注什么？',
        description: '生物乙醇（酒精）企业采购越南木薯干片的要点：淀粉含量与检测基准、水分与杂质、月度供应连续性、集货装运与单证确认。',
      },
      eyebrow: 'HMV GLOBAL · 乙醇原料采购',
      h1: '木薯干片用于乙醇生产：采购商需要关注什么？',
      lead: '对乙醇企业而言，问题很少是木薯干片能否使用，而是供应能否按工厂的月度需求明确规格、核对质量并持续交付。本文整理乙醇企业采购木薯干片时需要关注的要点。',
      body: [
        ['h2', '淀粉含量为何是首要指标'],
        ['p', '乙醇工厂转化的是木薯干片中的淀粉。其余部分，包括水分、纤维、灰分和杂质，同样需要付款、运输和处理，却不贡献产出。因此采购方通常约定淀粉含量下限以及其他成分的上限，并约定每项指标的检测方式。'],
        ['ul', [
          ['淀粉：', '发酵得率的基础。需约定检测方法，以及结果按原样基还是干基计算。'],
          ['水分：', '影响储存，也决定随货购买的水分。需约定上限及检测时点。'],
          ['粗纤维与灰分：', '不可发酵成分，会降低每吨原料中的有效物质。'],
          ['砂、二氧化硅与杂质：', '磨损粉碎和输送设备，并在工艺中留下残渣。需约定限值与装柜检查方式。'],
        ]],
        ['p', '具体限值取决于买方自身工艺。HMV 按与每位买方约定的要求协调货源与取样，而不是对所有采购计划套用同一固定规格。质量指标的阅读方法见[木薯干片质量指标指南](/zh-cn/cassava-chips/quality-guide)。'],
        ['h2', '月度供应的连续性'],
        ['p', '乙醇工厂每天都在消耗原料，单批货物的条件再好，也不如一份能逐月执行的供应计划重要。询盘时建议说明：'],
        ['ul', [
          ['预计月度采购量：', '以吨计，并说明开始月份及季节性变化。'],
          ['目的地：', '交付港口或工厂，决定运输路线和所需单证。'],
          ['采购周期：', '试单、季度计划或年度持续供应。'],
          ['包装与装运：', '散装或袋装、集装箱类型及装柜检查方式。'],
        ]],
        ['p', 'HMV 在越南及柬埔寨的区域供应网络中协调货源，并按约定的出运量集货，减少采购计划对单一来源的依赖。每位买方的供货量以双方确认的供应方案及合同为准。供应能力参考见[越南木薯干片采购方案](/zh-cn/cassava-chips#capability)。'],
        ['h2', '原产地与单证'],
        ['p', '每批货物的原产地按目的地、用途和质量要求在供应方案中确认。进口所需的检验检疫要求和单证，以目的地主管部门的现行规定及合同约定为准，建议在首单前与贵司进口团队及 HMV 共同确认。'],
        ['h2', '向 HMV 提交需求'],
        ['p', '请先提供目的地和预计月度采购量。HMV 将据此组织货源、质量与交付方案；淀粉、水分和包装要求可在后续沟通中确认。'],
      ],
    },
  },
};
