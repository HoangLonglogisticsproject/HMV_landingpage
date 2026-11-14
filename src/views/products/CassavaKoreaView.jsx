import { cassavaKorea as c } from '@/data/cassavaKorea';
import { cassavaEvidence } from '@/data/cassavaEvidence';
import { SupplyEvidence } from '@/features/cassava-supply-evidence/SupplyEvidence';
import { ScopedCapability, ScopedCards, ScopedHero, ScopedMarket, ScopedPage, ScopedQuality, ScopedRfq, ScopedWorkflow } from './CassavaScoped';
import { EvidencePanel, IntertekReference } from './ProductMoneyHero';

// Beside the hero, what a factory buys: its uses, the supply model, quality and the Intertek reference. The network
// figures, led by the Cambodia warehouse, come after the buyer value instead.
function FactsPanel({ panel, intertek }) {
  return (
    <aside className="money-panel" aria-labelledby="money-panel-title">
      <p className="money-panel-label">{panel.eyebrow}</p>
      <h2 id="money-panel-title">{panel.title}</h2>
      <dl className="money-figures scoped-facts">
        {panel.items.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <IntertekReference intertek={intertek} />
    </aside>
  );
}

// The Korean tapioca chips page (data/cassavaKorea.js), manufacturers first: the hero, why manufacturers use tapioca
// chips, why they work with HMV with the supply network and its figures, the supply evidence, quality, workflow and
// the RFQ.
export function CassavaKoreaView() {
  return (
    <ScopedPage c={c} locale="ko" source="ko">
      <ScopedHero c={c} source="ko">
        <FactsPanel panel={c.panel} intertek={c.intertek} />
      </ScopedHero>
      <ScopedCards content={c.useCases} id="applications" alt />
      <ScopedCapability c={c}>
        <EvidencePanel figures={c.figures} id="scoped-figures-title" />
      </ScopedCapability>
      <SupplyEvidence evidence={cassavaEvidence} lang="ko" />
      <ScopedQuality quality={c.quality} />
      <ScopedWorkflow workflow={c.workflow} alt={false} />
      <ScopedRfq c={c} source="ko" />
      <ScopedMarket market={c.market} />
    </ScopedPage>
  );
}
