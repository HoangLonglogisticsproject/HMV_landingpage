// The Korean tapioca market page (/ko/tapioca-market): procurement intelligence for Korean manufacturers that buy
// tapioca chips (distilled alcohol and ethanol, feed, starch; importers and wholesalers second). Korean-only original
// content (i18n/routes.js SCOPED_CONTENT_PAGES), rendered by views/tapioca-market/TapiocaMarketView.jsx.
// Static and dated: `updatedAt` is the page's own date, never the build's or the browser's. Every signal keeps what a
// source says (`evidence`) apart from HMV's reading of it (`buyerImplication`) and cites dated sources from `sources`.
// No price, no forecast, no supply commitment: the page explains what to watch; the supply page shows what HMV offers.

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
    types: { structural: '구조 신호', seasonal: '계절 신호', current: '현재 신호' },
    statuses: { ongoing: '지속 수요', upcoming: '진입 전', rising: '상승', mixed: '혼조' },
    // Shown for every signal but a current one whose newest source is at most 30 days older than `updatedAt`.
    freshness: { structural: '구조적 참고', historical: '과거 참고' },
  },
  signals: [
    {
      id: 'korea-ethanol-demand',
      type: 'structural',
      status: 'ongoing',
      label: '한국 주정 원료 수요',
      evidence: 'KRX 공시에서는 국내 발효주정의 주요 원료 중 하나로 수입 타피오카 칩을 언급하고 있으며, 주정사들이 안정적인 원료 확보를 위해 지속적으로 노력하고 있다고 설명합니다.',
      buyerImplication: '공장 조달에서는 단일 선적의 가격뿐 아니라 월간 공급 연속성, 품질 기준 합의 및 납품 계획을 함께 검토할 필요가 있습니다.',
      confidence: 'high',
      sources: ['krx-changhae-2025q1'],
    },
    {
      id: 'tapioca-procurement-season',
      type: 'seasonal',
      status: 'upcoming',
      label: '건기 조달 시즌',
      evidence: 'KRX 공시의 업계 설명에서는 타피오카 칩 수매와 비축이 주로 건기인 12월부터 5월 사이에 이루어지는 사업 구조를 설명하고 있습니다.',
      buyerImplication: '정기 구매를 검토하는 제조사는 예상 월간 사용량과 품질 기준을 먼저 정리해 공급 제안을 비교할 수 있습니다.',
      confidence: 'medium',
      sources: ['krx-changhae-2025q1'],
    },
    {
      id: 'cambodia-weather-risk',
      type: 'current',
      status: 'rising',
      label: '캄보디아 기상 리스크',
      evidence: 'FAO는 2026년 El Niño 영향으로 캄보디아가 심각한 가뭄 위험이 높은 지역이라고 평가했습니다.',
      // The caveat is required: a drought warning for agriculture is not evidence of a cassava production loss.
      buyerImplication: '이는 타피오카 생산량 감소를 직접 의미하지는 않지만, 캄보디아를 포함한 지역 농산물의 생산·수확 여건을 지속적으로 확인할 필요가 있습니다.',
      confidence: 'medium',
      sources: ['fao-el-nino-drought-2026'],
    },
    {
      id: 'corn-relative-economics',
      type: 'current',
      status: 'mixed',
      label: '옥수수 가격 신호',
      evidence: '한국농촌경제연구원 국제곡물 관측(2026년 10월호)에 따르면 2026년 9월 한국의 사료용 옥수수 수입단가는 전월 대비 3.9% 상승했고 가공용 옥수수는 4.0% 하락했습니다. 농림축산식품부는 국제 옥수수 가격이 9월에 3년 만의 최고치를 기록한 이후 하락했다고 설명합니다.',
      buyerImplication: '사료용 타피오카의 상대 경제성은 옥수수 가격과 함께 확인해야 하며, 한 달의 가격 움직임만으로 타피오카 수요 방향을 단정해서는 안 됩니다.',
      confidence: 'medium',
      sources: ['krei-grain-2026-10', 'mafra-food-price-2026-10'],
    },
  ],
  brief: {
    eyebrow: 'PROCUREMENT BRIEF',
    title: '2026년 11월 타피오카 조달 브리프',
    intro: '이번 브리프는 한국 제조사의 원료 조달 관점에서 현재 확인할 가치가 있는 공급·수요·기상·대체원료 신호를 요약합니다.',
    points: [
      '한국 주정산업의 수입 타피오카 원료 수요는 구조적으로 존재합니다.',
      '12월~5월 건기 조달 시즌 진입을 앞두고 월간 구매 계획과 품질 기준을 정리할 시점입니다.',
      '캄보디아의 가뭄 위험은 지역 공급 여건을 모니터링해야 할 이유를 높이고 있습니다.',
      '옥수수 가격 신호는 최근 기간별 방향이 엇갈려 상대 경제성을 지속 확인할 필요가 있습니다.',
    ],
  },
  drivers: {
    eyebrow: 'MARKET DRIVERS',
    title: '타피오카 조달에 영향을 주는 주요 변수',
    items: [
      {
        title: '베트남·캄보디아 공급',
        text: '타피오카 칩의 공급 가능 물량은 지역별 수확, 건조 및 집하 여건에 따라 달라집니다. 실제 원산지와 공급 가능 물량은 공급 제안별로 확인해야 합니다.',
        sources: ['krx-changhae-2025q1'],
      },
      {
        title: '기상 및 건조 조건',
        text: '강수와 가뭄 같은 기상 여건은 수확 시기, 건조 작업 및 공급 여건에 영향을 줄 수 있습니다. 기상 정보만으로 가격 방향을 판단할 수는 없습니다.',
        sources: ['krx-changhae-2025q1'],
      },
      {
        title: '중국 수요',
        text: '중국의 구매 동향은 지역 타피오카 조달 경쟁에 영향을 줄 수 있는 변수입니다. 현재 수요 수준은 날짜가 있는 자료로 별도 확인해야 하며, 이 페이지는 현재 중국 수요 수준을 평가하지 않습니다.',
        sources: [],
      },
      {
        title: '옥수수 상대가격',
        text: '옥수수는 특히 사료 원료의 경제성을 비교할 때 함께 검토되는 원료입니다. 가격 차이가 곧바로 원료 대체로 이어지는 것은 아니며, 실제 사용은 각 제조사의 배합 설계에 따라 달라집니다.',
        sources: ['krx-changhae-2025q1'],
      },
      {
        title: '환율 및 운임',
        text: '수입 원료의 원화 기준 비용은 환율과 해상 운임 등 물류 조건의 영향을 받습니다. 실제 비용은 거래 조건과 선적 시점에 따라 확인해야 합니다.',
        sources: ['krx-changhae-2025q1'],
      },
    ],
  },
  checklist: {
    title: '이번 달 제조사 체크리스트',
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
      '정부·관세 자료, FAO 등 국제기구, 공공 연구기관, 공식 공시를 우선 사용합니다(A등급). 공신력 있는 상품·무역 전문 매체(B등급)와 공급사·트레이더의 시장 정보(C등급)는 보조 자료로만 사용합니다.',
      'KRX 공시는 공시 기업이 제출한 1차 자료이며 정부 발표가 아닙니다.',
      '현재 신호의 출처가 업데이트일보다 30일 넘게 오래되면 「과거 참고」로, 구조·계절 신호는 「구조적 참고」로 표시합니다. 업데이트 날짜는 콘텐츠에 기록된 날짜이며 자동으로 바뀌지 않습니다.',
      '이 페이지는 가격 정보, 가격 전망 및 공급 확약을 제공하지 않습니다.',
    ],
    sourcesTitle: '참고 출처',
    newWindow: '새 창에서 원문 열기',
    tier: '등급',
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
    'krx-changhae-2025q1': {
      id: 'krx-changhae-2025q1',
      label: 'KRX 공시',
      publisher: '창해에탄올',
      title: '창해에탄올 분기보고서 (2025.03)',
      publishedAt: '2025-05-14',
      url: 'https://kind.krx.co.kr/external/2025/05/14/001118/20250514002427/11013.htm',
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
    'krei-grain-2026-10': {
      id: 'krei-grain-2026-10',
      label: '한국농촌경제연구원',
      publisher: '한국농촌경제연구원',
      title: '농업관측 국제곡물 2026년 10월호',
      publishedAt: '2026-10-02',
      url: 'https://aglook.krei.re.kr/main/uObserveMonth/OVR0000000073/download/8765/ORGTEXT_FILE',
      sourceType: 'research_institute',
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
