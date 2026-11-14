// The Korean tapioca chips page (/ko/tapioca-chips), the page-scoped ko version of the dried cassava chips page
// (i18n/routes.js PAGE_LOCALES): written for manufacturers first, in this order (distilled alcohol and ethanol, feed,
// starch), then importers and large-volume wholesale buyers. 타피오카 칩 is the Korean industry term for dried cassava
// chips. Rendered by views/products/CassavaKoreaView.jsx.
// Claims are those of the EN/VI cassava page (data/productPages.js): its network figures, its Intertek sample results
// and its qualifications, translated. No new figures, specifications, certifications, customers or prices. Its
// supply-evidence photographs and their Korean captions: data/cassavaEvidence.js.
import { cassavaDossier } from './productPages.js';

const dossier = cassavaDossier('ko');
const card = (title, text) => ({ title, text });

export const cassavaKorea = {
  seo: {
    title: '베트남 타피오카 칩 공급 - 주정·에탄올·사료 제조업체용 원료',
    description: 'HMV Global은 주정·에탄올, 사료 및 전분 가공 제조사를 위한 베트남 타피오카 칩 대량 공급을 관리합니다. 월간 구매량, 품질 요구사항, 집하 및 납품 계획에 맞춰 공급안을 조율합니다.',
  },
  nav: {
    label: '페이지 탐색',
    // Section ids on this page.
    items: [['overview', '제품 개요'], ['applications', '제조사 적용'], ['capability', '공급 역량'], ['quality', '품질 참고'], ['workflow', '공급 절차']],
    languages: '언어',
  },
  // The HMV Trade Desk has no Korean version yet: every call to action opens it in English, and says so.
  tradeDesk: 'HMV에 원료 구매 요구사항 전달 (HMV Trade Desk는 현재 영어로 제공됩니다)',
  hero: {
    eyebrow: 'HMV GLOBAL · 산업용 원료 공급 관리',
    h1: 'HMV Global이 관리하는 제조사용 타피오카 칩 대량 공급',
    lead: 'HMV Global은 주정·에탄올, 사료 및 전분 가공 공장의 정기적인 원료 조달을 위해 베트남산 타피오카 칩 대량 공급을 관리합니다. 목적지, 월간 구매량 및 품질 요구사항을 바탕으로 공급처 조율, 샘플링, 집하, 선적 서류 및 납품 계획을 조정합니다.',
    support: '수입업체와 대량 도매 바이어의 정기 구매도 지원하지만, HMV의 핵심 공급 모델은 산업용 원료를 정기적으로 구매하는 제조사를 중심으로 설계됩니다.',
    cta: 'HMV에 원료 구매 요구사항 전달',
    secondary: '품질 참고자료 보기',
    trust: ['제조사 원료 조달', '월간 대량 공급', '구매 기준에 따른 품질 조율', '지역 공급 네트워크'],
  },
  // Beside the hero: what a factory buys from HMV. The network figures come later, below the buyer value.
  panel: {
    eyebrow: 'HMV GLOBAL 공급 개요',
    title: '제조사 원료 조달을 위한 HMV 공급',
    items: [
      ['주요 수요처', '주정·에탄올 · 사료 · 전분 가공'],
      ['공급 방식', '월 단위 정기 대량 공급'],
      ['품질', '구매사 기준에 맞춰 협의'],
      ['품질 참고', 'Intertek 분석 샘플'],
    ],
  },
  intertek: {
    title: 'Intertek 샘플 참고',
    results: dossier.results.slice(0, 2),
    report: dossier.report,
    caption: '분석 샘플 결과 · 고정 선적 규격 아님',
  },
  // Why these manufacturers buy tapioca chips: each a possible raw material, never one every plant uses.
  useCases: {
    eyebrow: '제조업별 원료 사용',
    title: '타피오카 칩을 사용하는 주요 제조 분야',
    items: [
      card('주정·에탄올 생산', '타피오카 칩은 발효주정 및 에탄올 생산에 사용되는 원료 중 하나입니다. 공장 조달에서는 월간 구매량과 함께 전분, 수분 등 합의된 품질 기준과 반복 공급의 안정성이 중요합니다.'),
      card('사료 생산', '타피오카 칩은 사료용 원료로 사용될 수 있습니다. 실제 사용 여부와 배합 기준은 각 제조사의 원료 전략과 배합 설계에 따라 달라집니다.'),
      card('전분 가공', '타피오카 칩은 전분 생산용 원료로 활용될 수 있습니다. HMV는 목적지, 월간 구매량 및 합의된 품질 기준을 바탕으로 공급안을 조율합니다.'),
    ],
  },
  audience: {
    eyebrow: '제조사가 HMV와 협력하는 이유',
    title: '단순한 공급처 연결이 아니라 공장 조달을 위한 공급 실행',
    items: [
      card('공급 네트워크', 'HMV는 공장의 월간 사용량과 납품 일정에 맞춰 여러 공급 지점을 조율하여, 반복 조달이 단일 공급원에 의존하지 않도록 합니다.'),
      card('품질 기준 조율', '공급 확정 전에 공장의 품질 기준을 먼저 협의하고, 샘플링과 분석은 각 공급안의 구매 요구사항에 따라 진행합니다.'),
      card('집하 및 선적 관리', '월간 구매량에 맞춰 여러 로트를 집하하고 선적을 준비하여, 정기적인 산업용 물량 조달을 지원합니다.'),
      card('상업 및 납품 실행', '견적, 선적 서류, 주문 관리 및 납품 계획을 HMV가 단일 거래 창구로서 일관되게 조율합니다.'),
    ],
  },
  network: {
    title: '지역 공급 네트워크',
    text: 'HMV의 지역 공급 네트워크는 베트남과 캄보디아의 공급 역량을 연계합니다. 실제 원산지, 규격, 공급 가능 물량 및 상업 조건은 각 공급 제안과 선적별로 확인됩니다.',
  },
  figures: {
    eyebrow: 'HMV GLOBAL 공급 네트워크 역량',
    title: 'HMV 공급 네트워크 역량 참고',
    items: dossier.figures,
    note: '위 수치는 HMV Global 공급 네트워크 전체의 역량 참고 자료이며, 모든 구매사에 대한 공급 확약이 아닙니다. 주문별 공급 물량은 양측이 확정한 공급안과 계약에 따릅니다.',
  },
  quality: {
    eyebrow: 'INTERTEK 분석 샘플 결과',
    title: '품질 참고',
    note: '아래 수치는 특정 제출 샘플의 시험 결과이며 모든 공급 물량의 고정 규격을 의미하지 않습니다. 최종 품질 기준은 공급 제안 및 계약에서 확정됩니다.',
    head: ['항목', '결과'],
    rows: dossier.results,
    source: dossier.source,
  },
  // The EN/VI workflow (data/productPages.js), led by the buyer brief of its RFQ; field inspection and sampling are
  // one step here, as on the Chinese page.
  workflow: {
    eyebrow: '공급 절차',
    title: '구매 요구사항에서 납품까지',
    steps: [
      card('구매 요구사항 확인', '도착지, 예상 월간 구매량 및 용도를 확인합니다.'),
      card('적합한 공급원 조율', '용도에 맞는 원료 산지를 선정합니다.'),
      card('샘플링 및 품질 확인', '산지에서 원료를 확인하고 합의에 따라 샘플을 채취·분석합니다.'),
      card('로트 집하', '각 로트를 집하하여 출하를 준비합니다.'),
      card('선적 조율', '요구사항에 맞춰 컨테이너에 적재합니다.'),
      card('서류 및 납품', '합의된 조건에 따라 서류와 납품을 진행합니다.'),
    ],
  },
  rfq: {
    eyebrow: '원료 구매 요구사항 · 타피오카 칩',
    title: ['공장 맞춤형 타피오카 칩', '공급을 HMV와 협의하세요'],
    lead: '도착지와 예상 월간 구매량을 알려주시면 HMV가 원료 소싱, 품질 요구사항 및 납품 계획을 검토합니다.',
    prepare: '요청 시 준비해 주세요:',
    items: ['회사 / 공장명', '도착지', '예상 월간 구매량 (톤/월)'],
    cta: 'HMV에 원료 구매 요구사항 전달',
    note: 'HMV Trade Desk는 현재 영어로 제공됩니다. 전분, 수분, 포장 등 세부 기술 요건은 HMV의 후속 협의에서 확인합니다.',
  },
  market: {
    eyebrow: '원료 시장 정보',
    title: '공장 조달에 영향을 주는 타피오카 시장 변수',
    text: 'HMV는 작황, 수확 시기, 날씨, 국제 곡물가격 및 환율 등 제조사의 원료 조달에 영향을 줄 수 있는 시장 요인을 지속적으로 검토합니다.',
  },
  footer: { address: '본사' },
};
