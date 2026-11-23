# Landing page architecture

React 19 + Vite 6 single-page app. Routing uses React Router 7 in declarative mode (`<BrowserRouter>`). Styling is Tailwind 4 plus the hand-written `src/styles/hmv.css`. Page head tags come from react-helmet-async, primitives are Radix via shadcn, and icons are lucide-react.

There is no backend of its own in this build. Content is static bilingual data in `src/data/`, and forms open a pre-filled email draft (mailto). The exceptions are the homepage Quick RFQ, the Trade Desk and the route assessment, which submit to the Next.js app's `POST /api/inquiry` (`/api/route-assessment`) through the `@/lib/inquiry` port (this Vite build has no server: the port answers 503 and they offer the email draft); EcoNews and the About page in CMS mode (`--mode cms`), which read the HMV CMS public API; see `docs/cms-integration.md`. The default build, production included, stays static.

## Folders

```
src/
  main.jsx             mounts <App/>, imports global CSS (index.css before hmv.css)
  app/                 App.jsx (providers + route table), SiteLayout.jsx (layout route)
  views/<route>/       <Name>Page.jsx (Vite page adapter) + <Name>View.jsx (shared body) + sections
                       (renamed from src/pages: Next.js reserves that name; see docs/architecture/)
    home/sections/     the eight home sections, in render order in HomePage.jsx
  features/<name>/     business functionality used by more than one page or the shell
    articles/          EcoNews data access (bundled or CMS public API), ArticleGrid, Tiptap RichText (+ tests)
    pages/             usePage(key, lang): website page copy, bundled or from the CMS public pages API (+ tests)
    inquiries/         Contact, TradeRfq (the homepage section) and QuickRfq (its form, the fast lane), mailto builder, RFQ validation (+ tests)
    regulations/       Regulations list (insights + regulations pages)
    trade-desk/        HMV Trade Desk: TradeDeskHost (in SiteShell, lazy-loads TradeDesk), openTradeDesk(), rules,
                       validation, follow-up channels (+ tests); delivery: docs/inbound/TRADE_DESK_DELIVERY.md
  components/
    layout/            site chrome: SiteShell, Navigation, Footer, LanguageSwitcher, PremiumLanguageMenu, DetailLayout
    common/            PageMeta (SEO tags), BrandLogo
    ui/                shadcn primitives: business-agnostic, regenerate with the shadcn CLI
  i18n/                language state (localStorage `hmv_lang`), ?lang= and /en|/vi URL handling
  data/                static bilingual content and photo registries (future CMS seam)
  lib/                 generic helpers (cn), CMS public-API client (cms.js) and fetch hook + CMS flag (useFetched.js)
  styles/              index.css (Tailwind + tokens), hmv.css (imports hmv/*.css, the layout/editorial CSS; architecture/CSS_ARCHITECTURE.md)
  assets/              bundled images
```

## Dependency rules

`app` → `pages` → `features` → `components` → `lib`. `data` and `i18n` can be used from anywhere.

- A page never imports another page.
- A feature never imports a page.
- `components/layout` is site chrome and may compose features (the Trade Desk host and the contact CTA).
- `components/ui` and `lib` stay business-agnostic: no `data/`, no copy.
- Inside a page or feature, use relative imports. Across modules, use `@/`.
- There are no import cycles and no unreachable modules. Keep it that way: delete code rather than leaving it unimported.

## Routes

| URL | Module | Notes |
|---|---|---|
| `/` | `views/home/HomePage` | Section order is defined in `HomeView.jsx`. `#initiate-trade` targets the RFQ form. |
| `/about` | `views/about/AboutPage` | DetailLayout. Copy from `features/pages` (`data/about.js`, or the CMS in CMS mode). |
| `/supply-chain` | `views/supply-chain/SupplyChainPage` | DetailLayout. Deep links: `#commodities`, `#wind-energy`, `#logistics-capacity`, stage ids. |
| `/trade-solutions` | `views/trade-solutions/TradeSolutionsPage` | DetailLayout |
| `/activities` | `views/activities/ActivitiesPage` | DetailLayout |
| `/contact` | `views/contact/ContactPage` | DetailLayout with no trailing CTA. `?product=` preselects the product. |
| `/insights` | `views/insights/InsightsPage` | DetailLayout. EcoNews list (`features/articles`) plus the first 3 regulations, in data order. |
| `/regulations` | `views/regulations/RegulationsPage` | DetailLayout |
| `/products/:id` | `views/products/ProductDetailPage` | Body: `views/products/ProductView`, in the site's chrome. Dried cassava chips: the cassava procurement page (`views/products/CassavaProcurement`, `CassavaProcurementContent`, copy in `data/productPages.js`), its calls to action the HMV Trade Desk (`en_hero`/`en_rfq`, `vi_hero`/`vi_rfq`), no RFQ form. Passion fruit: `views/products/ProductLanding` with its RFQ (`features/inquiries/ProductRfq`). Other products: DetailLayout; an unknown id shows the "not found" title and the CTA only. |
| `/zh-cn/cassava-chips` | `views/products/CassavaChinaView` | Next.js only (`app/(zh)`, `<html lang="zh-CN">`). Dried cassava chips in Simplified Chinese for industrial buyers, copy in `data/cassavaChina.js`: the procurement page (`views/products/CassavaProcurement`, `CassavaProcurementPage`): its own header and footer (no site navigation; `views/products/CassavaScoped`) and Tailwind sections (hero, section links, applications, why HMV, evidence, quality with its third-party laboratory evidence, network, process, FAQ, call to action; the analysis report pages, once committed in `data/cassavaQualityReport.js`, open in `views/products/QualityReportPreview`); the Trade Desk opens in English. |
| `/zh-cn/cassava-chips/:slug` | `views/products/CassavaGuideView` (`locale` `zh-CN`, shared with the Korean guides) | Next.js only (`app/(zh)`, `<html lang="zh-CN">`). Simplified Chinese buyer guides and dated market updates about dried cassava chips (`data/cassavaChinaGuides.js`; slugs in `i18n/routes.js` `ZH_CASSAVA_GUIDES`, part of `SCOPED_CONTENT_PAGES`: own canonical, sitemap entry, no hreflang): the article layout in the page-scoped chrome, the Chinese commercial support block, links back to `/zh-cn/cassava-chips`, which links every guide; the Trade Desk opens in English with the entry's source (`zh_procurement_guide`, `zh_quality_guide`, `zh_ethanol_guide`). A market update (`kind: 'market'`) shows its dates, the external data with each original source, then HMV's reading (对采购商意味着什么？); none is published yet. |
| `/ko/tapioca-chips` | `views/products/CassavaKoreaView` | Next.js only (`app/(ko)`, `<html lang="ko">`). Dried cassava chips as 타피오카 칩 for Korean manufacturers (distilled alcohol and ethanol, feed, starch), copy in `data/cassavaKorea.js` (the content shape of the Chinese copy): the same procurement page, with its hero panel of what a factory buys (the network figures after the buyer value), a buyer-guides section linking its three guides (after the FAQ) and a market intelligence block linking to `/ko/tapioca-market`; the Trade Desk opens in English. |
| `/ko/tapioca-chips/:slug` | `views/products/CassavaGuideView` (`locale` `ko`) | Next.js only (`app/(ko)`, `<html lang="ko">`). Korean buyer guides about dried cassava chips (`data/cassavaKoreaGuides.js`; slugs in `i18n/routes.js` `KO_CASSAVA_GUIDES`, part of `SCOPED_CONTENT_PAGES`: own canonical, sitemap entry, no hreflang): original Korean pages, not translations of the Chinese guides or the EN/VI articles. The same article layout and scoped chrome as the Chinese guides, without the commercial support block; each links back to `/ko/tapioca-chips` (the money page, whose supply keyword they never target) and to the other guides and `/ko/tapioca-market` (market intelligence, linked and never replaced); the Trade Desk opens in English with the entry's source (`ko_procurement_guide`, `ko_quality_guide`, `ko_ethanol_guide`). Claims are the Korean page's own: the Vietnam and Cambodia network, one Intertek-analysed sample as a reference, quality agreed before commitment; no price, minimum order, capacity, lead time or certification. |
| `/ko/tapioca-market` | `views/tapioca-market/TapiocaMarketView` | Next.js only (`app/(ko)`, `<html lang="ko">`). Korean-only procurement intelligence for manufacturers buying tapioca chips, content in `data/koreaTapiocaMarket.js` (dated signals, each source dated, evidence apart from HMV's reading, freshness from the page's own date); its own canonical, no hreflang; links only to `/ko/tapioca-chips`, no Trade Desk. |
| `/logistics` | `views/logistics/LogisticsHubPage` | Its own hero. Adds its own delayed smooth `#hash` scroll on top of SiteLayout's. |
| `/logistics/vietnam-cambodia-consolidation` | `views/consolidation/ConsolidationView` | B2B less-than-truckload consolidation between Vietnam and Cambodia (copy in `data/vnCambodiaConsolidation.js`, EN/VI; Vietnamese at `/vi/logistics/vietnam-cambodia-consolidation`): who it is for, when consolidation fits, the consolidator workflow, the corridor and route assessment, the information needed, operational boundaries, FAQ (no FAQPage data), then its route assessment form (`RouteAssessmentForm`, the client island). `/logistics` stays the logistics hub and links here from its cross-border section. |
| `/packaging-logistics` | `views/packaging-logistics/PackagingLogisticsPage` | Its own hero |
| `/privacy` | `views/privacy/PrivacyView` (`StaticPage`) | DetailLayout, no trailing CTA. Privacy notice for inquiries (`data/privacy.js`); Next.js: `/privacy` and `/vi/privacy`. Linked next to the Trade Desk consent checkbox. |
| `/blog/:slug` | `views/article/ArticlePage` | Outside SiteLayout (see below). A bundled article with a `tradeDesk` source (the dried cassava chips buyer guides) opens the HMV Trade Desk from its call to action with that source (`en_ethanol_guide`…) instead of the quotation link; bundled copy links inline with `[text](path)`. Static mode: a Vietnamese slug redirects to the English canonical slug; an unknown slug goes to `/insights`. CMS mode: slugs are per locale and resolved through `alternates`; unknown slugs show a not-found state (noindex). |
| `/en/*`, `/vi/*` | `i18n/LegacyLocaleRedirect` | Sets the language and redirects to the locale-free URL. |
| `*` | `views/not-found/NotFoundPage` | No site chrome |

URLs are locale-free. Adding `?lang=en` or `?lang=vi` to any URL sets the language and is then removed from the address bar (`i18n/LangQueryBootstrap`).

## Layout ownership

| Concern | Owner |
|---|---|
| Provider tree (Helmet, Language, Router) | `app/App.jsx` |
| Shared chrome (nav + footer) | `app/SiteLayout.jsx` → `components/layout/SiteShell` |
| Navigation (desktop + mobile) | `components/layout/Navigation` (~592 lines — see tech debt) |
| Footer | `components/layout/Footer` |
| Language switcher | `components/layout/LanguageSwitcher` resolves the site header's languages; `components/layout/PremiumLanguageMenu` (Radix DropdownMenu) draws the menu: flag, self-name, the current language checked |
| Inner-page layout (hero + body + CTA) | `components/layout/DetailLayout` (shared, no head tags); the page's adapter adds the head tags (Vite: `PageMeta`, Next.js: route `metadata`) |
| Blog page chrome | `views/article/ArticlePage` (its own SiteShell — intentional remount) |

## i18n rules

- Language is stored in `localStorage` key `hmv_lang` and read by `LanguageContext`.
- URLs are always locale-free. The language is **not** in the URL path.
- `?lang=en` / `?lang=vi` sets the language and is immediately removed from the address bar by `LangQueryBootstrap`.
- Legacy `/en/…` and `/vi/…` prefixed URLs are handled client-side by `LegacyLocaleRedirect` (sets language, then `<Navigate replace>`). On Vercel these are already 301'd by `vercel.json`; this component is the fallback.
- All bilingual copy lives in `src/data/` files as `{ en: …, vi: … }` objects. Components read the active locale via `useLanguage()`.
- **Page-scoped locales.** `LOCALES` stays `['en', 'vi']`. A single page can also exist in another language through `PAGE_LOCALES` in `i18n/routes.js` (today: `/products/dried-cassava-chips` → `zh-CN` at `/zh-cn/cassava-chips` and `ko` at `/ko/tapioca-chips`). Only that page's hreflang set, sitemap entries and language switcher gain the language; the navigation and every other page never link to it. Original content in one language only (today: `/ko/tapioca-market` and the Chinese and Korean cassava guides under `/zh-cn/cassava-chips/` and `/ko/tapioca-chips/`) is listed in `SCOPED_CONTENT_PAGES` instead: its own canonical and sitemap entry, no hreflang, and `?lang=` changes nothing. `localizePath(path, 'ko')` returns the Korean URL for that page and the English URL for any other. No redirect by IP, browser language or geography.

## Shared UI responsibilities

| Component | Responsibility |
|---|---|
| `components/common/PageMeta` | `<title>`, `<meta description>`, OG/Twitter tags, canonical `<link>` via Helmet |
| `components/common/BrandLogo` | HMV logo image; used by Navigation and footer |
| `components/ui/*` | Radix-based shadcn primitives (Button, Dialog, DropdownMenu) — business-agnostic |
| `features/inquiries/inquiry.js` | Shared mailto builder; used by Contact, ProductRfq and, as the fallback after a failed send, QuickRfq |
| `features/inquiries/rfq.js` | RFQ field validation of the mailto forms; used by ProductRfq |
| `features/inquiries/QuickRfq` | The Quick RFQ: two steps (requirement: product, destination, volume; contact: company, work email, consent), submission to `POST /api/inquiry`, received state with the reference, retry and email fallback, and the "Need guidance?" handoff to the Trade Desk. `product` fixes the product for a product page. Copy: `quickRfqCopy.js` |
| `features/trade-desk/submission` | What every sender of `POST /api/inquiry` shares (Trade Desk, Quick RFQ): the accepted response, the idempotency key and the rule that a key stands for one exact inquiry |
| `features/articles/hooks` | `useArticleList` / `useArticle`: bundled articles, or the CMS public API in CMS mode, as one view shape |
| `features/articles/ArticleGrid` | EcoNews cards plus loading/empty/error states; used by LatestInsights and InsightsPage |
| `features/articles/RichText` | Whitelist renderer for CMS Tiptap JSON (no raw HTML); also renders the bundled articles |
| `features/regulations/Regulations` | Regulation card list; used by InsightsPage and RegulationsPage |
| `features/scoped-chrome/ScopedChrome` | Header (section links, the language menu when the page has other languages, one action) and footer of the pages outside SiteShell: the Chinese and Korean cassava pages and the Korean market page (one language, no menu) |
| `features/scoped-chrome/ScopedLanguages` | The scoped header's language menu (PremiumLanguageMenu) and the same links hidden in the server HTML, since the menu renders them only while it is open. A module of its own, passed to ScopedHeader, so a page in one language ships no menu code |
| `features/cassava-supply-evidence/SupplyEvidence` | `SupplyEvidenceGallery`: the cassava supply-evidence photographs (`data/cassavaEvidence.js`), each opening larger in `SupplyEvidencePreview` (`components/common/Lightbox`); used by the cassava procurement page in every language (CassavaProcurement: EN/VI, Chinese, Korean) |
| `features/trade-desk/TradeDeskHost` | Mounted once in SiteShell: listens for `openTradeDesk()`, records the first-touch visit, loads `TradeDesk` on the first open (with an error boundary and retry) |
| `features/trade-desk/TradeDesk` | The HMV Trade Desk dialog: the conversation (product, destination, volume), the route (quotation or Customer Service), the inline contact card, submission to `POST /api/inquiry` (`@/lib/inquiry`), sent state and optional follow-up links |

## Behavior that is easy to break

- **Layout persistence.** `SiteLayout` stays mounted across the standard routes, so expanded nav submenus and an open Trade Desk conversation survive navigation. `/blog/:slug` renders its own `SiteShell`, so entering an article remounts the chrome, including the Trade Desk host. Moving articles under `SiteLayout` would change that.
- **Scroll.** `SiteLayout` scrolls to the `#hash` target (on the next animation frame, instant) or to the top whenever the path or hash changes. `ArticlePage` forces the top and sets `history.scrollRestoration = 'manual'`.
- **HMV Trade Desk.** The commercial interaction surface (the earlier simulated support chat is no longer part of the runtime UI). Calls to action open it with `openTradeDesk()`, a window event; there is no shared state. It submits real inquiries: `POST /api/inquiry` validates them and delivers them server to server through the configured adapter: in Production the n8n webhook (`INQUIRY_DELIVERY=webhook`), the CMS being an optional future system of record (docs/inbound/TRADE_DESK_DELIVERY.md). It shows "sent" and the reference only after the server accepted the inquiry; otherwise it offers a retry and an email draft.
- **Route assessment.** The consolidation page's form posts to `POST /api/route-assessment` (Next.js) through the same inquiry port, inquiry service and delivery adapter as the Trade Desk (`src/next/inquiry/route-assessment.js`, validation in `features/route-assessment`), with its own validation and a record in the Trade Desk record's shape (`product`/`service`: `Vietnam–Cambodia Consolidation`, `source.cta`: `en_route_assessment`/`vi_route_assessment`), sent on the same webhook as commodity inquiries; n8n routes `service.id === "vietnam-cambodia-consolidation"` to the separate Consol pipeline (its own sheet and deduplication table), everything else to the Agricultural Trade pipeline. With the CMS adapter (optional, future) it answers 503 (the CMS contract takes commodity inquiries only) and the form offers the email draft. It says "sent" only after a 201.
- **Quick RFQ (fast lane) and Trade Desk (assisted lane).** One lead pipeline, two ways in. The homepage `#initiate-trade` section is the Quick RFQ: for a buyer who knows what they need, three answers (product, destination, volume), then company, work email and consent. It builds the Trade Desk's inquiry (`toInquiry`), checks it with `validateInquiry`, keys it with `withKey` (an exact retry keeps the key, a changed inquiry takes a new one, a 409 drops it) and posts it with `sendInquiry`: the same endpoint, validation, delivery adapter and n8n webhook; no second backend. It says "received" with the reference only after a 201, and a failure keeps the details and offers "Try again" and, only then, the email draft. "Need guidance?" opens the Trade Desk with the product, destination and volume already typed (`openTradeDesk({ product, destination, volume })`; the desk starts a conversation with them as answers and asks only what is missing). Analytics: `quick_rfq_*` events and `generate_lead` with `source: 'quick_rfq'`, categorical values only. The Quick RFQ requires a work email because the inquiry contract does; email-or-WhatsApp-only would be a contract change.
- **Mailto RFQ and contact forms.** The product-page RFQ and the contact form still send nothing themselves: they build a mailto draft (`features/inquiries/inquiry.js`) as the fallback channel, so their UI must say a draft was prepared, never that a request was sent.
- **SEO.** `PageMeta` writes the title, description and OG/Twitter tags directly and the canonical link through Helmet. `index.html` holds the static fallback tags and the Organization JSON-LD.

## Adding things

- **New route:** create the shared body `views/<route>/<Name>View.jsx` and its title in `views/meta.js`; add a `<Route>` with `<StaticPage view meta>` inside `SiteLayout` in `app/App.jsx` (or a `<Name>Page.jsx` adapter if it needs hooks); add the two Next.js route files (`app/(en)/(site)/<route>/page.tsx`, `app/(vi)/vi/(site)/<route>/page.tsx`) and the key path to `PAGES` in `i18n/routes.js`. Then update the nav/footer links and `public/sitemap.xml`.
- **Inner page:** wrap the view in `<DetailLayout lang {...<name>Meta(lang)}>`; the adapters set the head tags.
- **Next.js migration (in progress):** see `docs/architecture/`. Shared code imports links and router hooks from the port `@/lib/navigation` only, never from `react-router-dom` or `next/*`; `npm run lint` enforces the layer rules (`scripts/check-boundaries.js`).
- **New section:** if only one page uses it, put it in that page's folder. If it is business-specific and used by two or more pages, put it in `features/<name>/`. If it is generic UI, put it in `components/ui/`.
- **Styles:** new UI uses Tailwind CSS 4 utilities; CSS that a component genuinely needs goes into a small colocated CSS Module, and `index.css` keeps only truly global styling (`docs/architecture/CSS_ARCHITECTURE.md`). `hmv.css` is the legacy global stylesheet with no scoping, split into ordered modules to be migrated feature by feature. Keep its class names stable; renaming a class silently unstyles markup.

## Checks

- `npm run build` — Vite production build; must pass before any commit.
- `package-lock.json` — regenerate it on Linux (CI, or Docker `node:24.18.0`). npm on Windows leaves out `@emnapi/core` and `@emnapi/runtime` (optional dependencies of the wasm builds of `sharp` and Tailwind's oxide), and `npm ci` on Linux then fails.
- `npm test` — Vitest unit tests (co-located `*.test.js` files): inquiry + RFQ logic, CMS API clients, rich-text renderer, About page and its data hooks. `npm run test:coverage` writes `coverage/lcov.info` for SonarQube.
- `npm run lint` — ESLint flat config (React Hooks + React Refresh checks), then the layer boundary check (`scripts/check-boundaries.js`). Baseline has 0 errors / 9 warnings.
- `npm run test:e2e` — Playwright smoke tests (routes, i18n, navigation, workflows, visual) against `vite preview` on port 4173, then the CMS-mode suite (`tests/cms-*.spec.js`, mocked API) against `dist-cms` on port 4174.
- `npm run test:e2e:cms` — CMS-mode suite only (builds `dist-cms` first).
- `npm run dev:cms` / `npm run build:cms` — EcoNews from the CMS public API (proxied to `CMS_API_ORIGIN`, default `http://localhost:4000`).
- `npm run test:visual` — Visual screenshot smoke tests only.

---

## Known technical debt (prioritized)

### P1 — High impact, low risk to fix

| Item | Detail |
|---|---|
| **Global `hmv.css` (24 modules, about 9,200 lines)** | One global stylesheet with no scoping, now split into ordered modules without changing the cascade (Phase 1, `docs/architecture/CSS_ARCHITECTURE.md`). Renaming any class silently breaks markup. It still mixes design tokens, layout utilities, component-specific rules and page-specific overrides, with duplicate selectors across modules. To be migrated to Tailwind utilities feature by feature (Phases 2 and 3 in `CSS_ARCHITECTURE.md`). |
| **592-line `Navigation.jsx`** | Handles desktop multi-level dropdowns, mobile drawer, keyboard navigation, scroll-aware sticky behavior, and language switching all in one component. Candidate for splitting into `DesktopNav`, `MobileDrawer`, and `NavItem`. |

### P2 — Medium impact

| Item | Detail |
|---|---|
| **Duplicated lightbox patterns** | Multiple page sections implement their own photo lightbox/modal. Should be unified under a single `components/ui/Lightbox` to avoid behavior drift. |
| **Large unoptimized image assets** | Several PNG assets exceed 1–8 MB (e.g. `hmv-macro-ocean.png` at 8 MB). These should be converted to WebP/AVIF with responsive srcset. |
| **No code splitting** | The entire app ships as a single ~615 kB JS chunk. Vite dynamic `import()` can split by route. |

### P3 — Low urgency

| Item | Detail |
|---|---|
| **ESLint baseline warnings (10)** | `no-unused-vars` in shadcn UI files (auto-generated `import React`), `react-refresh/only-export-components` in context/provider files. These are pre-existing and do not affect runtime behavior. |
| **`tsconfig.json` present but unused** | The project is JSX, not TypeScript. The `tsconfig.json` is a leftover. It doesn't cause build errors but is misleading. |

---

## Business content issues (do not fix without data confirmation)

These are **documented observations only**. They require product/business validation before any change:

| Issue | Detail |
|---|---|
| **Inconsistent hotline numbers** | Different hotline numbers appear in different sections (Navigation, Footer, Contact page). Confirm the canonical number with the business before normalizing. |
| **Unverified certification claims** | Pages reference certifications (e.g. ISO, export certificates). These claims have not been cross-referenced with current certificate validity. |
| **Chat simulation** | `SupportChatWidget` replies are entirely client-side simulations. The UI does not disclose this. Consider adding "automated responses" disclosure. |
| **Contact and product-page RFQ: email-draft-only workflow** | These forms produce a `mailto:` draft in the visitor's email client (the homepage Quick RFQ and the Trade Desk submit for real). This is intentional per `AGENTS.md`, but the UX copy must clearly say "a draft has been prepared" — never "your request was sent". Audit copy across both EN and VI. |
