// The Korean tapioca market page (/ko/tapioca-market): procurement intelligence for Korean manufacturers that buy
// tapioca chips (distilled alcohol and ethanol, feed, starch; importers and wholesalers second). Korean-only original
// content (i18n/routes.js SCOPED_CONTENT_PAGES), rendered by views/tapioca-market/TapiocaMarketView.jsx.
// Static and dated: `updatedAt` is the page's own date, never the build's or the browser's. Every signal keeps what a
// source says (`evidence`) apart from HMV's reading of it (`buyerImplication`) and cites dated sources from `sources`.
// No price, no forecast, no supply commitment: the page explains what to watch; the supply page shows what HMV offers.

// A market signal: its id, type, status, confidence and source ids, then its copy, named: `label`, what the sources say
// (`evidence`) and HMV's reading of it (`buyerImplication`). Returns { id, type, status, label, evidence,
// buyerImplication, confidence, sources }.
const signal = (id, type, status, confidence, sources, copy) => ({ id, type, status, ...copy, confidence, sources });

export const koreaTapiocaMarket = {
  updatedAt: '2026-11-15',
  seo: {
    title: '타피오카 원료 조달 인사이트',
    description: '한국 제조사를 위해 베트남·캄보디아 공급, 날씨, 옥수수 가격, 수요 변화를 정리한 타피오카 칩 조달 인사이트입니다.',
  },
  nav: {
    label: '페이지 탐색',
    // Section ids on this page.
    items: [['market-monitor', '시장 모니터'], ['procurement-brief', '조달 브리프'], ['market-drivers', '주요 변수'], ['source-methodology', '출처·방법론']],
    action: { label: '타피오카 칩 공급', href: '/ko/tapioca-chips' },
  },
  hero: {
    eyebrow: 'HMV GLOBAL · PROCUREMENT INTELLIGENCE',
    h1: '한국 제조사를 위한 타피오카 원료 조달 인사이트',
    lead: '한국의 주정·에탄올, 사료 및 전분 제조사가 타피오카 칩을 조달할 때 확인해야 할 공급, 기상, 곡물가격 및 수요 변수를 HMV가 출처와 날짜를 함께 정리합니다.',
    updated: '업데이트',
    disclaimer: '본 페이지는 시장 참고 정보이며 HMV의 확정 견적, 공급 확약 또는 가격 예측이 아닙니다.',
    primary: { label: '타피오카 칩 공급 페이지 보기', href: '/ko/tapioca-chips' },
    secondary: { label: '품질 근거 보기', href: '/ko/tapioca-chips#quality' },
  },
  monitor: {
    eyebrow: 'MARKET MONITOR',
    title: '타피오카 조달 신호',
    text: '신호마다 유형, 상태, 확인된 근거와 구매사 관점, 출처와 날짜를 함께 표시합니다. 종합 점수나 가격 전망은 제공하지 않습니다.',
    labels: { evidence: '확인된 근거', implication: '구매사 관점', status: '상태', sources: '출처' },
    // HMV's editorial labels for organizing this page, not commodity-market categories. A structural or seasonal signal
    // is a reference whatever its sources' age; a recent one becomes a past reference once its newest source is more
    // than 30 days older than `updatedAt`.
    types: { structural: '구조적 참고', seasonal: '계절적 참고', current: '최근 동향' },
    // A seasonal status names its period, never a time relative to today ("before", "during"): the page is read later.
    statuses: { ongoing: '지속 수요', period: '12월~5월', high: '높은 위험', declining: '최근 하락' },
    freshness: { historical: '과거 참고' },
  },
  signals: [
    signal('korea-ethanol-demand', 'structural', 'ongoing', 'high', ['krx-changhae-2026q1'], {
      label: '한국 주정 원료 수요',
      evidence: '창해에탄올의 KRX 공시(2026년 1분기 보고서)는 한국 주정산업이 수입 타피오카 칩을 주요 원료 중 하나로 사용하며, 국내 주정사들이 매년 안정적인 원료 확보를 위해 노력하고 있다고 설명합니다.',
      buyerImplication: '공장 조달에서는 단일 선적의 가격뿐 아니라 월간 공급 연속성, 품질 기준 합의 및 납품 계획을 함께 검토할 필요가 있습니다.',
    }),
    signal('tapioca-procurement-season', 'seasonal', 'period', 'medium', ['krx-changhae-2026q1'], {
      // The filing describes one business's purchasing and stockpiling in the dry season, not a Korean buying season.
      label: '건기 수매·비축 시기',
      evidence: 'KRX 공시의 사업 설명에서는 타피오카 칩을 수확기인 건기(12월~5월)에 수매하여 창고 보관 후 공급하는 사업 구조를 설명합니다.',
      buyerImplication: '정기 구매를 검토하는 제조사는 예상 월간 사용량과 품질 기준을 먼저 정리해 공급 제안을 비교할 수 있습니다.',
    }),
    // Status high: FAO rates the risk high; it does not compare it with an earlier assessment, so no direction.
    signal('cambodia-weather-risk', 'current', 'high', 'medium', ['fao-el-nino-drought-2026'], {
      label: '캄보디아 기상 리스크',
      evidence: 'FAO는 2026년 El Niño 영향으로 캄보디아가 심각한 가뭄 위험이 높은 지역이라고 평가했습니다.',
      // The caveat is required: a drought warning for agriculture is not evidence of a cassava production loss.
      buyerImplication: '이는 타피오카 생산량 감소를 직접 의미하지는 않지만, 캄보디아를 포함한 지역 농산물의 생산·수확 여건을 지속적으로 확인할 필요가 있습니다.',
    }),
    signal('corn-relative-economics', 'current', 'declining', 'medium', ['mafra-food-price-2026-10'], {
      label: '국제 옥수수 가격 동향',
      evidence: '농림축산식품부가 정리한 FAO 자료에 따르면 국제 옥수수 가격은 2026년 9월 3년 만의 최고치를 기록한 뒤 10월 하락했습니다.',
      buyerImplication: '사료용 타피오카의 상대 경제성은 옥수수 가격과 함께 확인할 수 있지만, 옥수수 가격의 단기 움직임만으로 타피오카 수요 방향이나 실제 원료 대체를 단정할 수 없습니다.',
    }),
  ],
  brief: {
    eyebrow: 'PROCUREMENT BRIEF',
    title: '2026년 11월 타피오카 조달 브리프',
    intro: '이번 브리프는 한국 제조사의 원료 조달 관점에서 현재 확인할 가치가 있는 공급·수요·기상·대체원료 신호를 요약합니다.',
    points: [
      'KRX 공시에서 한국 주정산업의 주요 원료 중 하나로 수입 타피오카 칩 사용이 확인됩니다.',
      'KRX 공시는 타피오카 칩의 건기 수매·비축 시기를 12월~5월로 설명합니다. 정기 구매를 검토하는 제조사는 월간 사용량과 품질 기준을 미리 정리할 수 있습니다.',
      'FAO가 캄보디아를 2026년 El Niño 시기 심각한 가뭄 위험이 높은 지역으로 평가한 만큼, 지역 공급 여건을 계속 확인할 필요가 있습니다.',
      '국제 옥수수 가격은 9월 3년 만의 최고치 이후 10월 하락했지만, 단기 움직임만으로 타피오카 수요나 원료 대체를 판단할 수는 없습니다.',
    ],
  },
  drivers: {
    eyebrow: 'MARKET DRIVERS',
    title: '타피오카 조달에 영향을 주는 주요 변수',
    items: [
      {
        title: '베트남·캄보디아 공급',
        text: '타피오카 칩의 공급 가능 물량은 지역별 수확과 수매·집하, 물류 여건에 따라 달라집니다. 실제 원산지와 공급 가능 물량은 공급 제안별로 확인해야 합니다.',
        sources: ['krx-changhae-2026q1'],
      },
      {
        title: '기상 및 작황',
        text: 'KRX 공시는 현지 기후 변화에 따른 작황 상태를 타피오카 가격 변동 요인 중 하나로 설명합니다. 기상 정보만으로 가격 방향을 판단할 수는 없습니다.',
        sources: ['krx-changhae-2026q1'],
      },
      {
        title: '중국 수요',
        text: '중국의 구매 동향은 지역 타피오카 조달 경쟁에 영향을 줄 수 있는 변수입니다. 현재 수요 수준은 날짜가 있는 자료로 별도 확인해야 하며, 이 페이지는 현재 중국 수요 수준을 평가하지 않습니다.',
        sources: [],
      },
      {
        title: '옥수수 상대가격',
        text: '옥수수는 특히 사료 원료의 경제성을 비교할 때 함께 검토되는 원료입니다. 가격 차이가 곧바로 원료 대체로 이어지는 것은 아니며, 실제 사용은 각 제조사의 배합 설계에 따라 달라집니다.',
        sources: ['krx-changhae-2026q1'],
      },
      {
        title: '환율 및 운임',
        text: 'KRX 공시는 수입 원료 가격이 환율과 국제곡물가격 변화의 영향을 받는다고 설명합니다. 해상 운임 등 물류 비용과 실제 원가는 거래 조건과 선적 시점에 따라 확인해야 합니다.',
        sources: ['krx-changhae-2026q1'],
      },
    ],
  },
  checklist: {
    title: '제조사 조달 체크리스트',
    items: [
      '예상 월간 사용량을 톤/월 기준으로 정리했는가?',
      '전분·수분 등 핵심 구매 기준을 정의했는가?',
      '도착항 또는 납품지를 기준으로 공급안을 비교하고 있는가?',
      '단일 선적뿐 아니라 정기 공급 가능성도 함께 검토하고 있는가?',
    ],
  },
  evidence: {
    eyebrow: 'HMV SUPPLY EVIDENCE',
    title: '시장 정보에서 실제 공급 검토로',
    items: [
      {
        title: '실제 공급 현장',
        text: 'HMV가 제공한 타피오카 칩 및 출하 준비 실물 사진을 확인할 수 있습니다.',
        link: { label: '실제 공급 현장 보기', href: '/ko/tapioca-chips#supply-evidence' },
      },
      {
        title: 'Intertek 샘플',
        text: '특정 분석 샘플의 전분, 수분 및 기타 시험 결과를 확인할 수 있습니다.',
        link: { label: 'Intertek 샘플 결과 보기', href: '/ko/tapioca-chips#quality' },
      },
      {
        title: '공급 네트워크',
        text: 'HMV의 베트남·캄보디아 지역 공급 조율 모델과 네트워크 역량을 확인할 수 있습니다.',
        link: { label: '공급 네트워크 보기', href: '/ko/tapioca-chips#capability' },
      },
    ],
  },
  methodology: {
    eyebrow: 'SOURCE METHODOLOGY',
    title: '출처 및 작성 기준',
    points: [
      '각 신호는 출처가 말하는 내용(확인된 근거)과 HMV의 해석(구매사 관점)을 나누어 표시합니다.',
      '정부·관세 자료, FAO 등 국제기구, 공공 연구기관, 공식 공시를 우선 사용합니다. 공신력 있는 상품·무역 전문 매체와 공급사·트레이더의 시장 정보는 보조 자료로만 사용합니다.',
      'KRX 공시는 공시 기업이 제출한 1차 자료이며 정부 발표가 아닙니다.',
      '신호 분류(구조적 참고·계절적 참고·최근 동향)는 HMV가 이 페이지를 정리하기 위해 사용하는 편집 기준이며 업계 표준 분류가 아닙니다.',
      '최근 동향의 출처가 업데이트일보다 30일 넘게 오래되면 「과거 참고」로 표시합니다. 업데이트 날짜는 콘텐츠에 기록된 날짜이며 자동으로 바뀌지 않습니다.',
      '이 페이지는 가격 정보, 가격 전망 및 공급 확약을 제공하지 않습니다.',
    ],
    sourcesTitle: '참고 출처',
    newWindow: '새 창에서 원문 열기',
    sourceTypes: {
      government: '정부',
      international_organization: '국제기구',
      research_institute: '공공 연구기관',
      regulatory_filing: '기업 공시',
      trade_publication: '전문 매체',
      supplier_market_update: '공급사 시장 정보',
    },
  },
  cta: {
    title: '귀사의 조달 조건에 맞는 공급안을 확인하세요',
    text: '시장 정보는 참고 자료입니다. 실제 공급 가능 물량, 원산지, 품질 기준 및 납품 조건은 구매 조건에 따라 별도로 확인해야 합니다.',
    primary: { label: '타피오카 칩 공급 페이지 보기', href: '/ko/tapioca-chips' },
    secondary: { label: '실제 공급 근거 보기', href: '/ko/tapioca-chips#supply-evidence' },
  },
  footer: { address: '본사' },
  // `label`: how the page names the source (KRX 공시 is the filing company's own disclosure, not a government source).
  sources: {
    'krx-changhae-2026q1': {
      id: 'krx-changhae-2026q1',
      label: 'KRX 공시',
      publisher: '창해에탄올',
      title: '창해에탄올 분기보고서 (2026.03)',
      publishedAt: '2026-05-15',
      url: 'https://kind.krx.co.kr/external/2026/05/15/002835/20260515006469/11013.htm',
      sourceType: 'regulatory_filing',
      tier: 'A',
    },
    'fao-el-nino-drought-2026': {
      id: 'fao-el-nino-drought-2026',
      label: 'FAO',
      publisher: 'FAO',
      title: 'When El Niño brings drought, every minute counts',
      publishedAt: '2026-10-05',
      url: 'https://www.fao.org/newsroom/story/when-el-nino-brings-drought-every-minute-counts/en',
      sourceType: 'international_organization',
      tier: 'A',
    },
    'mafra-food-price-2026-10': {
      id: 'mafra-food-price-2026-10',
      label: '농림축산식품부',
      publisher: '농림축산식품부',
      title: '식량농업기구(FAO) 10월 세계식량가격지수 전월 대비 1.2% 하락',
      publishedAt: '2026-11-07',
      url: 'https://www.mafra.go.kr/bbs/home/792/582197/artclView.do',
      sourceType: 'government',
      tier: 'A',
    },
  },
};
