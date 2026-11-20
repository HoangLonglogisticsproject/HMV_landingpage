import { cassavaKorea } from '@/data/cassavaKorea';
import { qualityReportPages } from '@/data/cassavaQualityReport';
import { CassavaProcurementPage } from './CassavaProcurement';

// The Korean tapioca chips page (data/cassavaKorea.js), manufacturers first: the procurement page, the hero with what a
// factory buys (the network figures come after the buyer value), and the market intelligence block linking to
// /ko/tapioca-market.
export function CassavaKoreaView() {
  return (
    <CassavaProcurementPage content={cassavaKorea} locale="ko" source="ko" reportPages={qualityReportPages} market={cassavaKorea.market} />
  );
}
