import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Activities } from '@/components/sections/Activities';
import { InAction } from '@/components/sections/InAction';
import {
  CinematicHero,
  ValueJourney,
  CoreCommodities,
  GlobalReach,
  PartnerCommunity,
} from '@/components/sections/CinematicHome';
import { LatestInsights } from '@/components/sections/LatestInsights';
import { ArticlePage } from '@/components/sections/ArticlePage';
import { TradeRfq } from '@/components/sections/TradeRfq';
import { Contact } from '@/components/sections/Contact';
import { DetailPage } from '@/components/sections/DetailPage';
import { PackagingLogisticsPage } from '@/components/sections/PackagingLogisticsPage';
import { LogisticsHubPage } from '@/components/sections/LogisticsHubPage';
import { PageMeta } from '@/components/common/PageMeta';
import { copy } from '@/data/hmv';
import { SiteShell } from '@/components/layout/SiteShell';
import { LanguageProvider, useLang } from '@/i18n/LanguageContext';
import { LangQueryBootstrap } from '@/i18n/LangQueryBootstrap';
import { LegacyLocaleRedirect } from '@/i18n/LegacyLocaleRedirect';
function Site({ page = 'home' }) {
  const lang = useLang();
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView({ behavior: 'auto' }),
      );
    } else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  const t = copy[lang];
  return (
    <SiteShell lang={lang}>
        {page === 'home' ? (
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
        ) : page === 'packaging-logistics' ? (
          <PackagingLogisticsPage lang={lang} />
        ) : page === 'logistics' ? (
          <LogisticsHubPage lang={lang} />
        ) : (
          <DetailPage lang={lang} page={page} />
        )}
    </SiteShell>
  );
}
export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <BrowserRouter>
          <LangQueryBootstrap />
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Routes>
            <Route path="/" element={<Site />} />
            {[
              'about',
              'supply-chain',
              'trade-solutions',
              'activities',
              'contact',
              'insights',
              'regulations',
              'packaging-logistics',
              'logistics',
            ].map(page => (
              <Route
                key={page}
                path={`/${page}`}
                element={<Site page={page} />}
              />
            ))}
            <Route path="/blog/:slug" element={<ArticlePage />} />
            <Route path="/products/:id" element={<Site page="product" />} />
            <Route path="/en/*" element={<LegacyLocaleRedirect />} />
            <Route path="/vi/*" element={<LegacyLocaleRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  );
}
function NotFound() {
  const lang = useLang();
  return (
    <>
      <PageMeta
        lang={lang}
        title="Page not found"
        description="Return to HMV Global."
      />
      <div className="not-found">
        <h1>Page not found</h1>
        <a href="/">HMV Global →</a>
      </div>
    </>
  );
}
