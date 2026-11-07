# Next.js Migration Audit: HMV Global public website

| | |
|---|---|
| Status | Revision 2, 2026-11-07. Production is unchanged: it runs the Vite build with `CMS_CONTENT` off. A coexistence foundation is implemented on branch `feat/nextjs-foundation` and is not merged. |
| Repository | `HMV_landingpage` (GitHub `HoangLonglogisticsproject/HMV_landingpage`, formerly `global-agro-trails`), `main` at `a93fcc4` |
| Also inspected (read-only) | `CMS_HMV` `main` at `f53874b`; live `https://www.hmv-global.com`, Vercel previews and the GitHub deployment history (HTTP GET/HEAD only) |
| Companion documents | [Target architecture](NEXTJS_TARGET_ARCHITECTURE.md) · [SEO, i18n and GEO spec](SEO_I18N_GEO_SPEC.md) · [URL matrix](URL_MIGRATION_MATRIX.md) · [Roadmap](MIGRATION_ROADMAP.md) |

## What changed in revision 2

| Topic | Revision 1 said | Revision 2 |
|---|---|---|
| Coexistence | Vite unchanged until cutover, while shared modules became server components and lost `PageMeta` | Explicit boundaries: shared presentational and pure modules, Vite adapters, Next adapters, browser and server CMS transports. Implemented and measured: Vite CSS byte-identical, all Vite suites green (architecture §2, §12). |
| `?lang` and the switcher | The switcher kept the query, so `/about?lang=vi` could bounce back to Vietnamese; `/products?lang=vi` ended on a 404 | `lang` is always removed; `product`, UTM and `#hash` are kept; `/products?lang=vi` goes to `/vi/trade-solutions` in one hop; hop counts are measured, not estimated (matrix) |
| Preview deployment | "A separate Vercel project" | A concrete config that never reads the root `vercel.json`, defense-in-depth noindex, protection before the first (production) deployment of the new project, and preview and production acceptance suites kept apart |
| Rollback | "no lasting harm" | Removed. Rewritten as a contract with preconditions, known residual effects, cached-308 handling and a rehearsal (roadmap §8). |
| CMS | "Server fetching removes the rate-limit blocker"; "300 s window" | Server fetching removes the browser CORS dependency and reduces load from normal traffic. **It does not rate-limit the public API.** 300 s is a revalidation interval, not an SLA. An emergency takedown procedure is a prerequisite (architecture §9). |
| D-12 | A list of observations | A decision table with current content, what to verify, and three possible outcomes per item (§9) |
| Roadmap | VI tests planned before VI routes existed; a conditional hook in Contact | Pages ship in both locales in one PR; `ContactFormFromUrl` calls the hook unconditionally inside Suspense |
| API claims | From general knowledge | Checked against the documentation shipped with the pinned `next@16.4.5` and its source code (architecture header) |

## Summary

**Recommendation (unchanged):** migrate to Next.js App Router in place. The foundation branch proves the hard parts work side by side with Vite: shared components, locale routing, the legacy URL contract, real 404s, server-side metadata and the noindex fail-safe.

Key facts:

1. **Content is invisible without JavaScript.** Every URL serves an empty SPA shell (`index.html:34`), so link previews and many crawlers see the homepage tags everywhere (F-01).
2. **Vietnamese has no URL of its own**, and status codes are wrong: unknown URLs and `/en/*` return 200 (F-02 to F-05).
3. **The CMS is not live** (F-12). Server-side fetching removes the browser CORS and same-origin-rewrite dependency (F-13). It does not replace a rate limit on the public API.
4. **Reuse is high:** about 92% of JS/JSX lines and all of the CSS. On the branch, the Vite CSS is byte-identical to `main`.
5. **Next.js 16.4.5 specifics change the design:**
   - `src/pages` makes the build fail (F-22).
   - Config redirects cannot drop `?lang` (F-35).
   - With two root layouts, the clean 404 needs the experimental `global-not-found`, and `notFound()` inside a page gets a client-rendered body (F-34).
   - `next dev` edits `AGENTS.md` unless `agentRules: false` (F-37).
6. **The biggest non-code risk is content consistency.** Server rendering makes every claim extractable (§9, D-12).

### Corrections to the brief

| Brief says | Source shows |
|---|---|
| Repository at `D:\Hoang Long_logistics\HMV_landingpage` | `D:\HMV_global\HMV_landingpage` |
| "CMS content and publishing workflows: already implemented" | True in the CMS for EcoNews and About. The public site reads them only in CMS mode; production renders `src/data/*`. |
| `docs/architecture.md`: legacy prefixes "301'd by vercel.json" | `vercel.json` has only the SPA rewrite; live `/en/about` returns 200 |

## 1. Method

- Read every source module, config, test and CI file in the repository. Baseline on `main`, run in a separate worktree:
  - Vite build: 620.42 kB JS, 156.50 kB CSS.
  - Unit tests: 49/49.
  - Lint: 0 errors, 9 warnings.
  - Playwright: 89 passed, 3 skipped.
  - CMS-mode Playwright: 35 passed, 1 skipped.
- Read the CMS public contract, OpenAPI document, public controllers and article service (read-only).
- Verified every Next.js claim against `node_modules/next/dist/docs/` of `next@16.4.5` and, where needed, its source:
  - `lib/find-pages-dir.js`
  - `build/webpack/loaders/utils.js`
  - `server/app-render/app-render.js`
- Verified Vercel claims against vercel.com/docs (git configuration, CLI global options, deployment protection, environments) and observed behavior: preview headers and the GitHub deployment history.

## 2. Current stack

| Concern | Today |
|---|---|
| Framework | React 19.3 SPA, Vite 6.4, React Router 7.18 (declarative), `react-helmet-async` |
| Styling | Tailwind 4.3 (`@tailwindcss/vite`), global `hmv.css` (9,712 lines), `index.css` (257) |
| Content | `src/data/*` bilingual objects; CMS public API only in CMS mode |
| Forms | client-side validation, then a `mailto:` draft |
| Hosting | Vercel project `hmv-landingpage`: Git integration, previews for every branch push (Vercel Authentication), production from `main`, SPA rewrite in `vercel.json` |
| CI | SonarQube workflow (`main` and PRs): lint, unit tests and coverage. **No build or E2E gate.** |
| CMS admin | Next.js 16.4.0, React 19.3.0 |

## 3. Public route inventory

| URL | Module (`src/views/…`, renamed from `src/pages`) | Data | Interactive parts | Live status |
|---|---|---|---|---|
| `/` | `home/HomePage` → `HomeView` | `data/hmv`, `productPhotos`, 3 EcoNews | hero button, value journey, map tooltips, RFQ form | 200 |
| `/about` | `about/AboutPage` → `AboutView` | `features/pages` (bundled, or CMS in CMS mode) | none | 200 |
| `/supply-chain` | `supply-chain/SupplyChainPage` | `stages`, `products`, `photos` | stage tabs | 200 |
| `/trade-solutions` | `trade-solutions/TradeSolutionsPage` | `products`, `stages` | none | 200 |
| `/products/:id` (6) | `products/ProductDetailPage` | `products`, `productPhotos` | none | 200; **unknown id also 200** |
| `/activities` | `activities/ActivitiesPage` | `photos`, `logisticsActivities` | carousel, lightbox | 200 |
| `/contact` | `contact/ContactPage` → `ContactView` | `copy`, `products`; `?product=` | form | 200 |
| `/insights` | `insights/InsightsPage` | EcoNews (up to 100), regulations | none | 200 |
| `/regulations` | `regulations/RegulationsPage` | `data/regulations` | none | 200, missing from sitemap |
| `/logistics` | `logistics/LogisticsHubPage` | `logisticsServices` | lightbox, hash scroll | 200 |
| `/packaging-logistics` | `packaging-logistics/PackagingLogisticsPage` | `operationalLogistics` | lightbox | 200 |
| `/blog/:slug` | `article/ArticlePage` | `features/articles` | back button | 200 |
| `/en/*`, `/vi/*` | `i18n/LegacyLocaleRedirect` | none | client redirect | **200** |
| `*` | `not-found/NotFoundPage` → `NotFoundView` | none | none | **200** |

The chrome is `SiteShell`: `Navigation` (620 lines), `Footer`, and `SupportChatWidget` (543 lines, simulated replies). Deep-link anchors and query parameters are listed in the [URL matrix](URL_MIGRATION_MATRIX.md#28-hash-anchors).

## 4. i18n today

The language comes from `localStorage['hmv_lang']` or `?lang=` (which is then stripped). `/en/*` and `/vi/*` redirect on the client. `<html lang>` is set on the client only, and there is no `hreflang`. Sections already receive `lang` as a prop; `useLang()` is called only by page modules and the chrome. That is why the adapter split costs one line per page.

## 5. CMS integration today

- Browser transport `src/lib/cms.js` (relative `/api/v1/public`, `credentials: 'omit'`) with `useFetched` hooks.
- Mapping and slug resolution in `features/*/api.js`, a whitelist `RichText` renderer.
- CMS facts:
  - `locale` defaults to `vi`.
  - Only live locales are served.
  - List summaries carry the cross-locale article `id` but no `alternates`.
  - Every public response, 404s included, is cached `public, max-age=60, stale-while-revalidate=300`.
  - There is no publish webhook.
  - The admin builds links as `/tin-tuc/<slug>`.
  - The public API has no rate limit.

## 6. SEO surfaces today

- One static set of tags in `index.html`.
- Per-route title, description, OG tags and canonical written on the client by `PageMeta`, with a trailing slash kept in the canonical.
- Organization JSON-LD with `employee[]` in `index.html`; Article JSON-LD on the client.
- A static sitemap with 18 URLs: no VI URLs, no `/regulations`, no `lastmod`.
- `robots.txt` allows everything.
- `llms.txt` has a good factual-boundary section and tells readers to use `?lang=vi`.

## 7. Performance baseline

| Item | Size |
|---|---|
| JavaScript (one chunk) | 620,417 B |
| CSS | 156,496 B |
| `hmv-macro-ocean.png` (hero inset) | 8.1 MB |
| `logohmv.png` (1536×1024, every page) | 1.8 MB |
| Other PNGs | 0.8–2.6 MB each |
| Fonts | render-blocking Google Fonts CSS |

No field Core Web Vitals data exists.

## 8. Findings

| ID | Sev. | Finding | Evidence |
|---|---|---|---|
| F-01 | High | Client-only rendering: no content or per-page tags without JavaScript | `index.html:34`, `PageMeta.jsx` |
| F-02 | High | Soft 404s: every unknown path and unknown product returns 200 | `vercel.json:3-8`; live |
| F-03 | Medium | `/en/*` and `/vi/*` are not server redirects | live `/en/about` 200 |
| F-04 | Medium | `/about/` returns 200 and canonicalizes to itself | live; `PageMeta.jsx:33` |
| F-05 | High | No crawlable Vietnamese URLs, no `hreflang` | `LanguageContext.jsx`, `PageMeta.jsx:29` |
| F-06 | Medium | Doubled brand in the `/packaging-logistics` and `/logistics` titles | `PackagingLogisticsPage.jsx:34-35`, `LogisticsHubPage.jsx:54-55` |
| F-07 | Low | `/supply-chain` and `/trade-solutions` share a description | `copy.chainText` |
| F-08 | Medium | Sitemap incomplete and static | `public/sitemap.xml` |
| F-09 | Low | `llms.txt` advertises `?lang=vi` | `public/llms.txt:7` |
| F-10 | Low | Client-side Article JSON-LD; the CMS author is ignored | `ArticlePage.jsx:16,43` |
| F-11 | Medium | JSON-LD `employee[]` contradicts the About page (C-02) | `index.html:24` |
| F-12 | Info | Production runs bundled content | live `/api/v1/public/pages/about` returns `text/html` |
| F-13 | Info | **Corrected.** Browser CMS access needs a same-origin rewrite (no CORS for the site). Server fetching removes that dependency and reduces load from normal traffic. **The public API's missing rate limit remains** and must be handled CMS-side or by a CDN (architecture §9.1). | `docs/cms-integration.md` |
| F-14 | Info | No CMS publish webhook | search of `CMS_HMV` |
| F-15 | Medium | CMS admin links `/tin-tuc/<slug>` have no route on the site | `CMS_HMV/.../article-form.ts:22` |
| F-16 | Info | Summaries carry a cross-locale `id` | `articles.service.ts:1032` |
| F-17 | Info | CMS caches 404s for up to 360 s | public controllers |
| F-18 | Medium | 620 KB JavaScript in one chunk | build |
| F-19 | High | Oversized images, including the logo on every page | §7 |
| F-20 | Low | Render-blocking font CSS | `index.html:9-12` |
| F-21 | Low | The footer year is computed at render, so static pages freeze it at build time | `Footer.jsx:74` |
| F-22 | Blocker, **fixed on branch** | `src/pages` next to a root `app/` makes `next build` throw "`pages` and `app` directories should be under the same folder" (16.4.5 `lib/find-pages-dir.js`). Renamed to `src/views`. | branch |
| F-23 | Blocker, **fixed on branch** | `.jfif` is not a supported static import (16.4.5 accepts `jpg, jpeg, png, webp, avif, ico, svg`). Two files renamed to `.jpg` (same bytes; JFIF is JPEG). | branch |
| F-24 | Medium, **handled** | Static imports return objects in Next. `assetSrc()` keeps `<img>` working in both builds. | branch |
| F-25 | Medium, **fixed** | `Contact` called `useSearchParams` on every inner page. Now only `ContactFormFromUrl` calls it, inside Suspense. | branch |
| F-26 | Low | `/contact?service=` is linked but ignored | `LogisticsHubPage.jsx:272,442` |
| F-27 | Low | Documentation drift | `docs/architecture.md` |
| F-28 | High (process) | No CI build or E2E gate | `.github/workflows/sonarqube.yml` |
| F-29 | Medium | CMS E2E mocks intercept browser requests only | `playwright.cms.config.js` |
| F-30–F-32 | Strength | `lang` passed as a prop; pure `RichText`; most router imports are `Link` only | §4, §10 |
| F-33 | Medium (owner) | `https://hmv-landingpage.vercel.app/` serves the production build publicly (200, no noindex), duplicating `www` | live 2026-11-07, same bundle hash as `www` |
| F-34 | Medium | Next 16.4.5 with two root layouts: a segment `not-found.tsx` is served as a client-rendered error shell (`<html id="__next_error__">`) with a correct 404 and noindex. Unmatched URLs get a server-rendered 404 only via the **experimental** `global-not-found.js`. | branch probes; `app-render.js`; `not-found.md` |
| F-35 | Medium | Config redirects pass the query through ("any query values… will be passed through"), so `?lang` must be handled in the proxy | `redirects.md` |
| F-36 | Info | Vercel previews are behind Vercel Authentication and return `X-Robots-Tag: noindex`. That header is observed, not documented by Vercel, so it is not relied on. | live headers |
| F-37 | Low, **handled** | `next dev` writes a managed block into `AGENTS.md` by default. Set `agentRules: false`; the block was reverted. | `agentRules.md` |

## 9. Content integrity and GEO findings (D-12)

The migration does not change content. Server rendering makes every statement easy to extract, and AI systems tend to repeat the strongest claim they find. **HMV must decide each row.** No certification, customer, title or facility ownership is confirmed by this audit.

The possible outcomes are:

- **Confirm and keep**: HMV provides evidence; the content stays and the fact register records it.
- **Correct or limit**: rewrite to what can be shown.
- **Remove**: take it off the public site.

**Leaving a claim out of JSON-LD does not fix the visible text.** Each outcome is applied to the visible content in a content PR, and structured data then follows the corrected content.

| ID | Current public content (where) | What needs verifying, and by whom | Outcome options | Suggested (HMV decides) |
|---|---|---|---|---|
| C-01 | Four testimonials: "John D., Agri-produce importer (Germany)", "Sarah W., Supermarket chain (USA)", "Marc L., Fruit distributor (France)", "Emma K., Food manufacturer (Netherlands)", with a badge "Sample placeholder content" (`views/home/sections/PartnerCommunity.jsx:1-6,16`) | Whether real partners exist who consent in writing to being quoted (HMV management) | Confirm and keep with real, consented quotes / limit to an unattributed "partner feedback" section / **remove the section** | Remove until real, consented reviews exist. Badges are lost when text is quoted. Removing a section is a UI change (design owner). |
| C-02 | About: Nguyen Thanh Van "Founder & CEO", Ho Quang Minh "Co-founder", Truong Van Hieu "Co-founder", Dr. Le Phong Hai "Co-founder", with experience figures ("30 years", "PhD", "IATA/IMDG certified") (`data/about.js:100-140`, VI after line 250). JSON-LD, RFQ, Contact and `llms.txt`: Van Nguyen "General Manager" (VI "Tổng giám đốc"), Ho Quang Minh "Chairman", Hieu Truong "Managing Director" (`index.html:24`, `TradeRfq.jsx:9-13`, `Contact.jsx`, `llms.txt:23-25`) | Official titles from the business registration or charter; name order and spelling; whether "Founder & CEO" and "General Manager" are the same role; consent and evidence for the biographies (HMV management) | Confirm one title set and keep / **correct every surface to the confirmed set** and drop unverifiable figures / remove the biographies | Correct to one confirmed set everywhere. Until then, no `Person`, `employee` or `founder` markup. |
| C-03 | "certified Vietnamese agro-commodities… absolute reliability" (`about.js:13,56`); "Certified IATA & IMDG" (`about.js:89,139`); "photographic evidence from HMV Global facilities… 24/7 forklift cross-docking" (`PackagingLogisticsPage.jsx:72`); "verified JC Trans global network coverage" (`LogisticsHubPage.jsx:95`); "pre-shipment independent testing… zero MRL violations", "Real-time Monitoring" (`data/articles.js:24,67`); chat: "certified under GlobalGAP & strict EU/US MRLs residue compliance" (`SupportChatWidget.jsx:139-140`). Contradicted by `llms.txt:28` and the product-photo notes ("certification not verified"). | For each claim: the certificate (issuer, scope, holder, validity), the JC Trans membership record, facility ownership or lease, the test procedure and lab, the monitoring system (HMV management and operations) | Confirm and keep with holder and scope stated / **limit** (for example "we coordinate with GlobalGAP-certified growers when a buyer requires it") / remove | Limit to evidenced scope; remove anything that cannot be evidenced before cutover. Then align `llms.txt`. |
| C-04 | A second brand, "HMV Logistics" (`LogisticsHubPage.jsx:54-55,95`); domains `hmv-global.com` (site), `hmvglobal.com` (email), `hmvglobal.vn` (CMS preview label) | Whether "HMV Logistics" is a registered trading name or entity; which domains HMV owns, and which one is canonical (HMV management) | Confirm and keep as a documented `alternateName` / **correct to "HMV Global" (logistics services)** / remove | Correct, unless it is registered. Domains are documented as owned or not owned. |
| C-05 | "24/7 LIVE SUPPORT", "24/7 Priority Support Desk… monitor shipments", "+84 (0) 909 123 456 (Hotline/WhatsApp)", `support@hmvglobal.com` (`Contact.jsx:113-138`); chat: "standby 24/7… Hotline (+84) 902 468 910… We respond promptly", "Phản hồi trong 15 phút" (`SupportChatWidget.jsx:124,169-170`); chat replies are simulated without disclosure | Real number(s), whether the mailbox exists and is monitored, actual hours, any response-time commitment (HMV operations) | Confirm and keep one verified channel set / **correct** (real hours, no response-time promise, "automated assistant" disclosure) / remove the phone numbers | Correct. No `telephone` in markup until verified. |
| C-06 | "Reliable 24–35 day ocean routes", "guaranteed delivery" (`SupplyChainPillars.jsx:57,62`, VI equivalents), while the homepage map labels the same times "SAMPLE DATA… not a confirmed schedule" (`LivingLogistics.jsx:180-184`) and the trade copy says timing is "established in the commercial proposal" | Whether HMV commits to transit times or guarantees (HMV commercial) | Confirm and keep with conditions / **correct** ("typical transit 24–35 days depending on route and carrier, confirmed per quotation"; drop "guaranteed") / remove | Correct |

The owners and the order of work are in the [roadmap](MIGRATION_ROADMAP.md) (D-12, content PRs).

## 10. Component migration assessment

| Category | Files | Lines | Notes |
|---|---:|---:|---|
| Shared without significant change (data, pure functions, primitives, static sections) | 16 | 1,285 | `assetSrc` in two data modules |
| Shared after a small adaptation (`Link` from the adapter, data passed as props, no head tags) | 24 | 1,537 | `DetailLayout` without `PageMeta`; unported Vite pages import `ViteDetailLayout` (one line) |
| Client components (`'use client'` plus adapter imports; body unchanged) | 13 | 3,250 | |
| Replaced by Next adapters; kept as Vite adapters until cleanup | 13 | 557 | `App`, `SiteLayout`, `LanguageContext`, `LangQueryBootstrap`, `PageMeta`, the hooks, `ArticlePage`, `NotFoundPage` |
| **Reused (shared plus client)** | **53** | **6,072 (92%)** | CSS reused 100%. Vite CSS output on the branch is byte-identical to `main`. |

Implemented on the branch (home, about, contact, 404 in EN and VI):

- 8 view and adapter files.
- The adapter interface (2 files).
- The URL contract and its tests.
- `proxy.ts`, `next.config.ts`, 10 thin route and layout files, `global-not-found.tsx`, `src/next/{seo.ts, Document.tsx}`.
- The Vite rollback-compatibility mapping.
- Test suites.

Dependencies:

| | Packages |
|---|---|
| Kept | everything current |
| Added | `next@16.4.5` (exact), `@tailwindcss/postcss@4.3.3`, `typescript@5`, `@types/node@24` |
| Removed at cleanup | `react-router-dom`, `react-helmet-async`, `@tailwindcss/vite`, `eslint-plugin-react-refresh` |

Remaining effort: about **22.5 engineer-days** after the foundation ([roadmap §4](MIGRATION_ROADMAP.md#4-pr-sequence)). Complexity: medium.

## 11. Main risks

| # | Risk | Mitigation |
|---|---|---|
| R-1 | SEO regression at cutover (redirects, canonicals, `hreflang`) | Matrix-driven tests on preview, then production; one cutover; the rollback contract |
| R-2 | Unreviewed claims become more extractable (§9) | D-12 decisions and content PRs before cutover |
| R-3 | Visual drift | Same CSS and order; Vite CSS byte-identical; screenshot baselines (CI PR) |
| R-4 | Wrong status codes from streaming or 404 handling | No `loading.tsx` above `notFound()` or redirects; `dynamicParams = false` where slugs are known; global 404 tested (F-34) |
| R-5 | `globalNotFound` is experimental | Pinned version; fallback documented (architecture §10); re-test on every Next upgrade |
| R-6 | CMS availability, freshness, takedown, load | Build fails loudly; stale-on-error; takedown runbook and endpoint; rate limit on the CMS side (architecture §9) |
| R-7 | A test domain gets indexed | Fail-safe noindex unless `SITE_INDEXABLE=true`, platform header, Vercel Authentication (All Deployments) before the first deployment |
| R-8 | A rollback breaks new Vietnamese URLs or cached 308s | The Vite rollback target includes the compatibility mapping (tested); rehearsal (roadmap §8) |
| R-9 | The Vite build regresses while code is shared | Every shared change is checked against the baseline suites (architecture §12); the CI gate PR makes that automatic |

## 12. Final decision recommendation

1. **Migrate?** Yes, in place, as above.
2. **Why?**
   - Server-rendered, per-locale, correctly-status-coded pages fix F-01 to F-05 at the root.
   - `next/image` and the metadata files fix F-08 and F-19.
   - Server-side CMS fetching removes the browser and CORS constraints and reduces normal load; rate limiting stays a CMS and infra task.
   - The CMS admin already uses Next 16.4.
3. **Reused:** about 92% of JS/JSX and all of the CSS, through shared presentational and pure modules.
4. **Rewritten:** the SPA entry, routing, language context, head management, fetch hooks, article shell and 404 (557 lines). These stay as Vite adapters until cleanup.
5. **Biggest risks:** URL regressions, content claims, status-code handling, CMS operations, test-domain indexing, rollback (§11).
6. **Safest sequence:**
   1. The foundation (done on the branch).
   2. A CI gate.
   3. Each remaining page in both locales.
   4. Products and articles.
   5. The CMS layer with the flag off.
   6. SEO surfaces.
   7. Images.
   8. Rollback readiness, with the compatibility build in production on Vite.
   9. Cutover readiness on the preview.
   10. Cutover.
   11. Cleanup.
   12. Enabling the CMS separately.

   See the [roadmap](MIGRATION_ROADMAP.md).
7. **React Router Framework Mode instead?** Credible but not compelling. It saves about 1–2 days of router-import changes. It lacks ISR and tags, image optimization, and sitemap and metadata conventions, and it would mean running a second meta-framework next to the CMS admin.
