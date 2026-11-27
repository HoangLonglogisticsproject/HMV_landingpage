# Golden passion fruit: three buyer-segment pages

| | |
|---|---|
| Status | 2026-11-27, branch `feat/golden-passion-fruit-b2b-experiences`, second pass (updated product images, kilograms, refined pages). |
| Source | `specs/HMV_Golden_Passion_Fruit_UI_Spec.md`, `specs/references/passion-fruit-approved-ui.png` (the approved Export mockup) |
| Code | `src/data/passionFruitPages.js` (copy, EN/VI) · `src/data/passionFruitMedia.js` (photographs) · `src/views/products/passion-fruit/` (components) · `src/i18n/routes.js` (`PRODUCT_SEGMENTS`) · `app/(en)/(site)/products/[id]/[segment]`, `app/(vi)/vi/(site)/san-pham/[slug]/[segment]` |
| Tests | `src/views/products/ProductDetailPage.test.js` · `src/data/passionFruitPages.test.js` · `src/features/trade-desk/kilograms.test.js` · `src/i18n/routes.test.js` · `src/next/seo.test.js` · `tests/next/passion-fruit.spec.js`, `passion-fruit.desktop.spec.js` |

HMV sells fresh golden passion fruit to businesses: **International Buyers**, **Foodservice & Luxury Hospitality**, **Premium Retail Business**. Individual consumers are not a conversion target: there is no storefront, cart, checkout, account, price or processed product.

## 1. Routes

| Segment | English | Vietnamese |
|---|---|---|
| International Buyers (the product's own, already indexed URL) | `/products/passion-fruit` | `/vi/san-pham/chanh-day` |
| Foodservice | `/products/passion-fruit/foodservice` | `/vi/san-pham/chanh-day/khach-san-nha-hang` |
| Retail Business | `/products/passion-fruit/retail` | `/vi/san-pham/chanh-day/doi-tac-ban-le` |

Each is a prerendered route with its own title, description, canonical, reciprocal hreflang (`en`, `vi`, `x-default` = English), Open Graph, one h1, and a sitemap entry per language. Unknown segments, a segment of another product and a segment slug in the wrong language answer 404. Legacy forms (`/vi/products/passion-fruit/retail`, `?lang=`) take one 308 hop. Nothing outside EN/VI changed; no other product has segments. The Vite build (migration-only) has the same three routes.

The segment navigation (`SegmentNav`) is `<nav>` with three real links and `aria-current="page"`, directly below each hero. Language switching uses the existing contract (`switchHref`), so the segment survives it.

## 2. Pages

| | International Buyers | Foodservice | Retail Business |
|---|---|---|---|
| Direction | Luxury Corporate Agriculture: the approved mockup | Luxury Hospitality Editorial | Premium Produce Branding |
| Palette | white, HMV blue, farm green | botanical green `#193D2C`, cream `#F3EFE3`, gold `#D8B94F` (rules and dark bands only; text uses `#7A5F0D`) | deep blue `#102D43`, cream, the same gold |
| Type | Plus Jakarta Sans, extra bold | Poppins light, large | Plus Jakarta Sans semibold |
| Composition | four-photo collage hero, proof strip, four cards, gallery rows, FAQ, conversion band | editorial split, ruled lists, a dark applications band, no cards, no icons | hero with an inset, ruled numbered lists, a packaging mosaic, a deep-blue partnership band |
| Inquiry | Quick RFQ (fixed to passion fruit) and the Trade Desk | Trade Desk | Trade Desk |

No new font, no new dependency. Styles are Tailwind utilities with the palette as `--pf-*` properties on each page's root (`PassionFruit.module.css`). The module also hands back, inside these pages only, what the unlayered legacy CSS takes from utilities (weight, size, line height and margin of h1–h3, `p` and `figure`; `letter-spacing: 0` on `*`): see CSS_ARCHITECTURE.md, B. The Quick RFQ is excluded from the margin rule (`.legacy`) so it renders as on the home page.

### Differences from the approved Export mockup

The layout, order, colors and photographs' roles follow the mockup. On purpose:

- The mockup's photographs are composites with artificial packaging text (a box reading "PASSION FRUIT FOR EXPORT") and a re-rendered grower; they are not evidence. The page uses the supplied photographs and the supplied edited product images, re-cropped and captioned as what they are (§4); the four-photo hero is the vine, the golden fruit scene, the hand sorting and an open carton.
- The mockup's photograph of a person with a plot sign is withheld pending approval (§4). Its Orchard & Sourcing row is the vine, the trellis and the golden fruit on the tree.
- The mockup's Quick RFQ (product, destination, volume, packing type, email on one screen) is the production Quick RFQ instead: two steps, server submission, product fixed. Packing type is not a field of the inquiry contract.
- The mockup's "Standardized grading with clear size references", "Graded and selected by size" and "Suitable for export and market distribution" are not claims HMV has evidence for; the section says size and selection are agreed with each buyer, and the specification block shows the three confirmed facts (product form, variety, origin) and one request, "Request Detailed Product Specifications", for everything else.
- The mockup's header "Passion Fruit" dropdown and its footer are the site's existing chrome, unchanged.

## 3. Claims

Verified, shown: fresh whole golden passion fruit, Vietnam, sorted fruit, a growing area and packing examples in photographs and images HMV supplied. **Not asserted anywhere:** farm or factory ownership, certification (the growers' sign names USDA, EU Organic, JAS and GLOBALG.A.P.; it is a sign, not a certificate), Brix, size or grade ranges (the handwritten numbers on the fruit are not a standard and the caption says so), shelf life, capacity (a plot sign's tree count is not HMV's capacity), minimum quantities, prices, delivery times, customers, partners, HMV-branded or private-label packaging. Hospitality and retail applications are possible uses of the fresh fruit, not products HMV makes. `src/data/unsupportedClaims.js` holds the claims as targeted patterns (a certification scheme's name, organic status, a held certification, a price, a measured specification, a capacity or minimum order, ownership of a farm, customers, a guarantee), and `passionFruitPages.test.js` and `ProductDetailPage.test.js` apply them to the copy, the metadata, every caption and image description and the rendered page. The patterns match the claim, not the vocabulary: a page may say what it does not offer ("no prices are published"). A file name (`chanh dây organic`, `hữu cơ 1`) never reaches an alt text or a caption; a test checks it.

## 4. Media register

Sources: `src/assets/passion-fruit/` holds the ten originals as supplied (seven JPG, three PNG), **untracked**. The site imports only the WebP derivatives written by `scripts/passion-fruit-images.mjs`, which **are tracked**: a clean checkout builds without the originals (`passionFruitPages.test.js` checks that every imported file is tracked and that the data imports no JPG or PNG). Regeneration needs the originals in that folder and `sharp` (already a dependency of Next.js): `node scripts/passion-fruit-images.mjs`. Sources are found by name without extension (Unicode-normalized), so JPG or PNG makes no difference; output is ASCII-named WebP, quality 80, no metadata, never enlarged, colors untouched. The crop boxes in the script are the publication decisions.

Three kinds of image, told apart on the pages by their captions:

- **Documentary:** genuine photographs HMV supplied. They are the evidence of origin and handling.
- **Edited product imagery:** the golden fruit as presented for marketing. Inspected at full resolution on 2026-11-27: no text, logo, handwriting or competitor branding, golden fruit, no visible generation artifacts beyond slight smoothing; a black pouch at the edge of PF-04 (unbranded) is cropped out of the derivatives other than the whole scene.
- **Illustrative packaging imagery:** formats the fruit can be packed in, "subject to buyer requirements". Never presented as HMV packaging, a shipment, a grade or an offer.

Removing visible branding does not establish publication rights. For every edited image HMV is to confirm the source photograph, who edited it and the right to publish it.

| ID | Class | Decision | Derivatives and use |
|---|---|---|---|
| PF-01 | documentary | **Withheld, pending approval.** | none |
| PF-02 | documentary | **Withheld, pending approval.** | none |
| PF-03 | documentary | **Withheld, pending approval.** | none |
| PF-04 | edited product | **Used** (updated image), publication rights to be confirmed. The caption never reads a grade into the fruit. | `golden-fruit-scene` (Export collage), `golden-fruit-display` (Export quality, Retail hero), `golden-fruit-on-tree` (Export orchard and conversion band), `golden-fruit-cluster` (Foodservice hero), `golden-fruit-pile` (Foodservice ingredient, Retail presentation), `golden-fruit-halved` (Foodservice culinary), `fruit-protective-nets` (Retail packaging) |
| PF-05 | illustrative packaging | **Used** (updated image), publication rights to be confirmed. Caption: a packaging presentation reference, not HMV packaging. | `carton-twelve-compartments` (Export collage and packing, Retail hero inset and packaging) |
| PF-06 | documentary | **Used**; the caption says the fruit is still green. | `vine-green-fruit` (Export collage and orchard) |
| PF-07 | documentary | **Used as a fruit-only crop**: the frame holds sorted fruit on a tarpaulin and no person, hand or background, because the permission to publish people in the photograph is pending. | `manual-sorting` (Export collage and sorting, Retail origin) |
| PF-08 | documentary | **Used.** | `orchard-trellis` (Export orchard, Foodservice origin) |
| PF-09 | documentary | **Withheld, pending approval.** | none |
| PF-10 | illustrative packaging | **Used** (updated image: plain cartons, nothing printed), publication rights to be confirmed. The fruit is shown lime-green and the caption says so. | `neutral-packaging-cartons` (Export and Retail packaging), `neutral-carton-fruit` (not used in a page today) |

Not used anywhere: purple fruit, generated hospitality scenes, stock images, any logo other than the site's own. No image shows or invents an HMV wordmark or a leaf logo.

### Future media

`culinary.media` in `passionFruitPages.js` (`[]` today) takes approved hospitality photographs, `{ photo, caption }` each; nothing is shown while it is empty. `passionFruitMedia.js` is where an approved packaging or studio photograph replaces a derivative. Sections that still want dedicated photography: Foodservice applications (a resort beverage, a hotel breakfast, a dessert, a bartender at work), Foodservice culinary inspiration, Retail packaging (HMV's own cartons once designed), and the Export orchard and sorting (more documentary photographs of HMV's own visits once approved: PF-02, PF-03, PF-09). The brand film "Qua Bao Đôi Tay" gets a player when it exists, not before.

## 5. Inquiry flow, units and CRM compatibility

- The Trade Desk opens from `TradeDeskButton` with `product="passion-fruit"`, a `source` (`pf_export_hero`, `pf_export_specs`, `pf_foodservice_hero`, `pf_foodservice_specs`, `pf_foodservice_cta`, `pf_retail_hero`, `pf_retail_cta`) and a **`segment`** (`export`, `foodservice`, `retail`): the product is known and the conversation starts at the destination, then asks the volume in the segment's words (Export: import; Foodservice: "does your hospitality or beverage business require"; Retail: distribute; Vietnamese in `copy.js` `askVolumeFor`). Opening the desk on another segment's page starts a new conversation. `segment` is never sent to analytics or in the inquiry.
- Export's form is `QuickRfq` with `product="passion-fruit"` and `segment="export"` (`source="pf_export"`), mounted once; the hero's primary call to action is `focusQuickRfq()`; the desk it opens keeps the segment.
- **Payload contract unchanged.** `POST /api/inquiry` keeps its fields (`idempotencyKey`, `locale`, `product`, `destination`, `volume`, `application`, `transport`, `requirements`, `notes`, `contact`, `consent`, `context`, `website`); `tests/next/passion-fruit.spec.js` pins the key set. There is no segment field: the segment is read downstream from `context.page` (the page's own URL, different per segment; it is the record's `source.page`), the landing page and the referrer. Nothing is overloaded into `company`, `destination`, `volume` or `productName`. Incoterms are not asked. Purchasing frequency has no field; it is part of the unit where the contract already puts it (`containers / month`), now also `kg / week` and `kg / month`.

### Kilograms

The volume is `{ amount: string, unit: id }`; the amount is free text (a number, `0.5`, `2,000`), validated by `AMOUNT` (now also at least one non-zero digit: no quantity is none), the unit one of `VOLUME_UNITS`. Three ids were added, `kg`, `kg_week`, `kg_month`, offered by `unitsFor(product, segment)` in `src/features/trade-desk/rules.js`:

| Where | Units, default first |
|---|---|
| Foodservice, Retail (desk and any form given the segment) | `kg`, `kg / week`, `kg / month`, `MT`, `MT / month` |
| Export (desk and Quick RFQ) | `containers`, `containers / month`, `MT`, `MT / month`, `kg` |
| Everything else: the home Quick RFQ, passion fruit without a segment, every other product | the four units of before; dried cassava chips still starts at `MT / month` |

The quantity keeps its meaning end to end: a kilogram is sent as `kg`, never converted to a decimal ton. The server refuses a kilogram unit for any product but passion fruit (`400 volume.unit`) instead of reading it as containers. The same holds for any unit the contract does not know: it is `400 volume.unit` (before this PR the server read it as containers, so "5 tons" could become "5 containers"); only a missing or empty unit is the default. Labels are localized (`kg / tuần`, `kg / tháng`). Illustrative quantities (50 kg a week, 200 kg a month, 10 MT a month, 2 containers a month) are examples, not a minimum order, a price or a supply commitment; the pages say none.

**Delivery paths.** Production is `INQUIRY_DELIVERY=webhook` (n8n, then the Google Sheet): the record carries the volume as one English text (`toRecord`: `"50 kg / week"`), so **no n8n node, mapping or sheet column changes are needed** for kilograms, provided the sheet's volume column is text (it takes `"5000 MT / month"` today; to be confirmed by whoever owns the sheet, not changed here). The CMS adapter (`INQUIRY_DELIVERY=cms`, not used in production) sends `volume.unit` as an id, and the CMS's own contract (`CMS_HMV/backend/src/modules/trade-inquiries/inquiry-contract.ts`, read-only from here) refuses an id it does not know (`unknown volume unit`, 502 for the buyer). **Do not switch to the CMS before it has the three ids.** The exact change there, in the same release (the website's rule): in `VOLUME_UNITS` add `kg: 'kg'`, `kg_week: 'kg / week'`, `kg_month: 'kg / month'`, and in its spec a shared test vector with a kilogram inquiry.

Test payloads (mocked; nothing was sent to production): `{"product":"passion-fruit","destination":"Da Nang, Vietnam","volume":{"amount":"50","unit":"kg_week"}, …}` delivers `volume: "50 kg / week"` to the webhook record; `{"product":"dried-cassava-chips","volume":{"amount":"5","unit":"kg"}, …}` is `400 volume.unit`; `{"volume":{"amount":"0","unit":"kg"}, …}` is `400 volume.amount`.

Rollout and rollback: the website change is backward-compatible (old clients send only old ids, which still pass), so it ships on its own for the webhook path. Rollback is reverting the website PR; inquiries already stored with a kilogram volume remain valid text in the sheet. For a later move to the CMS: add the ids to the CMS first, deploy it, then switch delivery; to roll back, switch delivery back to the webhook.

n8n and Google Sheets were not touched and no inquiry was sent to production: end-to-end checks used `page.route` mocks (201 with a reference, 503) and unit tests; the local build has no delivery adapter (`INQUIRY_DELIVERY` empty, 503).

## 6. Open items

Business information: the golden passion fruit specification (size, weight, Brix, grade, packaging, storage, shelf life, season); whether the sheet's volume column accepts text such as "50 kg / week"; HMV-branded packaging or private label; certification documents (holder, scope, validity, permission) before any badge; the relationship with the growing areas shown; the CMS unit ids if the CMS becomes the system of record.

Approvals: the source and the right to publish PF-04, PF-05 and PF-10; PF-01, 02, 03 and 09 (above); the permission to publish the people in the PF-07 photograph, if the full photograph is ever to be used (only the fruit-only crop is).

Media: hospitality and culinary photography; studio photography; HMV's own packaging; larger originals (all thirteen derivatives are source-limited, IMAGE_ASSET_DEBT.md).

Design: final visual approval is pending; the review screenshots are local (`review-artifacts/passion-fruit-final/`, untracked); the Linux baselines are generated in the pinned Docker image, never on Windows.

## 7. Supplier confidentiality

HMV Global is the single commercial point of contact between its supply network and its buyers: the rule is in `AGENTS.md` and applies to every product. The detailed incident record, the history remediation and the media decisions that name individual source files are kept privately, not in this repository.

### Prevention

- **Source media stays local.** The supplied photographs and the design reference are kept on the machine, untracked and ignored (`.gitignore` lists `src/assets/passion-fruit/*`, `src/assets/products/*` source images and `specs/references/*`). The site imports only sanitized WebP derivatives generated by a script (`scripts/passion-fruit-images.mjs`): cropped or edited without supplier marks, ASCII names, no EXIF or GPS.
- **`npm run lint` fails on a protected file.** `scripts/check-protected-assets.js` checks everything Git tracks (so also what is staged) against an allowlist: the only raster files allowed are the visual baselines, the favicon and the Open Graph image; source photographs, private design references and office, PDF or archive files are refused. A new approved public raster file is added to the allowlist in a reviewed change.
- **Stage by explicit path.** With private source files in the working tree, never use `git add .`, `git add -A`, `git add -u` or a bare directory such as `git add src`: list the paths (`git add src/features src/data`), then read `git status` and `git diff --cached --name-only` before every commit. A file that Git ignores can still be force-added: the lint check is the backstop, not the habit.
- **Public output is audited.** Derivatives are inspected for supplier names, logos, telephone numbers, e-mail and web addresses, QR codes, barcodes, labels, documents, faces and metadata; a photograph that cannot be cleaned is withheld. The Next and Vite builds, the sitemap, structured data and public files are checked for supplier identifiers and source files.
- **Public copy stays at country level and HMV-centered.** Pages say "growing areas in Vietnam", never a supplier, a farm, a facility or a precise place, and never that HMV owns one; every call to action is the Trade Desk, the Quick RFQ or an HMV channel. `src/data/unsupportedClaims.js` guards ownership, customers, certification and capacity wording, and a test applies it.

### Trade Desk

The desk is a controlled conversation (product, destination, volume, contact) and holds no supplier data. A buyer who asks who grows or supplies the product, or for a grower's, farm's or factory's contact or address, receives HMV's answer ("HMV Global coordinates sourcing and commercial communication through our supply network. Please share your requirements, ...") and is asked again for the requirement; a request for traceability or compliance documents is answered with how HMV's commercial team provides them. English and Vietnamese. Nothing that must be disclosed is denied: such requests go to HMV's commercial team (controlled process, `rules.js` `asksForSupplier`, `asksForTraceability`).

### Future CMS and CRM requirements (not built here)

Separate public product information (approved descriptions, specifications, images, applications, HMV's commercial contacts) from internal supplier information (identities, contacts, locations, purchasing prices, contracts, procurement notes, traceability records). The internal part belongs behind authenticated, server-side authorization, never in a public CMS endpoint, a public JSON file or a client bundle, with an audit trail for access; traceability or regulatory disclosure is released only by the commercial team through a controlled process. Hiding an element in the page is not a boundary.
