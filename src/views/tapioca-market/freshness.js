// Freshness of a market signal (data/koreaTapiocaMarket.js), as of the page's own date: never today's date, so a
// stale source is never presented as current, and the page reads the same on every day until it is updated.
// 'current': a current signal whose newest source is at most FRESH_DAYS older than the page; 'historical': an older
// one; 'structural': a structural or seasonal signal, which describes how the market works, not its state.

export const FRESH_DAYS = 30;
const DAY = 86_400_000;

export function signalFreshness(signal, sources, asOf) {
  if (signal.type !== 'current') return 'structural';
  const newest = Math.max(...signal.sources.map(id => Date.parse(sources[id].publishedAt)));
  return (Date.parse(asOf) - newest) / DAY <= FRESH_DAYS ? 'current' : 'historical';
}

/** 2026-11-15 → 2026.11.15, the date format of Korean sources. */
export const formatDate = iso => iso.replaceAll('-', '.');
