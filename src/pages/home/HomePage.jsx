import { PageMeta } from '@/components/common/PageMeta';
import { TradeRfq } from '@/features/inquiries/TradeRfq';
import { copy } from '@/data/hmv';
import { useLang } from '@/i18n/LanguageContext';
import { CinematicHero } from './sections/CinematicHero';
import { ValueJourney } from './sections/ValueJourney';
import { CoreCommodities } from './sections/CoreCommodities';
import { PartnerCommunity } from './sections/PartnerCommunity';
import { InAction } from './sections/InAction';
import { GlobalReach } from './sections/GlobalReach';
import { LatestInsights } from './sections/LatestInsights';

export function HomePage() {
  const lang = useLang();
  const t = copy[lang];
  return (
    <>
      <PageMeta
        lang={lang}
        title={
          lang === 'vi'
            ? 'Chuỗi cung ứng nông nghiệp & thương mại quốc tế'
            : 'Agricultural Supply Chain & Global Trading'
        }
        description={t.storyText}
      />
      <CinematicHero lang={lang} />
      <ValueJourney lang={lang} />
      <CoreCommodities lang={lang} />
      <PartnerCommunity lang={lang} />
      <InAction lang={lang} />
      <GlobalReach lang={lang} />
      <LatestInsights lang={lang} />
      <TradeRfq lang={lang} />
    </>
  );
}
