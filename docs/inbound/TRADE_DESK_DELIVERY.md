# HMV Trade Desk delivery

Where a buyer's inquiry goes after **Send Request**, and what the buyer sees.

The Trade Desk is a chat-first sales conversation, deterministic (no generated text). HMV asks three things: the
product (already known when opened from a product page), the delivery destination and the expected volume. All three
known: **ready for quotation**, routed to HMV Sales (**Request Quotation**). A buyer still exploring can say so at any
question after the product: routed to HMV Customer Service (**Discuss with HMV**). Contact details are asked last, in
an inline card. Technical and logistics points (specifications, Incoterm, packaging, certification, transport) are
never asked: they belong to the commercial discussion. The inquiry contract keeps `application`, `transport` and
`requirements` for earlier inquiries; the desk sends them empty and fills nothing in. The route (Sales · RFQ or
Customer Service) follows from what the record holds: product, destination and volume, or not.

```
Trade Desk (browser) ── POST /api/inquiry (same origin) ──► app/api/inquiry/route.ts
                                                            │ validateInquiry (src/features/trade-desk/validation.js)
                                                            ▼
                                            inquiry service (src/next/inquiry/service.js)
                                                            │ delivery adapter (src/next/inquiry/adapters.js)
                                                            ▼
Production   INQUIRY_DELIVERY=webhook ──► n8n production webhook (JSON record, HMAC-signed, idempotency-key header)
                                                            │ n8n Switch, default branch
                                                            ▼
                                  Agricultural Trade workflow ──► Google Sheet `HMV Inbound Leads`
                                                                  + the agricultural idempotency table

Optional, future   INQUIRY_DELIVERY=cms ──► HMV CMS POST /api/v1/integrations/trade-inquiries (server to server,
                                            HMAC-signed) ──► CMS Sales Inbox + notification email
```

The browser only ever calls `/api/inquiry` (and, for route assessments, `/api/route-assessment`) on this site. The
webhook and CMS addresses and secrets are server-side variables, never `NEXT_PUBLIC_*`; no CMS URL, secret or signing
header is in any client chunk (checked by `tests/next/trade-desk.local-build.spec.js`). No CORS list is involved.

## Delivery adapters

`INQUIRY_DELIVERY` picks one; anything missing or invalid means **no adapter**, and `/api/inquiry` answers 503 so the
buyer sees the failure state (nothing is silently dropped).

| `INQUIRY_DELIVERY` | Needs | Use |
| --- | --- | --- |
| `webhook` | `INQUIRY_WEBHOOK_URL` (https), optional `INQUIRY_WEBHOOK_SECRET` | **Production**: the n8n production webhook (below) |
| `cms` | `CMS_INQUIRY_URL` (https; `http://localhost`/`127.0.0.1` allowed for local testing), `CMS_INQUIRY_SECRET` (≥ 32 characters) | Optional, future system of record; not used in Production |
| `log` | not production | Local development: keeps inquiries in memory, logs the reference only |

`CMS_INQUIRY_URL` is the full endpoint, e.g. `https://<cms-api-host>/api/v1/integrations/trade-inquiries`.
`CMS_INQUIRY_SECRET` equals the CMS's `TRADE_INQUIRY_INGEST_SECRET` (generate with `openssl rand -hex 32`).
Never prefix any of these variables with `NEXT_PUBLIC_`.

## Production: the n8n webhook

Production runs `INQUIRY_DELIVERY=webhook`; the webhook is the n8n production webhook. Per request (8 s timeout): a
`POST` of the record as JSON, with

| Header | Value |
| --- | --- |
| `idempotency-key` | The submission's key (a UUID; reused when the buyer retries the same submission). **Only here**: the JSON body has no idempotency key field. |
| `x-hmv-signature` | `sha256=` + lower-case hex `HMAC-SHA256(INQUIRY_WEBHOOK_SECRET, <exact body>)`, when the secret is set |

Any non-2xx answer or a timeout is a 502 for the buyer (retry and email draft); a 2xx is a 201 with the site's
reference `HMV-YYYY-XXXXXX`, the `reference` of the record sent in that attempt (the webhook's answer body is not read).

**Known limitation of the shared webhook contract: the reference is not stable across retries.** n8n deduplicates on
the `idempotency-key` header, never on `reference`, and each attempt that reaches the webhook carries a newly drawn
reference. Only a retry handled by the same server instance while that instance still caches the key's accepted result
gets the first answer without sending again. A retry is sent again, with a new reference, when:

- it is handled by another server instance;
- the earlier attempt failed (a non-2xx answer or the 8 s timeout): a failed result is removed from the cache at once.
  The webhook may nevertheless have stored that attempt's lead (a timeout after n8n wrote it), so the buyer can be shown
  a failure, and offered the email draft, for a lead that already exists;
- the cached result is gone before its 15 minutes: an instance keeps at most 500 keys and drops the oldest, and loses
  them all when it is recycled.

n8n then keeps the first record for the key, and the reference shown to the buyer (that of the attempt that got a 201)
can differ from the stored lead's: the `idempotency-key` (with the contact) is what ties the lead to the submission.
This applies to commodity inquiries and route assessments alike. A stable reference (the webhook answering with the
stored one and the adapter using it, or a reference derived from the key) changes the shared contract and the
production Trade Desk path, so it is left to a separate change.

Commodity inquiries (`/api/inquiry`) and Vietnam–Cambodia route assessments (`/api/route-assessment`) share **only
this transport**: the same webhook URL, signature and idempotency header. n8n separates them after receipt, and each
goes to its own sales pipeline and data store:

| n8n Switch | Workflow | Leads | Deduplication |
| --- | --- | --- | --- |
| `body.service.id === "vietnam-cambodia-consolidation"` | Consol | Google Sheet `HMV - Consol VN Cambodia Leads` | n8n Data Table `HMV Consol Lead Keys` |
| default / fallback | Agricultural Trade | Google Sheet `HMV Inbound Leads` | the agricultural idempotency table |

A Trade Desk record has no `service` key, so a commodity inquiry always takes the default branch. The two sheets are
separate pipelines: Consol leads never enter `HMV Inbound Leads`, and commodity inquiries never enter the Consol sheet.
No other public webhook and no other Vercel variable exist for route assessments.

## CMS protocol (optional, future destination)

Not used in Production. Kept for the CMS as a future system of record, with `INQUIRY_DELIVERY=cms`. Per request
(8 s timeout):

| Header | Value |
| --- | --- |
| `Idempotency-Key` | The Trade Desk's per-inquiry key (a UUID; reused when the buyer retries the same inquiry) |
| `X-HMV-Timestamp` | Unix seconds |
| `X-HMV-Signature` | lower-case hex `HMAC-SHA256(CMS_INQUIRY_SECRET, "<timestamp>.<idempotency key>.<bodySha256>")` |

`bodySha256` is the lower-case hex SHA-256 of the exact body string sent. The adapter serializes the payload **once**
and uses that same string for the hash and as the fetch body; the CMS hashes the raw bytes it receives (never
re-serialized JSON). Headers captured in transit therefore cannot be replayed with a different body within the
300-second window: the CMS answers 401.

No contact data is in the headers. The body (`cmsPayload` in `adapters.js`) carries controlled ids (product — always present — origin,
unit, application, transport, requirement options), the contact, `source` (landing path, referrer **origin**, UTM)
and `consentAt`. Empty fields are left out: the Trade Desk asks no origin, so none is sent and none is assumed (an
origin sent explicitly must be one the product is offered from, or the inquiry is refused). The honeypot field is never
sent: a filled honeypot is answered as accepted and not delivered.

Shared test vector (asserted in this repo's `src/next/inquiry/service.test.js` and the CMS's
`backend/src/modules/trade-inquiries/trade-inquiries.spec.ts`):

```
secret          hmv-shared-test-vector-secret-0123456789abcdef
timestamp       1767225600
idempotencyKey  0f3b6d2e-1c4a-4e8b-9a77-2f1d3c4b5a69
body            {"locale":"en","productId":"dried-cassava-chips","origin":"vietnam","destination":"Singapore","volume":{"amount":"5000","unit":"mt_month"},"application":"bioethanol","transport":"sea_fcl","requirements":{},"contact":{"company":"Example Co","email":"buyer@example.com"},"consentAt":"2026-01-01T00:00:00.000Z"}
bodySha256      20fe22d201ffaf572bf56b405b8e5695a6e8f270f1312238c40cc078e7431d9c
signature       37a0452e58562fb1d41ff58ad73f4cc362cd6586e529d2b958476a905d5f4d91
```

(`body` is the exact string, without a trailing newline. It is a valid product-led inquiry: `cmsPayload` produces it
for that brief without page context, and the CMS accepts it.)

| CMS answer | `/api/inquiry` | Buyer sees |
| --- | --- | --- |
| 201 `{reference}` | 201 `{reference}` | "Sent to the HMV commercial team" with the **CMS** reference `HMV-YYYY-XXXXXX` |
| 200 `{reference, duplicate:true}` (same key again) | 201 `{reference}` | The same reference; nothing new is created or emailed |
| 400 / 401 (incl. a body changed after signing) / 503 / timeout / no reference | 502 | "Could not be sent", answers kept, **Try again** (same key) and **Prepare an email instead** |

Submission rules (browser and `/api/inquiry`):

- The browser waits at most 15 s for `/api/inquiry` (`AbortController` in `src/next/inquiry-client.js`), then shows the
  retry and email draft with the buyer's answers kept.
- One idempotency key per exact inquiry: an exact retry reuses it; any changed requirement or contact value gets a new key
  (`src/features/trade-desk/fingerprint.js`). The server keeps each key's content fingerprint and answers **409** to a
  key reused with other content, never the first inquiry's reference.
- Every contact validation error, the browser's or the server's, is shown at its field in the contact card; an
  amount the inquiry would refuse is pointed out where the buyer typed it.
- A response for a conversation that is no longer on screen (a new one was started) changes nothing; an acceptance
  that arrives while the desk is closed is shown on the next open, until the buyer starts a new inquiry.
- The body is read with a 20 000-byte limit: a larger `Content-Length` is refused unread, a chunked body is cut off at
  the limit (413).
- The webhook adapter sends the inquiry's idempotency key as `idempotency-key` (stable across retries; the record's
  reference is drawn anew for each attempt), so the destination can deduplicate on the key, never on the reference
  (see *Known limitation* above).

Only a 201 from `/api/inquiry` shows the sent state and emits `generate_lead`. Failures are logged with the idempotency
key and the CMS status/error code only, never contact details.

The product and requirement keys must match the CMS contract (`CMS_HMV/backend/src/modules/trade-inquiries/inquiry-contract.ts`
mirrors `src/features/trade-desk/rules.js`). Changing products or requirement keys here needs the same change there,
or the CMS answers 400 and buyers get the failure state.

## Loading

`SiteShell` mounts `TradeDeskHost` (small): it records the visit context (landing page, referrer, UTM in
`sessionStorage`), listens for `openTradeDesk()`, counts `trade_desk_open`, and loads the desk with `React.lazy` on the
first open. The first open is kept while the code loads (a "Opening HMV Trade Desk…" status shows meanwhile), with its
product. Measured on `next build` (initial `<script>` chunks of the page):

| Route | Before (desk eager, support chat) | After (desk lazy, no chat) |
| --- | --- | --- |
| `/` | 843.9 KB raw / 272.6 KB gzip | 771.8 KB raw / 249.0 KB gzip |
| `/products/passion-fruit` | 835.4 / 268.9 | 763.1 / 245.2 |
| Trade Desk chunk (on first open) | in initial JS | 47.7 KB raw / 16.4 KB gzip |

## The Quick RFQ (fast lane)

The homepage `#initiate-trade` section (the Quick RFQ, a strip directly below the hero) is a second front end to this same pipeline, for a buyer who already knows what
they need: step 1 product, destination, volume; step 2 company, work email and consent (name, phone and notes are
optional, folded away). It posts the **same** inquiry to the **same** `POST /api/inquiry`: the same validation (so the
work email stays required: WhatsApp-only submission would be an inquiry-contract change), the same idempotency key
rules (`src/features/trade-desk/submission.js`), the same honeypot and visit context, the same adapter and webhook. A
Quick RFQ record is the record of a ready Trade Desk inquiry (`origin`, `application`, `transport` and `requirements`
empty, nothing inferred). The record does not say which lane it came from (both carry only the visit context); the lane
is in analytics, the `generate_lead` event's `source: 'quick_rfq'`. Marking it in the sheet would be a contract change,
left for a follow-up. It shows the reference only after a 201; on a failed send it
keeps the details, offers "Try again" and, only then, the email draft. "Need guidance?" opens the Trade Desk with the
product, destination and volume already given.

## After sending: optional follow-up

The sent state can offer links for the buyer to continue, if configured at build time:

| Variable | Example | Shown |
| --- | --- | --- |
| `NEXT_PUBLIC_HMV_WHATSAPP` | `+84 9xx xxx xxx` (international number) | EN first; VI second |
| `NEXT_PUBLIC_HMV_ZALO_URL` | `https://zalo.me/<number or OA path>` | VI only, first |
| `NEXT_PUBLIC_HMV_SALES_EMAIL` | `sales@…` | Both, last |

An unset or malformed value hides that link. The links carry a fixed message with the reference and product name
only, e.g. `Hello HMV, I submitted inquiry HMV-2026-7KQ4XM regarding Dried cassava chips.` — never the buyer's email,
phone, company or free text. Nothing is sent automatically; there is no WhatsApp or Zalo API integration.

## Privacy

`/privacy` and `/vi/privacy` describe what the Trade Desk collects and where it goes; the consent checkbox links them.
They name no privacy mailbox (requests go through the Contact page) and claim no legal certification. Business/legal
review before launch.

## Rate limiting

**Edge rate limiting on both POST endpoints is required while delivery is on, whatever the adapter.** Without it, any
caller can send valid requests with fresh idempotency keys, and each one is a write at the destination (a sheet row
today; a CMS write and a notification email with the CMS). Keep a Vercel Firewall (WAF) rate-limit rule per client IP
(for example a few requests per minute, then deny or challenge) covering `POST /api/inquiry` **and**
`POST /api/route-assessment`, and verify it on a preview. The site has no in-memory limiter by design: serverless
instances do not share memory, so one would not limit anything.

## Before switching delivery to the CMS

Production delivery stays on the webhook until every item below is in place:

1. CMS deployed with HTTPS and `TRADE_INQUIRY_INGEST_ENABLED=true`.
2. Vercel (Production): `INQUIRY_DELIVERY=cms`, `CMS_INQUIRY_URL`, `CMS_INQUIRY_SECRET` (server-only).
3. Optional `NEXT_PUBLIC_HMV_*` channels (then redeploy: they are inlined at build).
4. A test inquiry on a preview deployment, seen in the CMS Sales Inbox with the same reference the buyer saw.
5. Route assessments: the CMS contract supports logistics-service inquiries, **and** `createRouteAssessmentService`
   (`src/next/inquiry/route-assessment.js`), which deliberately refuses the CMS adapter today, is changed to send them
   to it; a valid assessment is verified to reach the CMS and return 201. Until both are in place the CMS adapter
   refuses route assessments (503) and they must stay on the webhook path, so switching to `cms` would stop
   Vietnam–Cambodia leads.

## Route assessments (Vietnam–Cambodia consolidation)

The form of `/logistics/vietnam-cambodia-consolidation` posts to `POST /api/route-assessment` (same origin, same JSON
handling, status codes and 20 000-byte limit as `/api/inquiry`: `src/next/inquiry/http.js`). Validation:
`src/features/route-assessment/validation.js` (origin, destination, cargo description and weight/CBM/volume required;
frequency and notes optional; the contact, consent, visit context, honeypot and idempotency key follow the Trade Desk's
rules). The commodity Trade Desk and `/api/inquiry` are unchanged.

Delivery goes through the adapter `INQUIRY_DELIVERY` configures, with no new variable, secret or webhook:

| `INQUIRY_DELIVERY` | Route assessment |
| --- | --- |
| `webhook` (Production) | Delivered to the n8n production webhook like a Trade Desk record (signature, `idempotency-key` header); n8n routes it to the Consol pipeline by `service.id` ([Production: the n8n webhook](#production-the-n8n-webhook)) |
| `log` | Kept in memory outside production, as for the Trade Desk |
| `cms` (optional, future) | **Not accepted (503)**: the CMS ingestion contract takes commodity inquiries only; the form offers the email draft. Route assessments stay on the webhook path until the CMS contract supports logistics-service inquiries. |
| unset | 503, as for the Trade Desk |

The record keeps the keys of a Trade Desk record (one webhook format for both); `service` identifies it, and
`service.id === "vietnam-cambodia-consolidation"` is n8n's routing rule. The body:

```json
{
  "reference": "HMV-2026-7KQ4XM",
  "createdAt": "2026-11-21T08:00:00.000Z",
  "locale": "en",
  "product": { "id": "vietnam-cambodia-consolidation", "name": "Vietnam–Cambodia Consolidation" },
  "service": { "id": "vietnam-cambodia-consolidation", "name": "Vietnam–Cambodia Consolidation" },
  "origin": "Binh Duong, Vietnam",
  "destination": "Phnom Penh, Cambodia",
  "volume": "4 pallets, 2.5 CBM, 900 kg",
  "application": "",
  "transport": "",
  "requirements": [
    { "key": "cargo", "label": "Cargo description", "value": "Electronic components in cartons" },
    { "key": "frequency", "label": "Expected frequency", "value": "Weekly" }
  ],
  "notes": "",
  "contact": { "company": "Example Co", "email": "ops@example.com", "name": "", "phone": "+84 28 1234 5678" },
  "source": {
    "page": "/logistics/vietnam-cambodia-consolidation",
    "landingPage": "/logistics/vietnam-cambodia-consolidation",
    "referrer": "https://www.google.com",
    "utm": { "source": "", "medium": "", "campaign": "" },
    "cta": "en_route_assessment"
  },
  "consent": { "contactAcceptedAt": "2026-11-21T08:00:00.000Z" }
}
```

Unlike a Trade Desk record, `origin`, `destination` and `volume` are the shipper's own text, and `source.cta` names the
call to action (`en_route_assessment`, `vi_route_assessment`). The idempotency key is the `idempotency-key` header.

Where the request carries each column of the Consol sheet, `HMV - Consol VN Cambodia Leads` (the mapping itself is
the n8n Consol workflow's):

| Column | In the request |
| --- | --- |
| Received At | `createdAt` (when the site accepted the request, ISO 8601 UTC) |
| Reference | `reference` |
| Language | `locale` (`en`, `vi`) |
| Service | `service.name` (`service.id` routes it) |
| Origin · Destination · Volume | `origin` · `destination` · `volume` |
| Cargo · Frequency | `requirements[]` with `key` `cargo` · `frequency` (`frequency` absent when not given) |
| Company · Contact Name · Business Email · WhatsApp / Phone | `contact.company` · `contact.name` · `contact.email` · `contact.phone` |
| Source Page · CTA Source · Referrer | `source.page` · `source.cta` · `source.referrer` (an origin only) |
| UTM Source · UTM Medium · UTM Campaign | `source.utm.source` · `source.utm.medium` · `source.utm.campaign` |
| Idempotency Key | the `idempotency-key` request header |
| Status · Owner · Notes | Pipeline columns kept in the sheet; the request's own `notes` field holds the shipper's optional notes |

 The form shows "sent" and the reference only after a
201; otherwise it keeps the answers and offers a retry (same idempotency key) and an email draft. An accepted request
emits `generate_lead` with `product: vietnam-cambodia-consolidation`, `route: route_assessment`.
