export const journeyChapters = [
  { id: 'origin', label: 'Rooted in Vietnam', title: 'HMV Global.', accent: 'A world of agricultural opportunity.', description: 'Discover tropical commodities at origin. Connect your buying requirements with a coordinated supply chain, built around the trade.', cta: 'Explore our commodities' },
  { id: 'harvest', label: 'Selected for your market', title: 'The harvest.', accent: 'The heart of every trade.', description: 'Passion fruit. Cavendish bananas. Dragon fruit. Spices, cashews and tapioca starch. Start with the product, the specification and your market.', cta: 'Find your next commodity' },
  { id: 'world', label: 'Connected to your business', title: 'Your market.', accent: 'Our shared opportunity.', description: 'From Vietnam to international buyers. HMV aligns sourcing, quality requirements and commercial terms — with logistics supporting the trading solution.', cta: 'Discuss your sourcing needs' },
] as const;

export function journeyStage(progress: number) {
  return Math.min(2, Math.max(0, Math.floor(progress * 3)));
}