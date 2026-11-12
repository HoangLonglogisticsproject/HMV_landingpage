import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { LangQueryBootstrap } from '@/i18n/LangQueryBootstrap';
import { LegacyLocaleRedirect } from '@/i18n/LegacyLocaleRedirect';
import { SiteLayout } from '@/app/SiteLayout';
import { StaticPage } from '@/app/StaticPage';
import { HomePage } from '@/views/home/HomePage';
import { AboutPage } from '@/views/about/AboutPage';
import { SupplyChainView } from '@/views/supply-chain/SupplyChainView';
import { TradeSolutionsView } from '@/views/trade-solutions/TradeSolutionsView';
import { ActivitiesView } from '@/views/activities/ActivitiesView';
import { ContactView } from '@/views/contact/ContactView';
import { InsightsPage } from '@/views/insights/InsightsPage';
import { RegulationsView } from '@/views/regulations/RegulationsView';
import { PrivacyView } from '@/views/privacy/PrivacyView';
import { PackagingView } from '@/views/packaging-logistics/PackagingView';
import { LogisticsHubPage } from '@/views/logistics/LogisticsHubPage';
import { ProductDetailPage } from '@/views/products/ProductDetailPage';
import { ArticlePage } from '@/views/article/ArticlePage';
import { NotFoundPage } from '@/views/not-found/NotFoundPage';
import {
  activitiesMeta,
  contactMeta,
  packagingMeta,
  regulationsMeta,
  privacyMeta,
  supplyChainMeta,
  tradeSolutionsMeta,
} from '@/views/meta';

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
            <Route element={<SiteLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/supply-chain" element={<StaticPage view={SupplyChainView} meta={supplyChainMeta} />} />
              <Route path="/trade-solutions" element={<StaticPage view={TradeSolutionsView} meta={tradeSolutionsMeta} />} />
              <Route path="/activities" element={<StaticPage view={ActivitiesView} meta={activitiesMeta} />} />
              <Route path="/contact" element={<StaticPage view={ContactView} meta={contactMeta} />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/regulations" element={<StaticPage view={RegulationsView} meta={regulationsMeta} />} />
              <Route path="/privacy" element={<StaticPage view={PrivacyView} meta={privacyMeta} />} />
              <Route path="/packaging-logistics" element={<StaticPage view={PackagingView} meta={packagingMeta} />} />
              <Route path="/logistics" element={<LogisticsHubPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
            </Route>
            {/* Outside SiteLayout on purpose: articles render their own SiteShell
                and scroll handling, so the chrome (incl. chat) remounts on entry. */}
            <Route path="/blog/:slug" element={<ArticlePage />} />
            <Route path="/en/*" element={<LegacyLocaleRedirect />} />
            <Route path="/vi/*" element={<LegacyLocaleRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  );
}
