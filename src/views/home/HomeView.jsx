import { TradeRfq } from '@/features/inquiries/TradeRfq';
import { CinematicHero } from './sections/CinematicHero';
import { ValueJourney } from './sections/ValueJourney';
import { CoreCommodities } from './sections/CoreCommodities';
import { PartnerCommunity } from './sections/PartnerCommunity';
import { InAction } from './sections/InAction';
import { GlobalReach } from './sections/GlobalReach';
import { LatestInsights } from './sections/LatestInsights';

// EcoNews articles in LatestInsights.
export const LATEST_ARTICLES = 3;

// Home page body, shared by both builds. `articles` is the EcoNews list state for LatestInsights.
export function HomeView({ lang, articles }) {
  return (
    <>
      <CinematicHero lang={lang} />
      <ValueJourney lang={lang} />
      <CoreCommodities lang={lang} />
      <PartnerCommunity lang={lang} />
      <InAction lang={lang} />
      <GlobalReach lang={lang} />
      <LatestInsights lang={lang} state={articles} />
      <TradeRfq lang={lang} />
    </>
  );
}
