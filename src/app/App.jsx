import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { LangQueryBootstrap } from '@/i18n/LangQueryBootstrap';
import { LegacyLocaleRedirect } from '@/i18n/LegacyLocaleRedirect';
import { SiteLayout } from '@/app/SiteLayout';
import { HomePage } from '@/views/home/HomePage';
import { AboutPage } from '@/views/about/AboutPage';
import { SupplyChainPage } from '@/views/supply-chain/SupplyChainPage';
import { TradeSolutionsPage } from '@/views/trade-solutions/TradeSolutionsPage';
import { ActivitiesPage } from '@/views/activities/ActivitiesPage';
import { ContactPage } from '@/views/contact/ContactPage';
import { InsightsPage } from '@/views/insights/InsightsPage';
import { RegulationsPage } from '@/views/regulations/RegulationsPage';
import { PackagingLogisticsPage } from '@/views/packaging-logistics/PackagingLogisticsPage';
import { LogisticsHubPage } from '@/views/logistics/LogisticsHubPage';
import { ProductDetailPage } from '@/views/products/ProductDetailPage';
import { ArticlePage } from '@/views/article/ArticlePage';
import { NotFoundPage } from '@/views/not-found/NotFoundPage';

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
              <Route path="/supply-chain" element={<SupplyChainPage />} />
              <Route path="/trade-solutions" element={<TradeSolutionsPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/regulations" element={<RegulationsPage />} />
              <Route path="/packaging-logistics" element={<PackagingLogisticsPage />} />
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
