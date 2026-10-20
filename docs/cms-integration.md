# CMS integration

Status on 2026-10-20: EcoNews (Home "Latest Insights", `/insights`, `/blog/:slug`) and the About page (`/about`) can read the HMV CMS public API in **CMS mode**. The default build, production included, still renders the bundled copy in `src/data/articles.js` and `src/data/about.js`. Enabling CMS mode in production is blocked on the items under [Before enabling in production](#before-enabling-in-production).

Verified end to end on 2026-10-20 against a local CMS (`main` 488e05d, real PostgreSQL): `[TEST]` articles were created, approved, published and archived through the CMS admin UI, then checked on the public API and on this site in CMS mode (listing, detail, rich text, cover and inline media, EN↔VI slugs, unpublished translation, draft, archived, empty and error states). `src/features/articles/fixtures/cms-article.json` is the real published payload from that run.

Everything else (other pages, products, supply-chain stories, RFQ) is still static; see [Domain status](#domain-status).

## CMS public API used

All paths are under `{API_ORIGIN}/api/v1`. Only `@Public()` routes under `/public/*` are for the website. Every other route requires an admin session cookie plus a CSRF token, and the website must never call it.

| Endpoint | Returns |
|---|---|
| `GET /public/articles?locale=&page=&pageSize=&category=` | Published articles, newest first, as `{ items, page, pageSize, total }`. `pageSize` is at most 100. |
| `GET /public/articles/:slug?locale=` | One article: the summary fields plus `content` (Tiptap JSON with resolved image `src`/`alt`), `seo { title, description }` and `alternates[]` (`{ locale, slug }`, other **live** locales only). |
| `GET /public/article-categories?locale=` | `[{ code, name }]` (not used by the site; categories arrive inside each article). |

Rules, verified against the running CMS (`main` 488e05d):

- `locale` comes only from the query string and defaults to `vi`. An unknown locale returns `400 UNKNOWN_LOCALE`. Unknown query parameters (for example `limit`) return `400 VALIDATION_FAILED`, so the client sends only `locale` and `pageSize`.
- Only published, non-archived articles are served, and only in locales that are live (approved and published). Drafts, archived articles and unapproved translations return 404 and are missing from the list. There is no content fallback between locales.
- Slugs differ per locale and are unique per `(locale, slug)`. A slug only resolves with its own locale.
- Media URLs are absolute: `${MEDIA_PUBLIC_BASE_URL}/media/YYYY/MM/<uuid>.<ext>` (dev: `http://localhost:4000/media-files/...`).
- Responses, **including 400/404 errors**, are cached with `public, max-age=60, stale-while-revalidate=300`. Errors have the shape `{ statusCode, code, message, details? }`.
- The CMS sends no `Access-Control-Allow-Origin` for the site's origin. Its CORS list is shared with admin writes (`credentials: true`), so the site's origin must **not** be added to it. The site reaches the API same-origin instead (below).

Contract sources: `CMS_HMV/docs/api/public-content-contract.md`, `CMS_HMV/docs/api/openapi-spec.json`.

## How it works here

| Piece | File |
|---|---|
| Mode flag | `.env.cms` sets `VITE_CMS_CONTENT=true`; it is loaded only by `--mode cms` (`npm run dev:cms`, `npm run build:cms` → `dist-cms/`). With the flag off, the CMS client is tree-shaken out of the bundle. |
| Same-origin access | `vite.config.js` proxies **only** `/api/v1/public` to `CMS_API_ORIGIN` (shell variable, default `http://localhost:4000`) for `vite` and `vite preview`, and strips the `Cookie` header (localhost cookies ignore the port, so the admin `hmv_session` would otherwise be forwarded). |
| Shared client | `src/lib/cms.js` (`getJson`: relative `/api/v1/public/...` URLs, `credentials: 'omit'`, only an `Accept` header) and `src/lib/useFetched.js` (`CMS_CONTENT` flag, keyed fetch hook with abort). Used by every CMS-backed feature. |
| API client | `src/features/articles/api.js`: maps CMS article DTOs to the view shape the pages render. |
| Data hooks | `src/features/articles/hooks.js`: `useArticleList(lang, { pageSize })`, `useArticle(slug, lang)`. In static mode they map the bundled articles to the same shape. States: `loading`, `ready`, `empty`, `error`, `not-found`, `unavailable`, `redirect`. |
| Cards and states | `src/features/articles/ArticleGrid.jsx` (Home shows 3, `/insights` shows up to 100: no pagination UI yet). |
| Rich text | `src/features/articles/RichText.js` (see [Rich text](#rich-text)). |

With CMS mode on, the CMS is the only source: a failed request shows an error state and **never** falls back to bundled articles.

### Running locally

```bash
# CMS_HMV: Postgres (docker compose up -d postgres), then pnpm dev:backend (:4000) and pnpm dev:frontend (:3000)
npm run dev:cms                     # landing on :5173, EcoNews from the local CMS
CMS_API_ORIGIN=http://host:4000 npm run dev:cms   # another CMS
```

## Locale and slug resolution

URLs stay locale-free (`/blog/:slug`); the language comes from `?lang=` or the stored preference (`hmv_lang`). For `/blog/<slug>` in language `L`:

1. Fetch `<slug>` in `L`. Found: render it.
2. Not found: fetch `<slug>` in the other language.
   - Found and its `alternates` contain `L`: replace the URL with `/blog/<alternate slug>`.
   - Found without an `L` alternate: show "not available in this language" (noindex) with a **Read in …** button that switches the language. The other language's content is never shown automatically.
   - Not found: show the not-found state (noindex). The URL is kept.
3. An alternate equal to the current slug (only possible with a stale cached 404) shows "not available" rather than redirecting in a loop.

Switching language on an article runs the same resolution, so `/blog/test-econews-integration` becomes `/blog/test-econews-tich-hop` when the visitor picks Tiếng Việt. A shareable Vietnamese link is `/blog/<vi-slug>?lang=vi`.

Each localized slug is its own URL with its own canonical link. Static mode keeps the old behavior (one English slug for both languages; Vietnamese slugs redirect to it).

### Legacy URLs

- `/en/blog/<slug>` and `/vi/blog/<slug>` set the language and pass `/blog/<slug>` through to the resolution above.
- The bundled articles' URLs (`/blog/exporting-passion-fruit-eu`, `/blog/optimizing-tropical-logistics`, `/blog/circular-agriculture`, and their Vietnamese slugs) keep working in CMS mode **only if** those articles are recreated in the CMS with the same per-locale slugs:

| Article | `en` slug | `vi` slug |
|---|---|---|
| Passion fruit EU | `exporting-passion-fruit-eu` | `xuat-khau-chanh-day-eu` |
| Tropical logistics | `optimizing-tropical-logistics` | `toi-uu-hoa-logistics` |
| Circular agriculture | `circular-agriculture` | `nong-nghiep-khep-kin` |

## Pages (About)

`GET /api/v1/public/pages/about?locale=` returns the published copy of one locale as typed JSON (CMS_HMV
`AboutPageContent`: hero, purpose, vision, mission, values, team), plus `seo`. Locales are published
independently in the CMS (submit → approve → publish per locale).

| Piece | File |
|---|---|
| Client | `src/features/pages/api.js` (`fetchPage`: 200 → `ready`, 404 → `not-found`, anything else → error) |
| Hook | `src/features/pages/usePage.js` (`usePage(key, lang)`; bundled copy per key in static mode) |
| Bundled copy | `src/data/about.js`, EN + VI in the CMS shape (the CMS was seeded from it) |
| Rendering | `pages/about/AboutPage.jsx` + `CompanyStory.jsx`: same markup for both sources; icons, grids and the `/contact` link stay in code |

- The h1 and lead come from `hero`; `seo` sets the meta title/description (`DetailLayout` `seo` prop).
- CMS mode states: loading, error (no noindex), and "not published in this language" (noindex). The bundled copy
  is never shown in CMS mode, and the other language is never shown automatically.
- Lists are rendered as the CMS sends them. The layout expects about 3 highlights, 4 values and 4 team members;
  other counts wrap in the existing grids (team icons repeat `Award` after the fourth member).
- Site chrome keeps its own labels: the nav/footer "About HMV" label and the shared contact CTA stay in `data/hmv.js`.

## Rich text

`content` is rendered by a whitelist renderer, not as HTML:

- Each Tiptap node becomes a React element; text stays a string child, so React escapes it. There is no `innerHTML`/`dangerouslySetInnerHTML` and no new dependency.
- Supported, matching the CMS validator (`CMS_HMV/backend/src/modules/articles/rich-content.ts`): `paragraph`, `heading` (2, 3), `blockquote`, `bulletList`, `orderedList` (`start`), `listItem`, `codeBlock`, `horizontalRule`, `hardBreak`, `image`; marks `bold`, `italic`, `strike`, `underline`, `code`, `link`.
- Links use the CMS `isSafeHref` rule (http, https, mailto, tel, `#…`, `/…`; no control characters). Unsafe links keep their text without the link. `target` is only ever `_blank`, which always gets `rel="noopener noreferrer"`; other `rel` tokens are whitelisted.
- Images (`src` resolved by the CMS) render only from http(s) or `/` URLs, with `alt`, `loading="lazy"`; a missing `src` (deleted media) renders nothing.
- Unknown nodes keep their text and drop the wrapper; unknown marks and attributes (`class`, `style`, event handlers) are dropped. Heading levels other than 3 render as `h2`.
- The bundled articles are converted to the same JSON, so one renderer serves both modes.

Styles for elements the bundled articles never used (`h3`, `ol`, `blockquote`, `a`, `img`, `pre`, `hr`) are minimal placeholders in `hmv.css` pending design review.

## SEO limitations (CMS mode)

- **Client-side rendering.** Article content, titles and meta tags are fetched and set in the browser. Crawlers that do not run JavaScript see only `index.html`'s static fallback tags. Crawlability of the rendered HTML has **not** been verified.
- **Language outside the URL.** A visitor or crawler without a stored preference gets English. Vietnamese content is reachable only via `?lang=vi` or a stored preference, and Vietnamese slugs opened in English redirect to the English slug. There are no `hreflang` alternates.
- **Static sitemap.** `public/sitemap.xml` lists the bundled article URLs only; CMS articles are not in it.
- **Error caching.** A 404 can be served from the CMS cache for up to 360 s after an article is published.
- Not-found and unavailable states set `noindex`; error states do not, so a temporary outage does not deindex a live article.

## Before enabling in production

1. A deployed CMS API, with media on https (`MEDIA_PUBLIC_BASE_URL`).
2. A same-origin host rewrite for `/api/v1/public/*` only (the Vite proxy is development/preview only). Do not add the site to the CMS `CORS_ORIGIN`.
3. A CDN or rate limit in front of the public API (the CMS has none on public routes).
4. An SEO decision: pre-rendering or server rendering, a generated sitemap, and `hreflang`/locale URLs. These are URL and SEO changes that need approval.
5. The three bundled articles recreated in the CMS with their legacy slugs (table above).
6. Editors should not add "| HMV Global" to SEO titles; the site appends it.

## CMS-side follow-ups (no CMS change made)

- The public API exposes only the article-level `publishedAt`, so an English version that went live later shows the first publish date.
- The CMS admin builds public links as `/tin-tuc/<slug>`; the site uses `/blog/<slug>`.
- `public-content-contract.md:43` links to an admin-contract anchor that no longer exists.
- Error responses carry the public cache header (see above).

## Domain status

| Domain | CMS status | Landing page today |
|---|---|---|
| EcoNews articles | Implemented, public | CMS mode: public API. Default: `data/articles.js`. |
| Media assets | Admin API only; public URLs arrive inside article payloads | Bundled `src/assets`, plus CMS media inside articles in CMS mode |
| Website pages | About: implemented, public (`/public/pages/about`). Other pages: not modelled | About: CMS mode via `features/pages`, default `data/about.js`. Others: `copy` in `data/hmv.js` |
| Supply chain stories | Absent: mock UI in the admin app only | `stages` in `data/hmv.js` |
| Commodities / products | Planned: scaffold schema, no endpoint | `products` in `data/hmv.js`, `data/productPhotos.js` |
| RFQ / contact | Absent: no endpoint, model, spam protection or public rate limit | mailto drafts (`features/inquiries`) |

Do not build against the scaffold schemas or mock fixtures. They are expected to change. If the CMS later adds a public RFQ POST, it needs server-side validation, rate limiting and spam protection, and the CMS Origin check also applies to public POSTs.
