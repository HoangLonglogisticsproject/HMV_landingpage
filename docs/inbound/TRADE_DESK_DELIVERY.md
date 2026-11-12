# HMV Trade Desk delivery

Where a buyer's inquiry goes after **Send to HMV Commercial Team**, and what the buyer sees.

```
Trade Desk (browser) ── POST /api/inquiry (same origin) ──► app/api/inquiry/route.ts
                                                            │ validateInquiry (src/features/trade-desk/validation.js)
                                                            ▼
                                            inquiry service (src/next/inquiry/service.js)
                                                            │ delivery adapter (src/next/inquiry/adapters.js)
                                                            ▼
                         HMV CMS  POST /api/v1/integrations/trade-inquiries  (server to server, HMAC-signed)
                                                            │
                                         PostgreSQL TradeInquiry ──► CMS Sales Inbox + notification email
```

The browser only ever calls `/api/inquiry` on this site. The CMS address and secret are server-side variables; no
CMS URL, secret or signing code is in any client chunk (checked by `tests/next/trade-desk.spec.js`). The CMS CORS
list is not involved.

## Delivery adapters

`INQUIRY_DELIVERY` picks one; anything missing or invalid means **no adapter**, and `/api/inquiry` answers 503 so the
buyer sees the failure state (nothing is silently dropped).

| `INQUIRY_DELIVERY` | Needs | Use |
| --- | --- | --- |
| `cms` | `CMS_INQUIRY_URL` (https; `http://localhost`/`127.0.0.1` allowed for local testing), `CMS_INQUIRY_SECRET` (≥ 32 characters) | Production: the CMS is the system of record |
| `webhook` | `INQUIRY_WEBHOOK_URL` (https), optional `INQUIRY_WEBHOOK_SECRET` | Kept for an automation endpoint; not used in production |
| `log` | not production | Local development: keeps inquiries in memory, logs the reference only |

`CMS_INQUIRY_URL` is the full endpoint, e.g. `https://<cms-api-host>/api/v1/integrations/trade-inquiries`.
`CMS_INQUIRY_SECRET` equals the CMS's `TRADE_INQUIRY_INGEST_SECRET` (generate with `openssl rand -hex 32`).
Never prefix either with `NEXT_PUBLIC_`.

## CMS protocol

Per request (8 s timeout):

| Header | Value |
| --- | --- |
| `Idempotency-Key` | The Trade Desk's per-brief key (a UUID; reused when the buyer retries the same brief) |
| `X-HMV-Timestamp` | Unix seconds |
| `X-HMV-Signature` | lower-case hex `HMAC-SHA256(CMS_INQUIRY_SECRET, "<timestamp>.<idempotency key>")` |

No contact data is in the headers. The body (`cmsPayload` in `adapters.js`) carries controlled ids (product, origin,
unit, application, transport, requirement options), the contact, `source` (landing path, referrer **origin**, UTM)
and `consentAt`. The honeypot field is never sent: a filled honeypot is answered as accepted and not delivered.

Shared test vector (asserted in this repo's `src/next/inquiry/service.test.js` and the CMS's
`backend/src/modules/trade-inquiries/trade-inquiries.spec.ts`):

```
secret          hmv-shared-test-vector-secret-0123456789abcdef
timestamp       1767225600
idempotencyKey  0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69
signature       07793521e0fd555bb265faff963e5bcb9ebb252c6781190a75e4a53f32e1be60
```

| CMS answer | `/api/inquiry` | Buyer sees |
| --- | --- | --- |
| 201 `{reference}` | 201 `{reference}` | "Sent to the HMV commercial team" with the **CMS** reference `HMV-YYYY-XXXXXX` |
| 200 `{reference, duplicate:true}` (same key again) | 201 `{reference}` | The same reference; nothing new is created or emailed |
| 400 / 401 / 503 / timeout / no reference | 502 | "Could not be sent", answers kept, **Try again** (same key) and **Prepare an email instead** |

Only a 201 from `/api/inquiry` shows the sent state and emits `generate_lead`. Failures are logged with the idempotency
key and the CMS status/error code only, never contact details.

The product and requirement keys must match the CMS contract (`CMS_HMV/backend/src/modules/trade-inquiries/inquiry-contract.ts`
mirrors `src/features/trade-desk/rules.js`). Changing products or requirement keys here needs the same change there,
or the CMS answers 400 and buyers get the failure state.

## Loading

`SiteShell` mounts `TradeDeskHost` (small): it records the visit context (landing page, referrer, UTM in
`sessionStorage`), listens for `openTradeDesk()`, counts `trade_desk_open`, and loads the desk with `React.lazy` on the
first open. The first open is kept while the code loads (a "Opening HMV Trade Desk…" status shows meanwhile), with its
product and goal. Measured on `next build` (initial `<script>` chunks of the page):

| Route | Before (desk eager, support chat) | After (desk lazy, no chat) |
| --- | --- | --- |
| `/` | 843.9 KB raw / 272.6 KB gzip | 771.8 KB raw / 249.0 KB gzip |
| `/products/passion-fruit` | 835.4 / 268.9 | 763.1 / 245.2 |
| Trade Desk chunk (on first open) | in initial JS | 47.7 KB raw / 16.4 KB gzip |

## After sending: optional follow-up

The sent state can offer links for the buyer to continue, if configured at build time:

| Variable | Example | Shown |
| --- | --- | --- |
| `NEXT_PUBLIC_HMV_WHATSAPP` | `+84 9xx xxx xxx` (international number) | EN first; VI second |
| `NEXT_PUBLIC_HMV_ZALO_URL` | `https://zalo.me/<number or OA path>` | VI only, first |
| `NEXT_PUBLIC_HMV_SALES_EMAIL` | `sales@…` | Both, last |

An unset or malformed value hides that link. The links carry a fixed message with the reference and product (or goal)
only, e.g. `Hello HMV, I submitted inquiry HMV-2026-7KQ4XM regarding Dried cassava chips.` — never the buyer's email,
phone, company or free text. Nothing is sent automatically; there is no WhatsApp or Zalo API integration.

## Privacy

`/privacy` and `/vi/privacy` describe what the Trade Desk collects and where it goes; the consent checkbox links them.
They name no privacy mailbox (requests go through the Contact page) and claim no legal certification. Business/legal
review before launch.

## Before production

1. CMS deployed with HTTPS and `TRADE_INQUIRY_INGEST_ENABLED=true`.
2. Vercel (Production): `INQUIRY_DELIVERY=cms`, `CMS_INQUIRY_URL`, `CMS_INQUIRY_SECRET` (server-only).
3. Optional `NEXT_PUBLIC_HMV_*` channels (then redeploy: they are inlined at build).
4. A test inquiry on a preview deployment, seen in the CMS Sales Inbox with the same reference the buyer saw.
5. Rate limiting for `/api/inquiry` at the edge (Vercel Firewall) if spam appears; there is no in-memory limiter.
