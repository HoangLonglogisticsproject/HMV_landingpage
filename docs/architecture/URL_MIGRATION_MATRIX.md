# URL Migration Matrix: Vite SPA to Next.js

| | |
|---|---|
| Status | Revision 3, 2026-11-08. Implemented on `feat/nextjs-foundation`, CMS rows behind `CMS_CONTENT`. Rows marked **✓** are verified by tests. |
| Today's behavior | `vercel.json`, `src/app/App.jsx`, and live checks of `https://www.hmv-global.com` (2026-11-06) |
| Implementation | `src/i18n/routes.js` (shared contract), `proxy.ts`, `next.config.ts` `redirects()`, Next's built-in trailing-slash redirect; data-dependent article redirects in route code (`src/next/article.tsx`); `app/tin-tuc/[slug]/route.ts` (M-56) |
| Tests | `src/i18n/routes.test.js` (unit: every static rule, idempotence, switch links) `tests/next/next.spec.js` (HTTP: exact hop chains with `maxRedirects: 0`, Location host) and `tests/next-cms/cms.spec.js` (CMS rows, against a mock CMS) |
| Related | [SEO spec](SEO_I18N_GEO_SPEC.md) §1–§4 · [Architecture](NEXTJS_TARGET_ARCHITECTURE.md) §4.3 · [Roadmap](MIGRATION_ROADMAP.md) |

## 1. Contract

- `B` = `https://www.hmv-global.com`. Canonicals are absolute, with no query, no fragment and no trailing slash. The root is `B`: Next.js writes it as `B` in head tags and as `B/` in the sitemap, the same URL (RFC 3986).
- **English URLs do not change.** Vietnamese lives under `/vi` with English segments for site pages and Vietnamese segments for products (`san-pham`) and articles (`tin-tuc`), as decided in D-02.
- **`?lang=` is legacy.** Wherever it appears it (a) decides the target language, overriding the path, (b) is removed, and (c) every other parameter (`product`, `utm_*`, `gclid`…) is kept. Invalid values are removed and the path's language is used.
- **Hops as implemented.** Next removes a trailing slash first (one hop). The proxy then resolves every other statically known legacy form in **one** hop. An article slug that belongs to the other language, when the pair is not known statically (CMS), adds **one** hop in the article route. Maximum: 3 hops, and only for combinations of a trailing slash, a legacy form and a CMS slug from the other language.
- Hop chains are asserted exactly (§3). Each response's Location must stay on the tested host (relative `Location` headers on `next start`).
- **Indexed-URL inventory gate.** Before cutover, the owner exports the URLs Google Search Console and Bing know for the site. Every exported URL must match a row or rule here.

## 2. Matrix

Today, every extension-less path returns **200** with the same SPA shell (`vercel.json:3-8`); locale prefixes redirect only in the browser.

### 2.1 Site pages

| ID | Existing URL | Proposed URL | Locale | Redirect | Canonical | Risk | ✓ |
|---|---|---|---|---|---|---|---|
| M-01 | `/` | `/` | en | No | `B` | L | ✓ |
| M-02…M-10 | `/about`, `/supply-chain`, `/trade-solutions`, `/activities`, `/contact`, `/insights`, `/regulations`, `/logistics`, `/packaging-logistics` | unchanged | en | No | `B/<path>` | L | ✓ |
| M-11 | `/vi` (today: browser redirect to `/`) | `/vi` | vi | No | `B/vi` | M (meaning changes on purpose) | ✓ |
| M-12…M-20 | `/vi/<page>` (today: browser redirect to `/<page>`) | `/vi/<page>`, same segment | vi | No | `B/vi/<page>` | M | ✓ |

`/regulations` is added to the sitemap (missing today, audit F-08).

### 2.2 Products

| ID | Existing URL | Proposed URL | Locale | Redirect | Canonical | Risk | ✓ |
|---|---|---|---|---|---|---|---|
| M-21…M-26 | `/products/{passion-fruit, bananas, dragon-fruit, spices, nuts, tapioca-starch}` | unchanged (`nuts` stays) | en | No | itself | L | ✓ |
| M-27…M-32 | new | `/vi/san-pham/{chanh-day, chuoi-cavendish, thanh-long, gia-vi, hat-dieu, tinh-bot-san}` | vi | No | itself | L | ✓ |
| M-33 | `/vi/products/{id}` | `/vi/san-pham/{vi-slug}` | vi | 308, proxy, 1 hop | target | M | ✓ (Location) |
| M-34 | `/products/{unknown}` (today 200, soft 404) | none | n/a | **404** (global 404, server-rendered) | none | M | ✓ |
| M-35 | `/vi/san-pham/{unknown}` | none | n/a | **404** | none | L | ✓ |
| M-36 | `/products`, `/vi/san-pham`, `/vi/products` | `/trade-solutions`, `/vi/trade-solutions` | en/vi | 308, 1 hop (config redirect or proxy) | target | L | ✓ |

### 2.3 Articles: the three bundled articles

| ID | Existing URL | Proposed URL | Locale | Redirect | Canonical | Risk | ✓ |
|---|---|---|---|---|---|---|---|
| M-37…M-39 | `/blog/{exporting-passion-fruit-eu, optimizing-tropical-logistics, circular-agriculture}` | unchanged | en | No | itself | L | ✓ |
| M-40…M-42 | new | `/vi/tin-tuc/{xuat-khau-chanh-day-eu, toi-uu-hoa-logistics, nong-nghiep-khep-kin}` | vi | No | itself | L | ✓ |
| M-43…M-45 | `/blog/{vi-slug}` (today: browser redirect to the English slug) | `/blog/{en-slug}` | en | 308, 1 hop, article route (pairs known; prerendered) | target | L | ✓ |
| M-46 | `/vi/blog/{slug}` | `/vi/tin-tuc/{vi-slug}`, directly to the Vietnamese slug when the pair is known | vi | 308, proxy, 1 hop | target | M | ✓ |
| M-47 | `/en/blog/{slug}` | `/blog/{en-slug}` (pair known) | en | 308, proxy, 1 hop | target | L | unit ✓ |
| M-48 | `/blog/{unknown}` (today: browser redirect to `/insights`) | none | n/a | **404** (D-09) with noindex; since PR-06 the body is Next.js's default 404, client-rendered (D-17) | none | M | ✓ |
| M-49 | `/blog`, `/vi/tin-tuc`, `/vi/blog` | `/insights`, `/vi/insights` | en/vi | 308, 1 hop | target | L | ✓ |

If the CMS goes live, the three articles must exist in the CMS with exactly these per-locale slugs (CMS PR gate).

### 2.4 Articles: CMS patterns (after the CMS is enabled; the route resolves through `alternates`, `resolveArticle()` in `src/features/articles/api.js`)

M-50 to M-57 are verified against the mock CMS (`tests/next-cms/`). A slug that the CMS cannot have (its own rule: lowercase letters, digits, single hyphens, ≤ 200 characters) is a 404 without any CMS request.

| ID | Request | Result | Redirect | Canonical |
|---|---|---|---|---|
| M-50 | `/blog/{en-slug}` | English article | No | itself |
| M-51 | `/vi/tin-tuc/{vi-slug}` | Vietnamese article | No | itself |
| M-52 | `/blog/{vi-slug}`, English alternate exists | `/blog/{en-alt}` | 308, route, +1 hop | target |
| M-53 | `/blog/{vi-slug}`, no English version | "not available in English" page with a link to the Vietnamese article | 200 **noindex** | none |
| M-54 | `/vi/tin-tuc/{en-slug}`, Vietnamese alternate exists | `/vi/tin-tuc/{vi-alt}` | 308, route, +1 hop | target |
| M-55 | `/vi/tin-tuc/{en-slug}`, no Vietnamese version | "not available in Vietnamese" page with a link to the English article | 200 **noindex** | none |
| M-56 | `/tin-tuc/{slug}` (the CMS admin's link format) | `/vi/tin-tuc/{slug}` if the slug is Vietnamese, else `/blog/{slug}` if English, else 404 | 308, route handler | target |
| M-57 | Unknown, draft, unapproved or archived slug | none | **404** (body rendered on the client, architecture §10) | none |

### 2.5 Query parameters

| ID | Request | Result | Hops | ✓ |
|---|---|---|---|---|
| M-58 | `/{en-path}?lang=vi` | Vietnamese equivalent, `lang` removed | 1 (proxy) | ✓ `/about`, `/`, `/products/nuts`, `/blog/…` |
| M-59 | `/vi/{path}?lang=en` | English equivalent, `lang` removed | 1 | ✓ |
| M-60 | `?lang=` equal to the path's language, or invalid | same page, `lang` removed | 1 | unit ✓ |
| M-61 | `/contact?product=Passion%20fruit&utm_source=li&lang=vi` | `/vi/contact?product=Passion+fruit&utm_source=li` (the form preselects; space encoded as `+`) | 1 | ✓ HTTP and browser |
| M-62 | `/contact?service=…` | unchanged, ignored as today (D-10) | 0 | n/a |
| M-63 | `utm_*`, `gclid`, `fbclid` on any URL | kept; the canonical never has a query (it is built from the path) | 0 | ✓ (kept across redirect and switch) |

### 2.6 Combinations (`/en`, trailing slash, `?lang`, cross-language slugs)

| ID | Request | Chain as implemented | Hops | ✓ |
|---|---|---|---|---|
| M-64 | `/en` | `/` | 1 | ✓ |
| M-65 | `/en/about` | `/about` | 1 | ✓ |
| M-66 | `/about/` | `/about` | 1 (built-in) | ✓ |
| M-67 | `/vi/` | `/vi` | 1 (built-in) | ✓ |
| M-68 | `/en/about/` | `/en/about`, then `/about` | 2 | ✓ |
| M-69 | `/en/about?lang=vi` | `/vi/about` | 1 | unit ✓ |
| M-70 | `/en/about/?lang=vi` | `/en/about?lang=vi`, then `/vi/about` | 2 | ✓ |
| M-71 | `/about/?lang=vi` | `/about?lang=vi`, then `/vi/about` | 2 | ✓ |
| M-72 | `/products?lang=vi` | `/vi/trade-solutions` (the config redirect is skipped because of `missing: lang`) | **1** | ✓ (was 2 hops and wrong target in revision 1) |
| M-73 | `/products/?lang=vi` | `/products?lang=vi`, then `/vi/trade-solutions` | 2 | ✓ |
| M-74 | `/en/products/nuts?lang=vi` | `/vi/san-pham/hat-dieu` | 1 | unit ✓ |
| M-75 | `/vi/products/nuts?utm_source=x` | `/vi/san-pham/hat-dieu?utm_source=x` | 1 | unit ✓ |
| M-76 | `/en/blog/xuat-khau-chanh-day-eu` (Vietnamese slug under `/en`) | `/blog/exporting-passion-fruit-eu` (pair known) | 1 | unit ✓ |
| M-77 | `/vi/blog/exporting-passion-fruit-eu` (English slug under the legacy `/vi/blog`) | `/vi/tin-tuc/xuat-khau-chanh-day-eu` | 1 | ✓ |
| M-78 | `/blog/exporting-passion-fruit-eu?lang=vi` | `/vi/tin-tuc/xuat-khau-chanh-day-eu` | 1 | ✓ |
| M-79 | `/vi/blog/{cms-en-slug}` | `/vi/tin-tuc/{cms-en-slug}`, then route to `/vi/tin-tuc/{vi-alt}` | 2 | CMS PR |
| M-80 | `/en/blog/{cms-vi-slug}/?lang=en` | built-in, then proxy to `/blog/{cms-vi-slug}`, then route to `/blog/{en-alt}` | 3 (the documented maximum) | CMS PR |
| M-81 | `/index.html` (today: 200, a copy of the home page) | `/` | 1 | ✓ |

### 2.7 Other URLs

| ID | Request | Result | Risk |
|---|---|---|---|
| M-82 | `/{unknown}`, `/vi/{unknown}`, `/about/extra` (today 200) | **404**: the server-rendered global 404 (English, chrome-less, as the Vite 404 today) | M (intended) ✓ |
| M-83 | Mixed case such as `/About` (today 200; React Router matches case-insensitively) | 404 (Next.js matches case-sensitively). Add redirects only if the Search Console export lists such URLs. | L |
| M-84 | `/api/v1/public/*` (today 200 `text/html` from the SPA fallback) | 404 | L |
| M-85 | `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/og-image.jpg`, `/favicon.png` | Same paths. Until cutover, Next serves the shared `public/` files; generated `robots`/`sitemap` replace them in the SEO PR. | L / M (sitemap content) |
| M-86 | `/assets/{name}-{hash}.{ext}` (Vite build output) | 404 after cutover (hashes change on every build anyway) | L |

### 2.8 Hash anchors

Identical in both languages; the language switch keeps them (✓ browser test `/vi#initiate-trade` → `/#initiate-trade`).

| Page | Anchors |
|---|---|
| `/`, `/vi` | `#value-journey`, `#featured-products`, `#initiate-trade` |
| `/supply-chain` | `#commodities`, `#wind-energy`, `#logistics-capacity`, `#supply`, `#demand`, `#origin`, `#quality`, `#processing`, `#trade`, `#market` |
| `/trade-solutions` | `#products` |
| `/logistics` | `#dangerous-goods`, `#dg-air-sea`, `#special-cargoes`, `#general-cargoes`, `#factory-tour`, `#cross-border`, `#local-agency`, `#oversea-agency` |

## 3. Language-switch links (not redirects)

The switcher and the chat's language action link **directly** to the target URL. They never rely on a redirect when the target is known.

| On page | "English" goes to | "Tiếng Việt" goes to | ✓ |
|---|---|---|---|
| `/vi/about` (reached from `/about?lang=vi`) | `/about` (`lang` never carried) | n/a | ✓ browser: stays English after reload |
| `/vi/contact?product=Passion+fruit&utm_source=li` | `/contact?product=Passion+fruit&utm_source=li` | n/a | ✓ browser: product still preselected |
| `/vi#initiate-trade` | `/#initiate-trade` | n/a | ✓ browser |
| `/vi/san-pham/chanh-day` | `/products/passion-fruit` | n/a | unit ✓ |
| `/blog/exporting-passion-fruit-eu` | n/a | `/vi/tin-tuc/xuat-khau-chanh-day-eu` (known pair, direct) | unit ✓ |
| `/blog/{cms-slug}` | n/a | `/vi/tin-tuc/{cms-slug}`; the route answers one 308 to the Vietnamese alternate (M-54). A direct link would need the alternates passed to the switcher (architecture §16.5, R4-9). | ✓ (the 308) |

## 4. Implementation

### 4.1 `next.config.ts`, exact collection URLs without `?lang`

```ts
// /products, /vi/san-pham, /blog, /vi/tin-tuc: derived from the route contract, not listed by hand
const INDEX_URLS = Object.keys(INDEX_ALIASES).flatMap(path => LOCALES.map(locale => localizePath(path, locale)));
redirects: () => INDEX_URLS.map(source => ({
  source, destination: canonicalUrl(source), permanent: true,
  missing: [{ type: 'query', key: 'lang' }],          // with ?lang the proxy resolves it in one hop
}))
```

A config redirect cannot drop query parameters ("any query values provided in the request will be passed through", Next 16.4.5 `redirects.md`). That is why `?lang` never goes through config redirects.

### 4.2 `proxy.ts`, legacy forms only

```ts
export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const target = legacyRedirect(pathname, search);    // src/i18n/routes.js
  return target ? NextResponse.redirect(new URL(target, request.url), 308) : NextResponse.next();
}
export const config = { matcher: [
  { source: '/:path*', has: [{ type: 'query', key: 'lang' }] },
  '/en', '/en/:path*', '/index.html', '/vi/products/:path*', '/vi/blog/:path*',
] };
```

`legacyRedirect` returns `canonicalUrl` when it differs from the request. `canonicalUrl` is idempotent: a canonical URL never redirects again, which the unit tests assert for every row.

### 4.3 Response headers observed (`next start`)

| Response | `X-Robots-Tag` | `Location` |
|---|---|---|
| 200 page, 404 | `noindex, nofollow` (until `SITE_INDEXABLE=true`) | n/a |
| Proxy 308 | `noindex, nofollow` | relative |
| Config 308, trailing-slash 308 | none (a redirect has no indexable body) | relative |

None of the 308s sends `Cache-Control`. Browsers keep permanent redirects, which matters for rollback ([roadmap §8](MIGRATION_ROADMAP.md#8-rollback-contract)).

## 5. CMS-generated and in-content links

- **The CMS admin's public link `/tin-tuc/<slug>`** is resolved by M-56 (CMS PR). The `hmvglobal.vn` domain shown in the CMS preview is outside this site (audit C-04).
- **Links inside rich text** render as written. Every format in this matrix resolves. A link to `/about` inside a Vietnamese article goes to English. Editorial guideline: use `/vi/…` links in Vietnamese content. Optional later: run internal hrefs through `localizePath` in `RichText`.
- **No CMS change is needed for any row.**

## 6. Verification

1. **Unit, on every commit:** the static rules, the idempotence of every target, and switch-link construction (`src/i18n/routes.test.js`).
2. **Preview acceptance:** `tests/next/next.spec.js` against `next start` locally and against the Next preview deployment (`PLAYWRIGHT_BASE_URL`); `tests/next-cms/cms.spec.js` for the CMS rows, locally and in CI. The config refuses production hosts. Each hop asserts status 308, the exact next URL and the same host. Rows still marked "PR" join the suite in the PR that creates their target pages.
3. **Production acceptance, after cutover only:** a separate read-only suite against `B` (roadmap §7.2). It asserts the same chains, no noindex, and the Next.js build marker.
4. **Completeness:** before cutover, the Search Console and Bing exports plus a crawl of today's sitemap and internal links must match the matrix.
