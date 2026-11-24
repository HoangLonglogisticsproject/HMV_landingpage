import { HomeQuickRfq } from '@/features/inquiries/HomeQuickRfq';
import { CinematicHero } from './sections/CinematicHero';
import { CoreCommodities } from './sections/CoreCommodities';
import { TrustStrip } from './sections/TrustStrip';
import { ValueJourney } from './sections/ValueJourney';
import { InAction } from './sections/InAction';
import { GlobalReach } from './sections/GlobalReach';
import { LatestInsights } from './sections/LatestInsights';
import { FinalCta } from './sections/FinalCta';
import { StickySupplyCta } from './sections/StickySupplyCta';

// EcoNews articles in LatestInsights.
export const LATEST_ARTICLES = 3;

// Home page body, shared by both builds. `articles` is the EcoNews list state for LatestInsights.
// The order is the buyer's: what HMV offers (the hero: its photography and its two lanes), how to ask for it (the one
// Quick RFQ, a strip directly below the hero, never over its photograph), whether HMV has what they need (products), why
// to trust it (the proof strip), then how it executes and the real work behind it, and a reminder of the two lanes at the
// end. No testimonials until HMV has real, consented ones. The Quick RFQ is mounted once; every call to action to it is
// a button (focus.js), and the phone's sticky one (StickySupplyCta) needs the closing call to action to know where to stop.
export function HomeView({ lang, articles }) {
  return (
    <>
      <CinematicHero lang={lang} />
      <HomeQuickRfq lang={lang} />
      <CoreCommodities lang={lang} />
      <TrustStrip lang={lang} />
      <ValueJourney lang={lang} />
      <InAction lang={lang} />
      <GlobalReach lang={lang} />
      <LatestInsights lang={lang} state={articles} />
      <FinalCta lang={lang} />
      <StickySupplyCta lang={lang} />
    </>
  );
}
