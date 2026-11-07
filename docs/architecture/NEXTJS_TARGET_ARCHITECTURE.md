# Next.js Target Architecture: HMV Global public website

| | |
|---|---|
| Status | Revision 2, 2026-11-07. The coexistence foundation is implemented and verified on branch `feat/nextjs-foundation` (home, about, contact and 404, EN and VI). Everything else is still a design. |
| Pinned versions | `next` **16.4.5** (exact), `react`/`react-dom` 19.3.0 (installed), Tailwind 4.3.3, TypeScript 5.9.3 (new `.ts`/`.tsx` files only) |
| API source | The documentation shipped with the pinned version, `node_modules/next/dist/docs/` (the same pages as `https://nextjs.org/docs/…`). Citations below give the path under `01-app/`. Where the docs were ambiguous, the 16.4.5 source code was read and is cited instead. |
| Related | [Audit](NEXTJS_MIGRATION_AUDIT.md) · [SEO, i18n and GEO spec](SEO_I18N_GEO_SPEC.md) · [URL matrix](URL_MIGRATION_MATRIX.md) · [Roadmap](MIGRATION_ROADMAP.md) |

## 1. Principles

1. **One public frontend.** The migration happens in place in `HMV_landingpage`. Until cutover, production keeps serving the Vite build and the Next.js build only goes to preview deployments.
2. **Vite keeps working until cutover, and that is tested.** Every change to a shared module must leave the Vite builds (`build`, `build:cms`), unit tests, lint and both Vite Playwright suites green, with the same results as on `main` (§12).
3. **Shared code is framework-neutral.** Presentational components and pure data functions are shared. Anything that touches a router, head tags, `import.meta.env`, `localStorage` or a CMS transport sits in a framework adapter. Shared modules never import from a Next-only module.
4. **Reuse before rewrite.** Same markup, CSS classes, copy and behavior. A component is split only where a framework boundary runs through it.
5. **CMS boundaries unchanged.** The site uses public `GET /api/v1/public/*` endpoints only. No CMS, schema, auth or contract change.

## 2. Coexistence boundaries

Five kinds of module. "Imports allowed" is the rule a reviewer checks.

| Kind | Where | What it may import | Examples (implemented) |
|---|---|---|---|
| **Shared presentational** | `src/views/**/*View.jsx`, sections under `src/views/<route>/sections/`, `src/components/layout/*`, `src/components/ui/*`, `src/features/**/*.jsx` | React, other shared modules, `@/lib/navigation` (the adapter interface), shared pure functions. **Not** `react-router-dom`, `next/*`, `react-helmet-async`, `LanguageContext`, `PageMeta`, data hooks or transports. | `HomeView`, `AboutView`, `ContactView`, `NotFoundView`, `DetailLayout` (no longer renders `PageMeta`), `Contact`, `ContactForm`, `Navigation`, `LanguageSwitcher`, `Footer`, `SiteShell` |
| **Shared pure functions** | `src/i18n/routes.js`, `src/views/meta.js`, `src/features/*/bundled.js`, `src/features/*/api.js` (mapping and resolution), `src/data/*`, `src/lib/utils.js` | Other pure modules. No React hooks, no `import.meta.env`, no `window`. `src/i18n/routes.js` uses relative imports only, because `next.config.ts` and `proxy.ts` load it too. | URL contract, page titles and descriptions, bundled article and page mapping, `assetSrc` |
| **Vite adapters** (deleted at cleanup) | `src/main.jsx`, `index.html`, `src/app/*` (`App.jsx`, `SiteLayout.jsx`, `ViteDetailLayout.jsx`), `src/views/**/*Page.jsx`, `src/components/common/PageMeta.jsx`, `src/i18n/LanguageContext.jsx`, `LangQueryBootstrap.jsx`, `LegacyLocaleRedirect.jsx`, `src/lib/navigation.vite.jsx`, `src/features/*/hooks.js`, `usePage.js`, `src/lib/useFetched.js` | Anything shared, plus React Router, Helmet, `import.meta.env` and the browser CMS transport | `HomePage` = `useLang()` + `useArticleList()` + `<PageMeta>` + `<HomeView>` |
| **Next adapters** | `app/**`, `proxy.ts`, `next.config.ts`, `src/next/*` (`seo.ts`, `Document.tsx`), `src/lib/navigation.jsx` (Next implementation of the adapter interface) | Anything shared, plus `next/*`, server-only modules and the server CMS transport | Route files that pick a locale and render a shared view; `pageMetadata()` |
| **CMS transports** | Browser: `src/lib/cms.js` (relative `/api/v1/public`, `credentials: 'omit'`), used only by the Vite hooks. Server: `src/next/cms.server.js` (to be added in the CMS PR; `import 'server-only'`, absolute `CMS_API_ORIGIN`, `next: { revalidate, tags }`). | Each transport is imported only by its own framework's adapters | `features/*/api.js` keeps the DTO mapping and slug resolution. The CMS PR changes it to take the transport (`getJson`) as a parameter, so one mapping serves both transports. |

### 2.1 Rules that keep Vite intact

| Rule | Why | How it is enforced |
|---|---|---|
| `@/lib/navigation` is the only routing import in shared code. Vite aliases it to `navigation.vite.jsx` (`vite.config.js`). | `next/link` cannot run under Vite, and React Router cannot run under Next. | `grep "react-router-dom"` in shared modules must be empty. On the branch, the only matches are Vite adapters and pages not yet ported. |
| Helpers that Vite needs are never placed in a `server-only` module | Importing such a module from the Vite (browser) bundle breaks it | Pure helpers live in `*.js` modules without `server-only`; only the server transport and Next data loaders import `server-only`. |
| Head tags are applied by adapters, not by shared components | Vite uses `PageMeta` and Helmet on the client; Next uses route `metadata` on the server | `DetailLayout` lost its `PageMeta` call. Vite pages that are not yet ported import `ViteDetailLayout as DetailLayout` (one import line changed; JSX unchanged), which adds `PageMeta` back. |
| Titles and descriptions are computed once | Both builds must emit the same values | `src/views/meta.js`, used by `PageMeta` (Vite) and `pageMetadata()` (Next) |
| Image imports go through `assetSrc()` | Vite returns a URL string, Next returns `{ src, width, height }` | Applied in `data/hmv.js`, `data/productPhotos.js` and the components that import images directly. Swapping in `next/image` is the images PR. |
| Data comes in as props | Vite fetches with hooks in the browser; Next fetches on the server | For example, `LatestInsights` receives `state` instead of calling `useArticleList` |
| Tailwind scans code, not docs | Prose in `docs/` was adding utilities to the Vite CSS | `@source not "../../docs"` in `index.css`. Vite CSS is byte-identical to `main` (§12). |
| Tailwind runs once per build | Vite would also pick up `postcss.config.mjs` | `vite.config.js` sets `css.postcss: {}`. The PostCSS config is for Next only. |

## 3. Folder structure (as implemented)

```
HMV_landingpage/
  app/                                  # Next.js routes only
    (en)/layout.tsx                     # root layout #1: <Document lang="en">
    (en)/(site)/layout.tsx              # <SiteShell lang="en"> (nav, main, footer, chat)
    (en)/(site)/page.tsx                # /
    (en)/(site)/about/page.tsx          # /about
    (en)/(site)/contact/page.tsx        # /contact
    (vi)/layout.tsx                     # root layout #2: <Document lang="vi">
    (vi)/vi/(site)/layout.tsx           # <SiteShell lang="vi">
    (vi)/vi/(site)/page.tsx             # /vi
    (vi)/vi/(site)/about/page.tsx       # /vi/about
    (vi)/vi/(site)/contact/page.tsx     # /vi/contact
    global-not-found.tsx                # the 404 for every URL without a route (§10)
  proxy.ts                              # legacy URL forms only: one 308 to the final URL (§4.3)
  next.config.ts                        # noindex fail-safe, collection redirects, globalNotFound, agentRules: false
  postcss.config.mjs                    # Tailwind for the Next build only
  deploy/vercel.next.json               # Vercel config for Next previews (§15)
  src/
    views/                              # renamed from src/pages; Next.js would otherwise fail the build (audit F-22)
      meta.js                           # shared titles and descriptions
      home/HomeView.jsx, HomePage.jsx   # shared body / Vite adapter
      about/AboutView.jsx, AboutPage.jsx
      contact/ContactView.jsx, ContactPage.jsx
      not-found/NotFoundView.jsx, NotFoundPage.jsx
      <other routes>/<Name>Page.jsx     # not yet ported: Vite page modules as before
    app/                                # Vite application (App.jsx, SiteLayout.jsx, ViteDetailLayout.jsx). Next ignores src/app when app/ exists.
    next/                               # Next-only adapters: seo.ts, Document.tsx (later: cms.server.js, loaders)
    i18n/routes.js                      # shared URL contract (SEO spec §2)
    lib/navigation.jsx                  # adapter interface, Next implementation
    lib/navigation.vite.jsx             # Vite implementation (alias), deleted at cleanup
    features/, components/, data/, styles/
```

Naming convention for a route that has been ported: `<Name>View.jsx` is shared, `<Name>Page.jsx` is the Vite adapter, and the `app/` route files are the Next adapters.

## 4. Routing

### 4.1 Two root layouts

`app/(en)` and `app/(vi)` are route groups, each with its own root layout. That gives `<html lang>` in the server HTML, English URLs without a prefix (no rewrite or proxy on normal requests), and Vietnamese segment names that are plain folders. Docs (`03-api-reference/03-file-conventions/route-groups.md`):

- "Navigating between routes that use different root layouts… will trigger a full page reload". Switching language therefore reloads the page.
- "Routes in different groups should not resolve to the same URL path."
- With multiple root layouts and no top-level layout, the home route must sit inside a group (`(en)/(site)/page.tsx`).

The nested `(site)` group carries the chrome, so the 404 (§10) can stay chrome-less, as it is on the Vite site.

### 4.2 Route files

Each is 5–10 lines: pick the locale, compute metadata from `views/meta.js`, render the shared view with server-side data.

```tsx
// app/(vi)/vi/(site)/about/page.tsx
const state = bundledPage('about', 'vi');
export const metadata = pageMetadata({ lang: 'vi', path: '/about', ...aboutMeta('vi', state) });
export default function Page() {
  return <AboutView lang="vi" state={state} />;
}
```

### 4.3 Redirects, verified on 16.4.5

| Mechanism | Used for | Facts from the docs that shaped the design |
|---|---|---|
| Built-in trailing-slash redirect | `/about/` → `/about` | Default `trailingSlash: false` redirects to the URL without the slash (`05-config/01-next-config-js/trailingSlash.md`). It runs **before** the proxy, so `/en/about/` takes two hops. |
| `next.config` `redirects()` | Exact collection URLs only: `/products`, `/blog`, `/vi/san-pham`, `/vi/tin-tuc`, each with `missing: [{ type: 'query', key: 'lang' }]` | "any query values provided in the request will be passed through to the redirect destination" (`redirects.md`). A config redirect therefore cannot drop `?lang=`, which is why `?lang` goes to the proxy. `permanent: true` = 308, which "instructs clients/search engines to cache the redirect forever". |
| `proxy.ts` (formerly middleware; "The `middleware` file convention is deprecated and has been renamed to `proxy`", `03-file-conventions/proxy.md`) | Legacy forms: any URL with `?lang=`, `/en`, `/en/*`, `/index.html`, `/vi/products/*`, `/vi/blog/*` | Runs only for the `matcher` entries (with `has` for the query), after config headers and redirects. "Proxy defaults to using the Node.js runtime." It computes the final URL with the shared `canonicalUrl()` and drops `lang`. Normal requests never invoke it. |
| `permanentRedirect()` in route code | Article slugs owned by the other locale (articles PR) | It returns a 308, but "When used in a streaming context, this will insert a meta tag" (`04-functions/permanentRedirect.md`). So there must be no `loading.tsx` or Suspense above it. |

Complete rules and chains: [URL matrix §3–4](URL_MIGRATION_MATRIX.md).

## 5. Server and client components

`'use client'` is set only on: `Navigation`, `LanguageSwitcher`, `SupportChatWidget`, `ContactForm`, `TradeRfq`, `CinematicHero`, `ValueJourney`, `LivingLogistics` and `src/lib/navigation.jsx`. In later PRs it will be added to `Operations`, `Activities`, `LogisticsHubPage` and `PackagingLogisticsPage`. Vite ignores the directive, and the Vite build shows no warning for it.

Client components are still rendered on the server. On the branch, the server HTML of `/` contains every home section's text, asserted in `tests/next/next.spec.js`. Radix dropdown content renders only when open, so the switcher options are not in the server HTML; crawlers use the head `hreflang` links instead ([SEO spec §3](SEO_I18N_GEO_SPEC.md#3-language-switcher-behavior)).

### 5.1 Contact form and `useSearchParams`

The docs say: "During production builds, a static page that calls `useSearchParams` from a Client Component must be wrapped in a `Suspense` boundary, otherwise the build fails" (`04-functions/use-search-params.md`). The implemented split has no conditional hook:

```jsx
// features/inquiries/ContactForm.jsx ('use client')
export function ContactForm({ lang, product = '' }) { /* form, unchanged markup */ }
export function ContactFormFromUrl({ lang }) {
  const params = useSearchParams();                    // unconditional, top level
  return <ContactForm lang={lang} product={params.get('product') || ''} />;
}
// features/inquiries/Contact.jsx (shared section): only in full mode
<Suspense fallback={<ContactForm lang={lang} />}><ContactFormFromUrl lang={lang} /></Suspense>
```

In Next, the static page contains the fallback form and the client renders the preselected one. In Vite, the React Router hook does not suspend. The CTA-mode `Contact` on every inner page no longer touches search parameters.

## 6. Navigation adapter

`@/lib/navigation` exports the same API from both implementations:

| Export | Next (`navigation.jsx`) | Vite (`navigation.vite.jsx`) |
|---|---|---|
| `Link` (`to` = English key path) | `next/link` with `localizePath(to, locale of current page)` | React Router `Link` (URLs are locale-free) |
| `useRoutePath()` | English key path of `usePathname()`, for active states | `useLocation().pathname` |
| `useSearchParams()` | `next/navigation` | React Router, first tuple element |
| `useLanguageSwitch()` | `{ lang, hrefFor, select }`: `hrefFor` gives the real URL of the same page in that language; `select` adds the current query (minus `lang`) and `#hash` and navigates | `{ lang, hrefFor: () => undefined, select: setLang }` (a re-render, as today) |

## 7. Data fetching

| Content | Vite (until cutover) | Next |
|---|---|---|
| Bundled pages and articles | Hooks call the shared pure `bundledPage()` and `listBundledArticles()` | Route files call the same functions on the server |
| CMS (`CMS_CONTENT=true`; off in production and in this phase) | Hooks plus the browser transport (`lib/cms.js`, same-origin `/api/v1/public`) | Server functions plus the server transport (`next/cms.server.js`), absolute `CMS_API_ORIGIN`, `fetch(…, { next: { revalidate: 300, tags } })` (`04-functions/fetch.md`). Tags: `cms:articles`, `cms:article:<id>`, `cms:page:<key>`, `cms:sitemap`. |

Caching rules (no Cache Components): "By default, `fetch` requests are not cached" (`02-guides/caching-without-cache-components.md`). `next.revalidate` opts a fetch in, and "If two fetch requests with the same URL in the same route have different `revalidate` values, the lower value will be used" (`fetch.md`). In bundled mode the routes make no fetch and are fully static (the build output shows ○ for every page).

## 8. Rendering strategy

| Page type | Recommended | Reason |
|---|---|---|
| Homepage | SSG; ISR (300 s) once the CMS is on | Static except the 3 latest EcoNews cards |
| About | SSG with bundled copy; ISR plus tag `cms:page:about` with the CMS on | CMS-managed and rarely changed |
| Supply Chain | SSG | Bundled data; no CMS API exists |
| Product listing (`/trade-solutions`) | SSG | Bundled; ISR once a commodities API exists |
| Product detail | SSG, `generateStaticParams`, `dynamicParams = false` ("Dynamic route segments not included in `generateStaticParams` will return a 404", `dynamicParams.md`) | 6 fixed products |
| Articles listing | SSG; ISR with the CMS on | Up to 100 items |
| Article detail | ISR: `generateStaticParams` plus `dynamicParams = true` | New slugs appear without a deploy; cross-locale slugs need 308s |
| Contact / RFQ | SSG shell plus client form island | No server data; `mailto:` only |
| Logistics, Packaging, Activities, Regulations | SSG | Bundled |

SSR is not used: there is no personalization or authentication, and CMS drafts are not public. ISR trade-offs are in §9.

## 9. CMS freshness, load and takedown (applies from the CMS PR)

### 9.1 What server fetching does and does not solve

| Concern | Effect of server fetching plus ISR |
|---|---|
| Browser CORS and the same-origin rewrite | **Removed.** The browser never calls the CMS. |
| Load from normal traffic | **Reduced.** At most one CMS request per cache entry per revalidation window, instead of one per visitor. |
| Rate limiting of the public API | **Not solved.** (1) The CMS public API stays reachable directly at its own origin by anyone. (2) Through the site, every never-seen article slug renders on demand and can cost up to two CMS calls (own locale, then the other locale for `alternates`); a bot enumerating random slugs therefore reaches the CMS. A CMS-side or CDN rate limit is still required (CMS/infra owner). The site adds: slug syntax validation before fetching, an optional Vercel WAF rate-limit rule on article routes (owner), and cached 404 results (verify in the CMS PR). |

### 9.2 Freshness: 300 s is a revalidation interval, not an update SLA

The docs describe stale-while-revalidate (`02-guides/incremental-static-regeneration.md`): after the window, "the next request will still return the cached (now stale) page", and regeneration runs in the background. Consequences:

| Layer | Behavior |
|---|---|
| CMS HTTP caching | The CMS sends `public, max-age=60, stale-while-revalidate=300` on every public response, **404s included**. Any HTTP cache between the site's functions and the CMS (for example a CDN in front of the CMS) can add up to about 360 s. |
| Next data cache, per fetch | Each distinct request is its own entry with its own 300 s window: the article detail, the home list (`pageSize=3`), the insights list (`pageSize=100`), the sitemap pages, About per locale. They expire and refresh **independently**, so for a while a new article can be in the list but not the sitemap, or an unpublished one can stay in the list after its detail returns 404. |
| Page (ISR) | Revalidates at the lowest fetch window, on the **first request after** the window. That request still gets the stale page; the next one gets the new page once regeneration succeeds. A page with no traffic stays stale until someone requests it. |
| Errors | "If an error is thrown while attempting to revalidate data, the last successfully generated data will continue to be served from the cache. On the next subsequent request, Next.js will retry" (ISR guide). During a CMS outage, neither updates nor takedowns reach the site. |

Expectation to communicate to editors: with traffic, typically within about 5–11 minutes, with no guaranteed upper bound. For anything urgent, use §9.3.

### 9.3 Emergency takedown (a prerequisite before `CMS_CONTENT=true` in production)

1. **CMS:** archive or unpublish the article or page locale (an editor with the right permission). The public API then returns 404, after any HTTP cache in front of the CMS (≤ about 360 s).
2. **Site:** an operator calls the protected endpoint `POST /api/revalidate` (secret header) with the affected tags (`cms:article:<id>`, `cms:articles`, `cms:sitemap`, or `cms:page:<key>`). It calls `revalidateTag(tag, { expire: 0 })`; the docs: "`{ expire: 0 }`: Stale content is never served, so the next request is a blocking revalidate" (`04-functions/revalidateTag.md`; v16 signature `revalidateTag(tag, profile)`, single-argument form deprecated).
3. **Verify:** the URL returns 404, and the lists and sitemap no longer contain it.
4. **If the CMS is unreachable**, which leaves stale content in place: redeploy with the slug in `CMS_BLOCKED_SLUGS`, which the proxy answers with 404/410 (Vercel environment changes need a new deployment). Do not use rollback for this: older deployments contain the same content.
5. **Images:** CMS media files are served by the CMS media host. Optimized copies (`next/image`, after the images PR) are cached for `images.minimumCacheTTL`. Removal = delete the media in the CMS, revalidate the pages, then purge the image cache in Vercel (owner), or wait for the TTL.

The endpoint, the runbook and the blocked-slugs switch are built in the CMS PR. Because operators call it, it is needed even without a CMS webhook.

## 10. Errors, loading and 404 (verified on the branch)

| Situation | Implementation | Observed (`next start`, 16.4.5) |
|---|---|---|
| URL without a route (EN or VI) | `app/global-not-found.tsx` with `experimental.globalNotFound: true`. Same markup as the Vite 404 (`NotFoundView`: chrome-less, "Page not found", link to `/`, English for every URL as on Vite today). | **404**, static, fully server-rendered, `<html lang="en">`, `noindex` (meta tag and header) |
| `notFound()` thrown inside a page (unknown product or article, later PRs) | Route-segment `not-found.tsx` | **Status 404 and noindex are correct, but the body is an error shell (`<html id="__next_error__">`) rendered on the client from the RSC payload.** Reproduced with a static probe page as well. The cause is that there is no single layout above both root layouts (`03-file-conventions/not-found.md`: `global-not-found.js` is "useful when… your app has multiple root layouts"). |
| CMS error on a URL never generated | `error.tsx` (client, localized) | 5xx: crawlers retry, and a live page is not deindexed |
| Streaming | No `loading.tsx` and no Suspense above `notFound()` or redirects: "After streaming starts, the status code remains `200`" (`not-found.md`) | n/a |

Consequences for later PRs:

- Use `dynamicParams = false` wherever the set of slugs is known (products, bundled articles), so an unknown slug never matches a route and gets the server-rendered global 404.
- For CMS article slugs (`dynamicParams = true`), a 404 has the correct status with a client-rendered body. This is acceptable for indexing, because search engines act on the status. Alternatives, if a server-rendered body is required, are listed in the roadmap (D-17).
- `globalNotFound` is **experimental** in 16.4.5 (the build prints "Experiments (use with caution)"). If it is removed or changes, the fallback is catch-all routes plus segment `not-found.tsx`: status stays correct and the body becomes client-rendered.

## 11. Images, fonts and CSS

- **Images:** the static import extensions accepted by 16.4.5 are `jpg, jpeg, png, webp, avif, ico, svg` (`node_modules/next/dist/build/webpack/loaders/utils.js`). The two `.jfif` files were renamed to `.jpg` (JFIF is JPEG, so the pixels are identical). Plain `<img>` with `assetSrc()` is used until the images PR switches to `next/image` ("If the image is statically imported, Next.js will automatically determine the intrinsic width and height", `01-getting-started/12-images.md`).
- **CSS:** `index.css` then `hmv.css` are imported in `src/next/Document.tsx`, the same order as `src/main.jsx`. Tailwind for Next uses `@tailwindcss/postcss`, as documented in `01-getting-started/11-css.md`.
- **Fonts:** the Google Fonts `<link>` from `index.html` is kept in `Document.tsx` for parity. `next/font` comes in the images/CWV PR: `subsets` must cover Vietnamese, which needs checking per family (`02-components/font.md`).

## 12. Coexistence evidence (branch `feat/nextjs-foundation`)

| Check | `main` (baseline) | Branch |
|---|---|---|
| `npm run build` (Vite) JS / CSS | 620.42 kB / 156.50 kB `index-CUg3tHd_.css` | 623.26 kB (+2.8 kB: route contract, adapters) / **156.50 kB, same file hash** |
| `npm run build:cms` | passes | passes |
| `npm test` (Vitest) | 49/49 | 53/53 (+4 route-contract tests) |
| `npm run lint` | 0 errors, 9 warnings | 0 errors, 9 warnings |
| Playwright, Vite | 89 passed, 3 skipped | 111 passed, 7 skipped. +18: the `?lang=vi` → English regression for about, product, article and contact (desktop) and the rollback-compatibility spec. The 4 extra skips are the desktop-only switcher cases on the mobile project. |
| Playwright, CMS mode (Vite) | 35 passed, 1 skipped | 35 passed, 1 skipped |
| `next build` | n/a | passes; 6 static pages, proxy, global 404 |
| Playwright, Next (`tests/next/`) | n/a | 75 passed, 3 skipped (switcher cases on mobile) |

## 13. Environment variables and security

| Variable | Scope | Purpose |
|---|---|---|
| `SITE_INDEXABLE` | Next, build and runtime | Only the exact value `true` removes the noindex header and meta. **Unset everywhere until cutover.** At cutover it is set on the production project's Production environment only. A fail-safe default: forgetting it leaves a site unindexed, never a test site indexed (§15.2). |
| `CMS_CONTENT` | Next server | `true` reads About and EcoNews from the CMS. Off in this phase. |
| `CMS_API_ORIGIN` | Next server | Never `NEXT_PUBLIC_*`. |
| `CMS_MEDIA_HOST` | `next.config` | `images.remotePatterns` allow-list (images PR) |
| `REVALIDATE_SECRET`, `CMS_BLOCKED_SLUGS` | Next server | §9.3 |
| `VITE_CMS_CONTENT` | Vite (`.env.cms`) | Unchanged until cleanup |

## 14. TypeScript and linting

- `next build` type-checks. Next added its standard entries to `tsconfig.json` (`plugins`, `isolatedModules`, `incremental`, `.next/types` includes); Vite ignores them.
- `strict` stays `false` (Next's default for this project). Shared JS components are typed by inference; one JSDoc annotation (`SiteShell`) was needed so an optional prop is not inferred as required.
- ESLint ignores `.next/`. The Fast Refresh rule is switched off only for the two navigation adapters, which export hooks next to `Link` by design.
- `agentRules: false` in `next.config.ts`. Otherwise `next dev` writes a managed block into `AGENTS.md` (`05-config/01-next-config-js/agentRules.md`); that file is owned by the team.

## 15. Deployment

### 15.1 What exists today (observed 2026-11-07)

- One Vercel project (`hmv-landingpage`) with Git integration. Every push to a non-`main` branch creates a **Preview** deployment; merges to `main` deploy **Production** (GitHub deployment history).
- Preview URLs answer `302` to Vercel SSO (Vercel Authentication) with `X-Robots-Tag: noindex`. Vercel's documentation does not mention that header, so it is treated as observed behavior, not a guarantee.
- `https://hmv-landingpage.vercel.app/` serves the production build publicly (200, no noindex), duplicating `www`. This is an existing issue for the owner (audit F-33).
- GitHub Actions: only the SonarQube workflow, on `main` pushes and PRs. Pushing a feature branch runs no workflow.

### 15.2 Next.js preview configuration

The Next build must never read the root `vercel.json`, because its SPA rewrite sends every path to `/index.html`. Vercel does not document how `vercel.json` rewrites combine with a Next.js deployment.

| Item | Setting |
|---|---|
| Project | A **separate, temporary** Vercel project (for example `hmv-landingpage-next`) created with `vercel project add` (CLI, alias of `create`), **not** imported from Git. Docs: "The first deployment of a new project is always a production deployment… even when you import a Git repository in the dashboard" (`vercel.com/docs/deployments/environments`). |
| Protection, set before the first deployment | Deployment Protection → **All Deployments** (Vercel Authentication): "all URLs are protected, including your production domain… and generated URLs", available on all plans (`vercel.com/docs/deployment-protection`). This covers the project's first deployment, which is a production one, and its `*.vercel.app` domains. |
| Config file | `deploy/vercel.next.json`: framework `nextjs`, no rewrites, `git.deploymentEnabled: false`, `X-Robots-Tag: noindex, nofollow` on every path. It is passed with the CLI global option `--local-config` ("set the path to a local `vercel.json` file"; listed for `vercel build` and `vercel deploy`). |
| Build and deploy | `.github/workflows/next-preview.yml` with `vercel pull`, then `vercel build --local-config deploy/vercel.next.json`, then a guard that fails if any route in `.vercel/output/config.json` targets `/index.html`, then `vercel deploy --prebuilt --local-config …` (never `--prod`), then the preview acceptance tests. Linking uses `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` ("to skip project linking", `vercel.com/docs/cli/global-options`). Vercel CLI pinned to 65.2.0. |
| Noindex, defense in depth | (1) Vercel Authentication; (2) the platform header from `deploy/vercel.next.json`; (3) the app's fail-safe `X-Robots-Tag` header and `<meta name="robots">` unless `SITE_INDEXABLE=true`. **robots.txt is not used for this:** `Disallow` stops crawling, not indexing, and would hide the noindex from crawlers. `VERCEL_ENV` is not relied on. |
| Status | The workflow is **not yet executed**: it needs the owner setup in the [roadmap](MIGRATION_ROADMAP.md#62-nextjs-preview-owner-setup-oa-1). Until `NEXT_PREVIEW_ENABLED=true` is set, it is skipped. |

### 15.3 Cutover and rollback

Cutover switches the existing production project to the Next.js framework preset and removes the SPA rewrite in the same PR. Rollback is Vercel Instant Rollback to the last Vite deployment. The temporary Next project is deleted after cutover. Rollback limits and preconditions: [roadmap §8](MIGRATION_ROADMAP.md#8-rollback-contract).
