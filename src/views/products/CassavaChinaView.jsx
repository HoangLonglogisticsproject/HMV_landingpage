import { cassavaChina } from '@/data/cassavaChina';
import { qualityReportPages } from '@/data/cassavaQualityReport';
import { CassavaProcurementPage } from './CassavaProcurement';

// The Simplified Chinese dried cassava chips page (data/cassavaChina.js), for industrial buyers: the procurement page,
// the hero with the network figures and the Intertek reference.
export function CassavaChinaView() {
  return <CassavaProcurementPage content={cassavaChina} locale="zh-CN" source="zh" reportPages={qualityReportPages} />;
}
