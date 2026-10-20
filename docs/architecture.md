# Landing page architecture

React 19 + Vite 6 single-page app. Routing uses React Router 7 in declarative mode (`<BrowserRouter>`). Styling is Tailwind 4 plus the hand-written `src/styles/hmv.css`. Page head tags come from react-helmet-async, primitives are Radix via shadcn, and icons are lucide-react.

There is no backend of its own. Content is static bilingual data in `src/data/`, and forms open a pre-filled email draft (mailto). The one exception is EcoNews in CMS mode (`--mode cms`), which reads the HMV CMS public API; see `docs/cms-integration.md`. The default build, production included, stays static.

## Folders

```
src/
  main.jsx             mounts <App/>, imports global CSS (index.css before hmv.css)
  app/                 App.jsx (providers + route table), SiteLayout.jsx (layout route)
  pages/<route>/       <Name>Page.jsx + sections used only by that page
    home/sections/     the eight home sections, in render order in HomePage.jsx
  features/<name>/     business functionality used by more than one page or the shell
    articles/          EcoNews data access (bundled or CMS public API), ArticleGrid, Tiptap RichText (+ tests)
    inquiries/         Contact, TradeRfq, mailto builder, RFQ validation (+ tests)
    regulations/       Regulations list (insights + regulations pages)
    support-chat/      SupportChatWidget + openSupportChat()
  components/
    layout/            site chrome: SiteShell, Navigation, Footer, LanguageSwitcher, DetailLayout
    common/            PageMeta (SEO tags), BrandLogo
    ui/                shadcn primitives: business-agnostic, regenerate with the shadcn CLI
  i18n/                language state (localStorage `hmv_lang`), ?lang= and /en|/vi URL handling
  data/                static bilingual content and photo registries (future CMS seam)
  lib/                 generic helpers (cn)
  styles/              index.css (Tailwind + tokens), hmv.css (all layout/editorial CSS)
  assets/              bundled images
```

## Dependency rules

`app` → `pages` → `features` → `components` → `lib`. `data` and `i18n` can be used from anywhere.

- A page never imports another page.
- A feature never imports a page.
- `components/layout` is site chrome and may compose features (the support chat and the contact CTA).
- `components/ui` and `lib` stay business-agnostic: no `data/`, no copy.
- Inside a page or feature, use relative imports. Across modules, use `@/`.
- There are no import cycles and no unreachable modules. Keep it that way: delete code rather than leaving it unimported.

## Routes

| URL | Module | Notes |
|---|---|---|
| `/` | `pages/home/HomePage` | Section order is defined in `HomePage.jsx`. `#initiate-trade` targets the RFQ form. |
| `/about` | `pages/about/AboutPage` | DetailLayout |
| `/supply-chain` | `pages/supply-chain/SupplyChainPage` | DetailLayout. Deep links: `#commodities`, `#wind-energy`, `#logistics-capacity`, stage ids. |
| `/trade-solutions` | `pages/trade-solutions/TradeSolutionsPage` | DetailLayout |
| `/activities` | `pages/activities/ActivitiesPage` | DetailLayout |
| `/contact` | `pages/contact/ContactPage` | DetailLayout with no trailing CTA. `?product=` preselects the product. |
| `/insights` | `pages/insights/InsightsPage` | DetailLayout. EcoNews list (`features/articles`) plus the first 3 regulations, in data order. |
| `/regulations` | `pages/regulations/RegulationsPage` | DetailLayout |
| `/products/:id` | `pages/products/ProductDetailPage` | DetailLayout. An unknown id shows the "not found" title and the CTA only. |
| `/logistics` | `pages/logistics/LogisticsHubPage` | Its own hero. Adds its own delayed smooth `#hash` scroll on top of SiteLayout's. |
| `/packaging-logistics` | `pages/packaging-logistics/PackagingLogisticsPage` | Its own hero |
| `/blog/:slug` | `pages/article/ArticlePage` | Outside SiteLayout (see below). Static mode: a Vietnamese slug redirects to the English canonical slug; an unknown slug goes to `/insights`. CMS mode: slugs are per locale and resolved through `alternates`; unknown slugs show a not-found state (noindex). |
| `/en/*`, `/vi/*` | `i18n/LegacyLocaleRedirect` | Sets the language and redirects to the locale-free URL. |
| `*` | `pages/not-found/NotFoundPage` | No site chrome |

URLs are locale-free. Adding `?lang=en` or `?lang=vi` to any URL sets the language and is then removed from the address bar (`i18n/LangQueryBootstrap`).

## Layout ownership

| Concern | Owner |
|---|---|
| Provider tree (Helmet, Language, Router) | `app/App.jsx` |
| Shared chrome (nav + footer) | `app/SiteLayout.jsx` → `components/layout/SiteShell` |
| Navigation (desktop + mobile) | `components/layout/Navigation` (~592 lines — see tech debt) |
| Footer | `components/layout/Footer` |
| Language switcher | `components/layout/LanguageSwitcher` (Radix DropdownMenu) |
| Inner-page layout (hero + body + CTA) | `components/layout/DetailLayout` |
| Blog page chrome | `pages/article/ArticlePage` (its own SiteShell — intentional remount) |

## i18n rules

- Language is stored in `localStorage` key `hmv_lang` and read by `LanguageContext`.
- URLs are always locale-free. The language is **not** in the URL path.
- `?lang=en` / `?lang=vi` sets the language and is immediately removed from the address bar by `LangQueryBootstrap`.
- Legacy `/en/…` and `/vi/…` prefixed URLs are handled client-side by `LegacyLocaleRedirect` (sets language, then `<Navigate replace>`). On Vercel these are already 301'd by `vercel.json`; this component is the fallback.
- All bilingual copy lives in `src/data/` files as `{ en: …, vi: … }` objects. Components read the active locale via `useLanguage()`.

## Shared UI responsibilities

| Component | Responsibility |
|---|---|
| `components/common/PageMeta` | `<title>`, `<meta description>`, OG/Twitter tags, canonical `<link>` via Helmet |
| `components/common/BrandLogo` | HMV logo image; used by Navigation and footer |
| `components/ui/*` | Radix-based shadcn primitives (Button, Dialog, DropdownMenu) — business-agnostic |
| `features/inquiries/inquiry.js` | Shared mailto builder; used by Contact and TradeRfq |
| `features/inquiries/rfq.js` | RFQ field validation; used by TradeRfq |
| `features/articles/hooks` | `useArticleList` / `useArticle`: bundled articles, or the CMS public API in CMS mode, as one view shape |
| `features/articles/ArticleGrid` | EcoNews cards plus loading/empty/error states; used by LatestInsights and InsightsPage |
| `features/articles/RichText` | Whitelist renderer for CMS Tiptap JSON (no raw HTML); also renders the bundled articles |
| `features/regulations/Regulations` | Regulation card list; used by InsightsPage and RegulationsPage |
| `features/support-chat/SupportChatWidget` | Floating chat widget; mounted once in SiteShell |

## Behavior that is easy to break

- **Layout persistence.** `SiteLayout` stays mounted across the standard routes, so expanded nav submenus and the chat conversation survive navigation. `/blog/:slug` renders its own `SiteShell`, so entering an article remounts the chrome, including the chat. Moving articles under `SiteLayout` would change that.
- **Scroll.** `SiteLayout` scrolls to the `#hash` target (on the next animation frame, instant) or to the top whenever the path or hash changes. `ArticlePage` forces the top and sets `history.scrollRestoration = 'manual'`.
- **Support chat.** The chat is opened with `openSupportChat()`, which fires a window event; there is no shared state. Its replies are simulated client-side.
- **Forms.** Forms never send anything. They build a mailto draft (`features/inquiries/inquiry.js`), so the UI must say a draft was prepared, never that a request was sent.
- **SEO.** `PageMeta` writes the title, description and OG/Twitter tags directly and the canonical link through Helmet. `index.html` holds the static fallback tags and the Organization JSON-LD.

## Adding things

- **New route:** create `pages/<route>/<Name>Page.jsx` and add one `<Route>` inside `SiteLayout` in `app/App.jsx`. Then update the nav/footer links and `public/sitemap.xml`.
- **Inner page:** wrap the content in `<DetailLayout lang title description>`.
- **New section:** if only one page uses it, put it in that page's folder. If it is business-specific and used by two or more pages, put it in `features/<name>/`. If it is generic UI, put it in `components/ui/`.
- **Styles:** `hmv.css` is one global stylesheet with no scoping. Keep class names stable; renaming a class silently unstyles markup.

## Checks

- `npm run build` — Vite production build; must pass before any commit.
- `npm test` — node:test unit tests for inquiry + RFQ logic and the articles API client / rich-text renderer (co-located `*.test.js` files).
- `npm run lint` — ESLint flat config (React Hooks + React Refresh checks). Baseline has 0 errors / 10 warnings.
- `npm run test:e2e` — Playwright smoke tests (routes, i18n, navigation, workflows, visual) against `vite preview` on port 4173, then the CMS-mode suite (`tests/cms-*.spec.js`, mocked API) against `dist-cms` on port 4174.
- `npm run test:e2e:cms` — CMS-mode suite only (builds `dist-cms` first).
- `npm run dev:cms` / `npm run build:cms` — EcoNews from the CMS public API (proxied to `CMS_API_ORIGIN`, default `http://localhost:4000`).
- `npm run test:visual` — Visual screenshot smoke tests only.

---

## Known technical debt (prioritized)

### P1 — High impact, low risk to fix

| Item | Detail |
|---|---|
| **9,179-line monolithic `hmv.css`** | One global stylesheet with no scoping. Renaming any class silently breaks markup. The file mixes design tokens, layout utilities, component-specific rules and page-specific overrides. Candidate for gradual migration to co-located Tailwind utilities or CSS Modules per section. |
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
| **RFQ/Contact: email-draft-only workflow** | Forms produce a `mailto:` draft in the visitor's email client. This is intentional per `AGENTS.md`, but the UX copy must clearly say "a draft has been prepared" — never "your request was sent". Audit copy across both EN and VI. |
