# SEO, i18n and GEO Specification: HMV Global public website

| | |
|---|---|
| Status | Revision 4, 2026-11-08. Implemented on `feat/nextjs-foundation` for every page: §2–§5, §6 (behind `CMS_CONTENT`), §7.1–§7.3, §7.5, §7.6 and §8 (`Organization`, `WebSite`, `Article`). Still specification: article Open Graph (§7.4: `og:type=article`, cover image) and sitemap `lastmod`. `llms.txt` moves to the D-12 content PRs (§9). |
| Related | [Audit](NEXTJS_MIGRATION_AUDIT.md) · [Architecture](NEXTJS_TARGET_ARCHITECTURE.md) · [URL matrix](URL_MIGRATION_MATRIX.md) · [Roadmap](MIGRATION_ROADMAP.md) |

Base URL: `https://www.hmv-global.com` (`baseUrl`, `src/data/hmv.js`). The apex domain already 308s to `www`.

**Change one SEO variable at a time.** Cutover changes rendering, Vietnamese URLs, status codes and metadata plumbing. Titles, descriptions and copy stay as they are, except the doubled brand suffix (D-06). Content corrections from the D-12 review ship as separate content PRs.

## 1. URL strategy (decision D-02)

| | English (default and `x-default`) | Vietnamese |
|---|---|---|
| Home | `/` | `/vi` (`/vi/` 308s to `/vi`) |
| Site pages | `/about`, `/supply-chain`, `/trade-solutions`, `/activities`, `/contact`, `/insights`, `/regulations`, `/logistics`, `/packaging-logistics` (unchanged) | the same segment under `/vi` |
| Product detail | `/products/<id>` (unchanged) | `/vi/san-pham/<vi-slug>` |
| Article detail | `/blog/<en-slug>` (unchanged) | `/vi/tin-tuc/<vi-slug>` (D-02b) |

The rule: site pages keep the English segment, so legacy `/vi/*` paths start serving Vietnamese. Products and articles use Vietnamese segments and slugs, because those URLs carry the words people search for. `tin-tuc` matches the CMS admin's link format.

Options considered and rejected:

| Option | Reason |
|---|---|
| Mirror English segments everywhere | Ignores the localized product URL in the brief |
| Fully Vietnamese segments | Every legacy `/vi/*` would need a redirect, for a small gain |
| Locale-free (today) | Vietnamese cannot be indexed |
| Subdomain or ccTLD | DNS is out of scope; splits authority |

Vietnamese product slugs (D-03), transliterated from the existing names in `data/hmv.js`: `chanh-day`, `chuoi-cavendish`, `thanh-long`, `gia-vi`, `hat-dieu`, `tinh-bot-san`. Vietnamese article slugs already exist (`data/articles.js` `slug.vi`, or the CMS).

## 2. The URL contract (`src/i18n/routes.js`, implemented)

One pure module, shared by the Vite app (rollback compatibility), Next pages, `proxy.ts`, `next.config.ts` and the tests.

| Function | Meaning |
|---|---|
| `localizePath(path, locale)` | English key path (`/about`, `/products/<id>`, `/blog/<slug>`) to the URL in `locale`. Bundled article slugs map straight to their alternate. Unknown (CMS) slugs keep their slug. |
| `delocalizePath(pathname)` | Any URL, including legacy forms (`/index.html`, `/en/…`, `/vi/products/…`, `/vi/blog/…`), to `{ path, locale }` |
| `canonicalUrl(pathname, search)` | Final URL of a request: legacy forms and collection aliases resolved, the language from `?lang=` if valid (otherwise from the path), `lang` removed, other parameters kept. Idempotent. |
| `legacyRedirect(pathname, search)` | `canonicalUrl` when it differs from the request, else `null`. This is what `proxy.ts` uses. |
| `switchHref(pathname, search, locale)` | The same page in `locale`: `lang` removed, `product`, UTM and the like kept. The caller appends `#hash`. |
| `PRODUCT_SLUG_VI`, `INDEX_ALIASES`, `localeOf` | Data and helpers |

Internal links keep the English key path (`<Link to="/about">`). The Next `Link` adapter localizes it for the page's locale, so Vietnamese pages link only to Vietnamese URLs. A test asserts this on `/vi`. `mailto:`, `tel:` and external links pass through.

Tests: `src/i18n/routes.test.js` covers round trips for every page and product, every static legacy rule, idempotence of every target, and switch links.

## 3. Language switcher behavior

| Rule | Implementation |
|---|---|
| Real link to the same page in the other language | `useLanguageSwitch().hrefFor(code)` gives a server-rendered href (path only); the item is `<a href hreflang lang>` inside the existing Radix item. The UI is unchanged. |
| **The legacy `lang` never survives** | `switchHref` removes it. Regression: `/about?lang=vi` → (308) `/vi/about` → English → `/about`, still English after reload. Tested in the browser on Next and on Vite. |
| `product`, UTM and `#hash` survive | On click, `select(code)` builds the URL from `location.search` (minus `lang`) and `location.hash`. Tested: `/vi/contact?product=…&utm_source=…` → English keeps both and the form preselection; `/vi#initiate-trade` → `/#initiate-trade`. |
| Direct alternate when known | Products and bundled articles map statically. CMS articles: the server href uses the same slug (one 308); after hydration the page's `alternates` replace it with the direct URL (CMS PR). |
| Full page load | The two root layouts differ in `<html lang>`, so the chat conversation resets on a switch (D-07). |
| No persistence | No cookie, no `localStorage`; the URL is the language. |
| Crawlers | Radix renders the dropdown only when it is open, so the switcher links are not in the server HTML. Crawlers rely on the head `<link rel="alternate" hreflang>` set, which is tested on every page. |
| Chat language action | The same `select()` |
| Vite (until cutover) | `useLanguageSwitch()` keeps today's behavior: `setLang`, URL unchanged. The same regression cases are tested on Vite (`tests/i18n.spec.js`). |

## 4. Language detection policy

- No automatic redirect by IP, `Accept-Language`, cookie or storage, for users or crawlers. `/` is always English and `/vi` always Vietnamese.
- `localStorage['hmv_lang']` is not read by the Next build.
- `?lang=xx` is legacy. It is removed with one 308; a valid value picks the target language, an invalid one is just dropped ([matrix §2.5](URL_MIGRATION_MATRIX.md#25-query-parameters)).
- A later, non-blocking "Tiếng Việt available" hint would need design approval. It is out of scope.

## 5. Missing translations and the 404

| Content state | URL in that locale | Indexing | `hreflang` | Sitemap |
|---|---|---|---|---|
| Live in both | 200 | index | EN, VI, `x-default` = EN | both |
| Live in one locale only | the other locale's URL: 200 with today's "not available in this language" message and a link | noindex, no canonical, no `hreflang` | the live one, self only | the live one only |
| No route (any unknown URL) | **404** global page: server-rendered, English, chrome-less, identical to the Vite 404 | noindex (header and meta) | none | none |
| Unknown or archived slug in an existing route (`notFound()`) | **404** status and noindex. The body is rendered on the client in Next 16.4.5 with two root layouts (architecture §10). Prefer `dynamicParams = false` wherever slugs are known. | noindex | none | none |
| CMS error | the last good ISR page; an uncached URL gets 5xx | never noindex because of an outage | unchanged | unchanged |

Never show the other locale's content as if it were this locale, and never machine-translate (existing rule). A localized 404 (a Vietnamese text for `/vi/*`) is a UI addition and needs design approval (D-17).

## 6. CMS locale integration

| Topic | Rule |
|---|---|
| Locales | `en` and `vi` map 1:1 to CMS locales. Always send `locale` (the CMS defaults to `vi`). |
| Pages | `alternates[]` decides which `hreflang` entries exist. `seo.title` and `seo.description` feed metadata. Editors must not add "\| HMV Global"; the title template adds it. |
| Articles | Per-locale slugs. Detail `alternates[]` drives `hreflang` and the switcher. The sitemap pairs list entries by the shared article `id` (audit F-16). |
| Dates | `publishedAt` (article-level first publication) for `datePublished`; `updatedAt` for `dateModified` and `lastmod`. |
| Freshness | See architecture §9. 300 s is a revalidation interval, not an SLA. |

## 7. Technical SEO

### 7.1 Titles and descriptions

These come from `src/views/meta.js` (ported pages) or the page module, with the template `%s | HMV Global`. Values are the same as today, and both builds emit identical values for ported pages.

| Route | EN | VI | Description |
|---|---|---|---|
| `/` | Agricultural Supply Chain & Global Trading | Chuỗi cung ứng nông nghiệp & thương mại quốc tế | `copy.storyText` |
| about | About HMV (or CMS `seo.title`) | Về HMV | `about.hero.lead` (or CMS) |
| contact | Partner with us | Kết nối hợp tác | `copy.contactText` |
| supply-chain / trade-solutions | `copy.supply` / `copy.trade` | same | `copy.chainText` ⚠ duplicated (F-07; content backlog) |
| logistics / packaging-logistics | The page title **without** the embedded suffix (D-06) | same | inline |
| products, articles, insights, regulations, activities | as today | as today | as today |
| 404 | Page not found | (same page) | "Return to HMV Global." |

### 7.2 Canonical

Absolute, `https://www.hmv-global.com`, no query, no fragment, no trailing slash. The root is `https://www.hmv-global.com`: Next.js normalizes it that way, and it is the same URL as `…/`. Canonical, `hreflang`, `og:url` and the sitemap come from one formatter (`absoluteUrl()` in `src/next/seo.ts`) and are the same strings, the root included. The sitemap is written by a route handler because Next.js's sitemap convention would rewrite the root as `…/`. Tests compare the strings exactly. The canonical is self-referencing on every indexable page and omitted on noindex pages. Tested on every ported page.

### 7.3 Hreflang

`en`, `vi` and `x-default` (= EN), language only. Emitted in the head (Next `alternates.languages`) and in the sitemap from the same contract. Reciprocal, self-including, only for live indexable versions. No `hreflang` when only one version exists. Tested on every ported page.

### 7.4 Open Graph and social

`og:title` and `twitter:title` are the full title, as Vite does today. `og:url` is the canonical. `og:locale` is `en_US`/`vi_VN` with `og:locale:alternate`. `og:image` is `/og-image.jpg` (1200×630) or the article cover. `twitter:card` is `summary_large_image`. Articles also get `og:type=article` with the published and modified times. All of this is server-rendered, which fixes link previews (audit F-01).

### 7.5 XML sitemap (implemented)

`app/sitemap.xml/route.ts`: every indexable page in every live locale (38 URLs in bundled mode), with `xhtml:link` alternates built by the same function as the head `hreflang` (`alternateUrls`), so both list the same set; none for a single-locale article. Articles come from the content loader, so unpublished and blocked slugs leave it. It excludes noindex states, redirects, 404s and query variants. `lastmod` (CMS `updatedAt`) is not emitted yet (SEO PR). Caching: prerendered at build; static in bundled mode, ISR with the CMS on, refreshed before responding after a revalidation call (architecture §9.4).

**Coexistence:** Next.js generates `/sitemap.xml` and `/robots.txt`, so the same paths cannot stay in `public/`. Vite's two files moved to `src/app/`; a small Vite plugin emits them unchanged in the build and serves them in `vite` (dev). A Vite E2E test checks that the built site serves them unchanged.

### 7.6 Robots and noindex

| Environment | robots.txt | Indexing control |
|---|---|---|
| Production (after cutover) | `Allow: /` plus `Sitemap:` | indexable (`SITE_INDEXABLE=true`, production environment only) |
| Every preview or test domain | **Not used as the control.** `Disallow` stops crawling, not indexing, and hides the noindex from crawlers. | `X-Robots-Tag: noindex, nofollow` plus `<meta name="robots" content="noindex, nofollow">` (app fail-safe), the platform header from `deploy/vercel.next.json`, and Vercel Authentication (architecture §15.2). Not dependent on `VERCEL_ENV`. |

Implemented in `app/robots.ts`: `User-Agent: *`, `Allow: /`, `Sitemap: https://www.hmv-global.com/sitemap.xml`, the same in every environment. Vite keeps its unchanged `robots.txt`.

AI crawler policy (D-15): allow all, as today.

### 7.7 HTTP status codes

| Case | Status |
|---|---|
| Indexable page; "not available in this language" | 200 (the latter noindex) |
| Legacy, alias, trailing slash, `?lang`, other-locale slug | 308 |
| No route; unknown or archived slug | 404 |
| CMS outage on an uncached URL | 5xx |

Every row in the URL matrix is asserted with `maxRedirects: 0`.

### 7.8 Indexability, images, internal links

- All primary content is in the server HTML, including client components; tested for every home section.
- `<html lang>` is set per locale on the server.
- Existing bilingual alt text and photo-provenance captions are kept.
- Breadcrumb markup waits for visible breadcrumbs (design approval).
- Footer links and page grids are the crawl paths; nav dropdowns render only when open.

## 8. Structured data

| Type | Decision | Rule |
|---|---|---|
| `Organization` (on `/` and `/vi`) | Yes, implemented | Only the facts in the register below. `employee`, `founder`, `telephone`, `email`, `address`, certifications, facilities and testimonials wait for the D-12 outcome. |
| `WebSite` | Yes | `name`, `url`, `inLanguage`, `publisher`. No `SearchAction`. |
| `Article` | Yes, indexable articles only | `author`: the CMS `authorName` exactly, as `{ "@type": "Person", "name" }`, with no role, title or affiliation (`authorRole` is not used); otherwise the organization node. Never a person inferred from the site (leadership, team). Tested in unit, bundled and CMS suites |
| `BreadcrumbList` | Deferred | Together with visible breadcrumbs |
| `Product` | No | Quotation briefs with no offers; the markup would overstate the page |
| `Review`, `AggregateRating` | Never | The only "reviews" are placeholders (C-01) |
| `FAQPage`, `LocalBusiness`, `WebPage` | No | No matching content or value |
| `Service` | Optional, later | Only with wording visible on the page |

Fact register for structured data (`src/views/meta.js`; a unit test rejects the unverified values):

| Fact | Value | In JSON-LD | Basis |
|---|---|---|---|
| Legal name | HMV Global Co., LTD | Yes | Footer copyright; not part of C-01 to C-06 |
| Brand | HMV Global | Yes (`alternateName`, `WebSite.name`) | Site title on every page |
| Website | `https://www.hmv-global.com` | Yes | The site itself |
| Logo | `/favicon.png` | Yes | The site's own asset |
| People and titles | Chairman, Managing Director, General Manager, co-founders | No | C-02 |
| Telephone, 24/7 desk, support mailbox | +84 numbers, `support@…` | No | C-05 |
| Email domain | `hmvglobal.com` | No | C-04 (which domains HMV owns) |
| "HMV Logistics" as a second name | | No | C-04 |
| Certifications, facilities, guarantees, testimonials | | No | C-03, C-06, C-01 |
| Postal address | Floor 5, 240 Nguyen Dinh Chinh St. | No, until HMV confirms it | Not a D-12 row, but not confirmed either |

The Vite site's `index.html` JSON-LD still contains several of the excluded items; it is production content and changes only through the D-12 content PRs. This is a risk on the live Vite site today, not only at cutover (roadmap D-12).

**Leaving a claim out of JSON-LD does not fix the visible page.** If a visible statement is wrong or unverified, the D-12 outcome changes the visible text (content PR). Structured data must then match the corrected visible content.

## 9. GEO

The order of priority:

1. Server-rendered, consistent content. This migration delivers it.
2. Consistent entity facts. This needs the D-12 outcomes ([audit §9](NEXTJS_MIGRATION_AUDIT.md#9-content-integrity-and-geo-findings-d-12)).
3. Machine-readable summaries (`llms.txt`).

`llms.txt` does not replace the first two.

- **Entity:** legal name "HMV Global Co., LTD", brand "HMV Global", home `www.hmv-global.com`, entity page `/about`. A single fact register (one data module feeding JSON-LD, footer, contact, RFQ and `llms.txt`) is built only from facts HMV has confirmed.
- **Topic coverage:** each topic HMV wants understood already has a page and anchor: who HMV is, markets, the six-stage coordination model, sourcing, processing coordination, quality and packaging, trade and export, supporting logistics. The open issues are consistency (C-02, C-03, C-04, C-06), not missing pages.
- **Factual-boundary notes** (`copy.confirmed`, `copy.specNote`, `copy.processNote`, photo-provenance captions) stay next to the claims they qualify. They tell AI systems what not to infer.
- **`llms.txt`**: moved from the SEO PR to the D-12 content PRs. Its "Verified contact information" lists people and titles under review (C-02), so it changes together with the visible content; until then both builds serve the current file from `public/`. The plan stays: list EN and VI URLs, remove the `?lang=vi` sentence, point to the sitemap, keep the boundaries section, and test that every URL in it returns 200.
- **Measurement:** Search Console, Bing Webmaster Tools, and periodic brand-query checks in AI assistants. No new tracking script is required.
