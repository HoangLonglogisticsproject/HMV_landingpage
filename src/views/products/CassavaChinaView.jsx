import { cassavaChina as c } from '@/data/cassavaChina';
import { cassavaEvidence } from '@/data/cassavaEvidence';
import { SupplyEvidence } from '@/features/cassava-supply-evidence/SupplyEvidence';
import { ScopedCapability, ScopedCards, ScopedHero, ScopedMarket, ScopedPage, ScopedQuality, ScopedRfq, ScopedWorkflow } from './CassavaScoped';
import { EvidencePanel } from './ProductMoneyHero';

// The Simplified Chinese dried cassava chips page (data/cassavaChina.js): the network figures and the Intertek
// reference beside the hero, then the buyer value, the supply evidence, quality, applications, workflow and the RFQ.
export function CassavaChinaView() {
  return (
    <ScopedPage c={c} locale="zh-CN" source="zh">
      <ScopedHero c={c} source="zh">
        <EvidencePanel figures={c.figures} intertek={c.intertek} />
      </ScopedHero>
      <ScopedCapability c={c} />
      <SupplyEvidence evidence={cassavaEvidence} lang="zh" />
      <ScopedQuality quality={c.quality} />
      <ScopedCards content={c.applications} />
      <ScopedWorkflow workflow={c.workflow} />
      <ScopedRfq c={c} source="zh" />
      <ScopedMarket market={c.market} />
    </ScopedPage>
  );
}
