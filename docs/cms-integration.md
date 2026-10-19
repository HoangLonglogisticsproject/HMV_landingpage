# CMS integration handoff

Status on 2026-10-19: the landing page calls no API. All content is static in `src/data/`.

This note compares what `CMS_HMV` (branch `main`, audited read-only) exposes today with what it only plans, and shows where the landing page would connect. Integration has not started and needs approval first.

## CMS public API that exists today

All paths are under `{API_ORIGIN}/api/v1`. Only routes marked `@Public()` under `/public/*` are for the website. Every other route requires an admin session cookie plus a CSRF token, and the website must never call it.

| Endpoint | Returns |
|---|---|
| `GET /public/articles?locale=&page=&pageSize=&category=` | Published articles, newest first, as `{ items, page, pageSize, total }`. `pageSize` is at most 100. |
| `GET /public/articles/:slug?locale=` | One article. `content` is Tiptap JSON with resolved image `src`/`alt`; also returns `seo` and `alternates[]` (`{ locale, slug }`). |
| `GET /public/article-categories?locale=` | Article categories |

Rules:

- `locale` defaults to `vi`. An unknown locale returns `400 UNKNOWN_LOCALE`.
- There is no content fallback. An article that is not live in the requested locale is missing from the list and returns 404 by slug.
- Slugs differ per locale.
- Only published, non-archived revisions are served.
- Responses are cached with `public, max-age=60, stale-while-revalidate=300`.
- Errors have the shape `{ statusCode, code, message }`.

The contract lives in `CMS_HMV/docs/api/openapi-spec.json` and `CMS_HMV/docs/api/public-content-contract.md`. Swagger UI is turned off in production.

## Domain status

| Domain | CMS status | Landing page today | Can integrate? |
|---|---|---|---|
| EcoNews articles | Implemented, public | `data/articles.js` (3 articles, `[tag, text]` body blocks) | Yes, after the decisions below |
| Media assets | Admin API only. Public URLs (`MEDIA_PUBLIC_BASE_URL/media/YYYY/MM/<uuid>.<ext>`) arrive only inside article payloads. | Bundled `src/assets` | Only as part of articles |
| Pages / localized content | Planned: Prisma scaffold only, no endpoint. `/public/pages/:systemKey` is documented as "not implemented yet". | `copy` in `data/hmv.js` | No |
| Supply chain stories | Absent: mock UI in the admin app only | `stages` in `data/hmv.js` and supply-chain page sections | No |
| Commodities / products | Planned: scaffold schema, to be redesigned. No endpoint. | `products` in `data/hmv.js`, `data/productPhotos.js` | No |
| RFQ / contact | Absent: no endpoint, model, spam protection or public rate limit | mailto drafts (`features/inquiries`) | No; keep mailto |

Do not build against the scaffold schemas or mock fixtures. They are expected to change.

## Decisions needed before integrating articles

1. **URL and slug policy.** The site uses locale-free URLs, with one English slug serving both languages (`/blog/exporting-passion-fruit-eu`); Vietnamese slugs redirect to it. The CMS has a slug per locale and defaults to `vi`. Either keep locale-free URLs and resolve the other language through `alternates`, or move to locale-prefixed URLs. The second option is an SEO and URL change that needs approval.
2. **Where to fetch.**
   - **Browser fetch:** the site origin must be added to the CMS `CORS_ORIGIN` list. That list is shared with the admin app (`credentials: true`), which mixes trust levels.
   - **Build-time fetch into static data, or a same-origin proxy:** avoids the CORS issue and keeps SEO tags static.
3. **Rich text.** Tiptap JSON needs a whitelist renderer (for example `@tiptap/static-renderer`), which is a new dependency. Never inject it as raw HTML.
4. **Missing locale.** Decide what a visitor sees when an article exists in only one language.
5. **Readiness.** The CMS is not approved for production, has no deployed API URL, and its public GETs have no rate limit (put a CDN in front).

## Where it plugs in here

- `src/data/articles.js` is read by `pages/home/sections/LatestInsights`, `pages/insights/InsightsPage`, `pages/article/ArticlePage` and `i18n/LegacyLocaleRedirect` (legacy slug lookup).
  - A future `features/articles/` module should own the fetching and the mapping from CMS DTOs to the shape those components use, so the pages barely change.
  - Article images currently resolve through `photos` in `data/hmv.js`; the CMS provides absolute URLs with alt text.
- **Credentials.** No admin credentials, session cookies or `/admin/*` calls may ever ship in the website. The public website needs no authentication.
- **RFQ.** If the CMS later adds a public RFQ POST, it needs server-side validation, rate limiting and spam protection. The site origin must also be in `CORS_ORIGIN`, because the CMS Origin check also applies to public POSTs. Until then, mailto stays.
