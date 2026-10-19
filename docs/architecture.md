# Landing page architecture

React 19 + Vite 6 single-page app. Routing uses React Router 7 in declarative mode (`<BrowserRouter>`). Styling is Tailwind 4 plus the hand-written `src/styles/hmv.css`. Page head tags come from react-helmet-async, primitives are Radix via shadcn, and icons are lucide-react.

There is no backend. Content is static bilingual data in `src/data/`, and forms open a pre-filled email draft (mailto).

## Folders

```
src/
  main.jsx             mounts <App/>, imports global CSS (index.css before hmv.css)
  app/                 App.jsx (providers + route table), SiteLayout.jsx (layout route)
  pages/<route>/       <Name>Page.jsx + sections used only by that page
    home/sections/     the eight home sections, in render order in HomePage.jsx
  features/<name>/     business functionality used by more than one page or the shell
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
| `/insights` | `pages/insights/InsightsPage` | DetailLayout. EcoNews list plus the first 3 regulations, in data order. |
| `/regulations` | `pages/regulations/RegulationsPage` | DetailLayout |
| `/products/:id` | `pages/products/ProductDetailPage` | DetailLayout. An unknown id shows the "not found" title and the CTA only. |
| `/logistics` | `pages/logistics/LogisticsHubPage` | Its own hero. Adds its own delayed smooth `#hash` scroll on top of SiteLayout's. |
| `/packaging-logistics` | `pages/packaging-logistics/PackagingLogisticsPage` | Its own hero |
| `/blog/:slug` | `pages/article/ArticlePage` | Outside SiteLayout (see below). A Vietnamese slug redirects to the English canonical slug; an unknown slug goes to `/insights`. |
| `/en/*`, `/vi/*` | `i18n/LegacyLocaleRedirect` | Sets the language and redirects to the locale-free URL. |
| `*` | `pages/not-found/NotFoundPage` | No site chrome |

URLs are locale-free. Adding `?lang=en` or `?lang=vi` to any URL sets the language and is then removed from the address bar (`i18n/LangQueryBootstrap`).

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

- `npm run build` and `npm test` (node:test; picks up the co-located `*.test.js` files).
- `npm run lint` does not work yet: ESLint is not installed or configured.
