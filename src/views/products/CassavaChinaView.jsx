import { cassavaChina as c } from '@/data/cassavaChina';
import { cassavaEvidence } from '@/data/cassavaEvidence';
import { qualityReportPages } from '@/data/cassavaQualityReport';
import { Applications, Evidence, Faq, FinalCta, Network, ProcessSteps, ProcurementHero, Quality, SectionNav, WhyHmv } from './CassavaProcurement';
import { ScopedPage } from './CassavaScoped';

// The Simplified Chinese dried cassava chips page (data/cassavaChina.js), for industrial buyers: the hero with the
// network figures and the Intertek reference, the section links, then applications, why HMV, the supply evidence,
// quality with its laboratory evidence, the supply network, the procurement steps, the questions buyers ask and the
// call to action.
export function CassavaChinaView() {
  return (
    <ScopedPage c={c} locale="zh-CN" source="zh">
      <ProcurementHero c={c} source="zh" />
      <div className="bg-(--surface-light)">
        <SectionNav nav={c.sections} />
        <div className="-mt-7 divide-y divide-border/50">
          <Applications content={c.applications} />
          <WhyHmv content={c.why} />
          <Evidence evidence={cassavaEvidence} lang="zh" />
          <Quality quality={c.quality} reportPages={qualityReportPages} />
          <Network network={c.network} figures={c.figures} />
          <ProcessSteps workflow={c.workflow} />
          <Faq faq={c.faq} />
        </div>
        <FinalCta c={c} source="zh" />
      </div>
    </ScopedPage>
  );
}
