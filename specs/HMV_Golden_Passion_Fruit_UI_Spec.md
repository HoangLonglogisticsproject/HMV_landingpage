# HMV GLOBAL — Golden Passion Fruit
## UI implementation specification · Export / Foodservice / Retail Business

**Status:** Approved strategic direction; implement on a feature branch, then review screenshots before merge.  
**Scope:** English and Vietnamese, fresh golden/yellow passion fruit, three B2B segments.  
**Design principle:** Quiet Luxury Agriculture — authentic origin, refined presentation, commercially useful content.  
**Brand:** HMV Global only. Do not create a new logo, a standalone consumer brand, or a new site.

## 1. Source of truth and scope precedence

This specification supersedes earlier suggestions to add individual consumers, consumer checkout, or one generic page for all buyer types. It expands the previously approved Passion Fruit UI, not a redesign of that approved page. Use the original approved reference with the official blue globe HMV Global logo, not the rejected concept with a leaf logo. The approved mockup and current production code take precedence over speculative pixel-level design details in this document. If the reference is not available in the repository or attachments, preserve the existing page composition and report the missing reference; do not substitute a new hero or claim visual parity.

Reuse the current global header, navigation, footer, existing localized product infrastructure, Trade Desk/Quick RFQ, typography, SEO utilities, design tokens, and inquiry API. Keep changes isolated from Cassava and other products. Audit the current implementation before writing code. Use the provided 10 original photographs in `assets/` (see §7); reuse previous real videos only if they are already available and their contents have been checked. Do not use the purple passion fruit as a substitute for the golden product shown in these materials.

No consumer storefront, direct-to-consumer funnel, cart, checkout, consumer account, payment system, retail prices, new ecommerce backend, or processed product catalog. Consumer-facing editorial content may build awareness for partner businesses, but all commercial CTAs target businesses.

## 2. Route and information architecture

Preserve the existing indexed product URLs, subject to repository verification. Make the current product page the Export/default entry (rather than creating duplicate Export pages). Build two additional segment pages. Proposed localized routes:

| Segment | English | Vietnamese |
|---|---|---|
| International Buyers / Export (default) | `/products/passion-fruit` | `/vi/san-pham/chanh-day` |
| Foodservice | `/products/passion-fruit/foodservice` | `/vi/san-pham/chanh-day/khach-san-nha-hang` |
| Retail Business | `/products/passion-fruit/retail` | `/vi/san-pham/chanh-day/doi-tac-ban-le` |

Reconcile proposed new paths with the existing router, canonical rules and locale mapping. Report final paths. Do not create a duplicate `/export` page or redirect established product URLs. Existing supported locales outside EN/VI must not break; do not publish empty or machine-translated locale pages. Any alternate aliases must follow the established canonical/redirect policy.

Add a shared Passion Fruit segment navigation after the approved hero (or in the existing first suitable location above detailed sections): **International Buyers | Foodservice | Retail Business** / **Xuất khẩu | Khách sạn & F&B | Đối tác bán lẻ**. Use semantic links with an active indication; deep links, refresh, keyboard navigation, back/forward, and language switching must work. The new pages must have their own URL, content, metadata, H1 and CTA, not a client-only tab hiding essentially identical copy. Do not add a second corporate header or new global product category. On mobile use an accessible wrapped three-option navigation without page overflow; do not add a second fixed launcher.

## 3. Shared visual direction

The golden fruit is the product hero, not metallic luxury decoration. The parent brand remains recognizably HMV.

- HMV Deep Blue `#102D43`: corporate anchor; reconcile with the existing approved tokens.
- Botanical Green `#193D2C`: farm and foodservice accents.
- Golden Harvest `#D8B94F`: restrained fruit-inspired detail, not body text on light backgrounds.
- Natural Cream `#F3EFE3`: premium neutral canvas, particularly on the new pages.
- Use the existing body font and a refined editorial heading treatment using existing font capabilities. Avoid adding a font dependency without clear benefit. Use proper Vietnamese diacritics and line height.
- Reuse the approved responsive grid/container; editorial image/text layouts, large real photographs, restrained borders, generous whitespace and subtle transitions. No excessive gold, glassmorphism, glossy gradients, heavy shadows, gimmicky counters, or decorative animation. On desktop, maintain readable copy widths; on mobile stack layouts in meaningful reading order.
- Use official logo unchanged, with original proportions, colors, and sufficient contrast. No new HMV Signature logo. Golden Passion Fruit is a product descriptor; any future HMV Signature label requires separate commercial approval.
- Shared component ideas (adapt to repository naming): `PassionFruitSegmentNav`, `PassionFruitHero`, `OriginEvidence`, `ProductSpecification`, `SegmentApplications`, `PackagingEvidence`, `PartnerCTA`, and a shared product fact source. Extract shared UI only where helpful. Localize content through existing data/translation architecture; avoid duplicating whole page code per language. Do not force the original approved hero into a new component if doing so creates unnecessary visual regression.

## 4. Page A — International Buyers / Export

**Design character:** Premium agricultural export, documentary authenticity, commercial credibility. Deep Blue is the dominant corporate accent, balanced with farm green and actual golden fruit.

**H1 direction:** `Fresh Golden Passion Fruit from Vietnam` / `Chanh dây vàng tươi từ Việt Nam`. Confirm the product label with the existing approved data; do not alter any shared identifier or product slug. Keep the approved hero hierarchy, proportions, photo-led composition and accessible Quick RFQ above the fold. Do not cover the farm imagery with a large form. Keep the existing proof strip only with verified content. Do not blindly replace sections already approved; reconcile the following intended reading order with the approved mockup.

| Section | Desktop treatment | Copy/action and assets |
|---|---|---|
| Hero / The Golden Harvest | Approved photo-led hero; keep existing crop/CTA placement unless necessary for accurate product imagery | Actual orchard wide shot `PF-08` and golden fruit `PF-04` where the approved layout allows. Primary `Request a Quotation` / `Yêu cầu báo giá`; secondary origin anchor. |
| Choose your market | Shared three-route segment selector | International Buyers active; direct links to other two pages. |
| Product overview | Fruit close-up with clear short copy | Fresh whole golden passion fruit; `PF-04`. No nutritional or sensory guarantee without evidence. |
| Origin & orchard | Wide documentary image plus two supporting details | `PF-08`, `PF-06`; use farm-visit images `PF-02`/`PF-03` only after publication approval. Explain sourcing and visits accurately, not farm ownership. |
| Quality & selection | One large documentary photograph with explanatory text | `PF-07` manual fruit sorting; `PF-09` plot sign only if approved. State what the picture actually shows. |
| Product specifications | Clear accessible table; not a large dashboard | Confirmed product form and verified origin; add variety, size/weight range, Brix, grade, shelf life, seasonality, availability, pack sizes, storage and documentation only from approved records. No invented metrics. CTA `Request Product Specifications`. |
| Packaging & trade formats | Two-column or controlled gallery with captions | `PF-05`, `PF-10`, and `PF-04` as examples of individually separated/protected presentation, with third-party packaging clearly distinguished. No claim they are HMV-branded or currently available unless confirmed. |
| Supply & partnership | Restrained five-step commercial workflow | Requirements → availability/specification review → quotation and agreed terms → order coordination → delivery arrangements. No fixed capacity, shipment or customs guarantees. `PF-01` only if its connection is verified. |
| Buyer resources / FAQ | Use existing content system and real published links | Answer sourcing, specifications, destination, samples and packaging inquiries within confirmed capabilities. Omit unpublished resources rather than create empty articles. |
| Final CTA | Refined corporate band, clear business conversion | `Discuss Your Import Requirements` / `Trao đổi nhu cầu nhập khẩu`; reuse Trade Desk. |

Buyer requirements of interest: destination, volume and unit, required specifications, requested packaging, frequency, company/contact. Keep initial inquiry short and collect remaining details in supported follow-up.

## 5. Page B — Foodservice & Hospitality

**Design character:** Editorial hospitality; a golden fruit used to create memorable food and beverage experiences. Forest Green + Natural Cream, fruit-yellow accents. Elegant imagery, warmer light, less warehouse imagery and fewer data cards than Export. This page is for purchasing managers, F&B directors, chefs, beverage developers, hotels/resorts, restaurants, cafés and drink chains. Do not imply actual customers or hotel partnerships.

**Hero target composition:** split editorial layout on desktop (copy roughly 40–45%, visual 55–60%); generous vertical spacing; a restrained gold eyebrow `HMV GOLDEN PASSION FRUIT / FOODSERVICE`; headline `An Exceptional Ingredient. A Memorable Experience.` / `Nguyên liệu khác biệt. Trải nghiệm đáng nhớ.`; supporting copy: `Fresh golden passion fruit for hospitality, culinary and beverage businesses.` / `Chanh dây vàng tươi dành cho khách sạn, nhà hàng và doanh nghiệp đồ uống.` Main CTA `Discuss Your Supply Needs` / `Trao đổi nhu cầu cung ứng`; secondary `Explore Applications` / `Khám phá ứng dụng`. Keep fruit visible and avoid text over busy photographs. On mobile image and copy can stack, with primary CTA in the initial hero flow. These are proposed new-page design details, not a replacement for the approved Export hero.

**Important initial media limitation:** there are no actual hospitality, drink, chef or restaurant photos among the supplied ten files. Do not invent an HMV client, use unrelated stock footage as proof, hotlink arbitrary images, or pretend a generated drink photo is actual HMV output. Build the launch layout with a strong crop of `PF-04`/`PF-08` and text-based application panels if approved application photos are unavailable. Do not ship broken placeholders. Prepare optional image slots and an asset wish list; insert approved illustrative photography later and caption as serving inspiration, not existing partnerships. Do not recolor purple fruit to yellow or alter product appearance.

| Section | UI treatment | Content & behavior |
|---|---|---|
| Hero | Editorial split / future culinary hero | Primary inquiry; secondary application anchor. |
| Segment navigation | Shared component | Foodservice active. |
| Ingredient with character | Large fruit image and concise copy | `PF-04`, describe fresh whole fruit; no invented tasting claims, nutrition, Brix or yield. Link specifications. |
| Crafted for hospitality | 2×2 visual/text application grid; use only approved media | Hotels & Resorts (welcome beverages/breakfast); Restaurants & Fine Dining (sauces/desserts); Bars & Mixology (mocktails/cocktails); Cafés & Beverage Businesses (juices, seasonal menu). These are possible uses of fresh fruit, not items sold by HMV. |
| Culinary inspiration | Editorial wide photo when available; initially a compact text section | Examples of menu ideas; no claims about existing customers or finished beverages. |
| Meet the origin | Documentary image with restrained narrative | `PF-08`/`PF-06`; link to Export origin/quality evidence; do not repeat long evidence gallery. |
| Professional supply | Three concise information blocks | Discuss required volume (kg or supported units), delivery location, usage and purchasing frequency; ask about packaging, availability and specifications. No promise of recurring delivery unless verified. |
| FAQ & partner CTA | Focused on business procurement | `Become a Foodservice Partner` / `Trở thành đối tác F&B`; Trade Desk. |

Future hospitality media shot list: whole yellow fruit/cut fruit macro, hotel-style breakfast fruit setup, elegant mocktail with visible golden fruit, bartender using fresh fruit, chef preparing dessert, and a short cinematic sequence from orchard to serving. These are proposed production tasks, not existing evidence. No separate chef portal, restaurant reservations, ordering or recipe commerce.

## 6. Page C — Premium Retail Business

**Design character:** Refined fresh produce presentation; clean cream background, deep blue text and restrained golden accents. Premium product detail and packaging take precedence over farming landscape, while actual origin is still accessible. Audience: supermarkets, gourmet grocery, specialty fruit shops, produce distributors and gift-box businesses. Not an individual shopper.

**Hero target composition:** balanced editorial split, fruit/packing photograph on one side and concise copy on the other; avoid ecommerce price badges. Eyebrow `HMV GOLDEN PASSION FRUIT / RETAIL BUSINESS`; headline `Distinctive Fruit. Distinguished Shelves.` / `Trái cây khác biệt. Giá trị tại điểm bán.`; supporting copy: `Fresh golden passion fruit for retailers and distributors who value product presentation and origin.` / `Chanh dây vàng tươi dành cho đối tác phân phối và bán lẻ chú trọng hình thức sản phẩm và nguồn gốc.` Main CTA `Discuss a Retail Partnership` / `Trao đổi hợp tác phân phối`; secondary packaging anchor. Use `PF-04` as initial hero when third-party pack imagery is not cleared. Do not falsely show an HMV pack.

| Section | UI treatment | Content & behavior |
|---|---|---|
| Hero | Product-led editorial layout | Fruit image, partnership CTA. |
| Segment navigation | Shared component | Retail active. |
| Product presentation | Large fruit photo; compact product facts | `PF-04`; observed color and whole-fruit format; verified grade details only. |
| Packaging inspiration / formats | Side-by-side detail photography | `PF-05` (12 compartments shown in image, not an approved sellable SKU); `PF-10` (third-party presentation, permission required); `PF-04` (protective nets). Caption precisely. |
| Retail opportunities | Three text/visual blocks | Premium grocery/supermarkets, specialty fruit retailers, distributors/gifting businesses. No logos or retailer names without permission. |
| Origin and quality | Compact farm/selection story | `PF-08`, `PF-07`; link Export specifications and origin evidence. |
| Commercial partnership | Simple content blocks | Discuss quantities, packaging needs, product availability, purchasing frequency, delivery arrangements and approved brand/private-label possibilities only if supported. |
| FAQ & final CTA | Business-focused | `Become a Retail Partner` / `Trở thành đối tác bán lẻ`; Trade Desk. |

Do not implement product variants, fixed case packs, shelf-life guarantees, retailer margins, inventory, pricing, online checkout or HMV private-label claims without confirmed commercial data. Any future HMV-branded box is a separate design/production workstream; do not digitally replace third-party logos to fabricate evidence.

## 7. Original media manifest

The accompanying asset folder contains the original ten files under their original filenames. These photographs are evidence/reference, not proof of all claims suggested by their filenames or signs. Asset IDs are stable labels for the implementation report, not product IDs. Use descriptive ASCII output filenames for optimized derivatives if consistent with the repository conventions. Preserve originals and EXIF privately; strip unnecessary public metadata from web derivatives. Obtain approval for identifiable people, third-party branding, facilities and public disclosure of farm/contact details before publishing. Do not manipulate documentary details to imply an operation is HMV-owned. Where approved, use framing that avoids direct third-party contact details; otherwise withhold the image.

| ID | Original filename | Visible content | Suggested placement / publication guard |
|---|---|---|---|
| PF-01 | `ảnh nhà máy 2.jpg` | Group inside industrial facility with storage racks and machinery | Export evidence only if relation to passion fruit chain is verified; otherwise omit. |
| PF-02 | `ảnh vùng trồng 1.jpg` | People speaking beside golden passion fruit growing-area signage | Export sourcing visit, subject to consent, partner disclosure approval, and no certification claims inferred from sign. |
| PF-03 | `ảnh vùng trồng.jpg` | Two people beside growing-area sign | Export visit gallery; same approval as PF-02; avoid exposing supplier contact details without permission. |
| PF-04 | `chanh day 2(2).jpg` | Yellow fruits, cut fruit, protective nets and display boxes; handwritten size markings | Shared product photography, Export/Retail and initial Foodservice; do not treat handwritten markings as validated grading. |
| PF-05 | `chanh day 4(2).jpg` | Open carton with twelve individually separated yellow fruits bearing another label | Packaging example for Export/Retail; no HMV packaging ownership claim. Approval before display of third-party label. |
| PF-06 | `chanh dây farming 2(2).jpg` | Close-up of green fruits growing on vine | Origin/cultivation evidence across pages. Caption immature-looking fruit on vine without asserting maturity stage beyond what is visible. |
| PF-07 | `chanh dây organic(2).jpg` | People manually sorting many greenish/yellowish fruits | Export selection evidence; optional compact Retail origin section; filename does not establish organic certification. |
| PF-08 | `chanh dây tại farm(2).jpg` | Wide horizontal image of fruits and trellis at growing area | Primary documentary orchard asset for Export and origin links on other pages; preserve natural colors. |
| PF-09 | `farming field(2).jpg` | Person holding a plot sign with a tree count | Optional farm management context, approval required; sign is not verification of total trees, yield or contracted capacity. |
| PF-10 | `hữu cơ 1(3).jpg` | Another company's branded passion fruit boxes with individually protected fruit | Retail/Export packaging reference only, if rights approved; no HMV branding or organic claim. |

Do not force every image onto the published page. Use the strongest appropriate approved assets. Do not publish photos of third-party packaging as an official HMV pack. The grower signage refers to USDA/EU/JAS organic standards and GLOBALG.A.P. assessment; it is not a certificate. Do not show certification badges, claim organic certification or imply compliance until actual certificates, holder, scope, product/lot, validity and permissions are verified. Keep a private pending-evidence register rather than exposing internal details on public pages.

## 8. Trade Desk, RFQ and CRM

All three pages must route into the existing product-aware B2B flow. Preserve chat-first experience, existing Quick RFQ launcher, product identifier, validation, idempotency/reference generation and production API. No Incoterms question in initial flow; discuss commercial terms later. Use actual localized page as `sourcePage`, existing `referrer` behavior, and product preselection only through supported mechanisms. If supported, prefill buyer segment using an existing typed field. If no such field exists, keep segmentation in page/CTA context and derive source segment downstream from `sourcePage` if needed; do not send arbitrary fields or misuse `company`, `destination`, `volume` or `productName`.

Existing n8n → Google Sheets lead pipeline must remain compatible. Inspect the current schemas, do not assume external n8n credentials/access. No production workflow or sheet modifications without coordinated approval. Business buyers provide genuine company, destination and quantity (existing requirements); support kilograms or smaller business quantities only when existing UI/schema can validate them. If an improvement requires modifying units or frequency fields, document the coordinated contract change and do not silently change current behavior. Test in a safe/staging environment or mock the endpoint; avoid submitting fake leads to production CRM. Record which checks are actual end-to-end tests versus code/mocked checks. No secrets or webhook URLs in client bundle, screenshots, PR or report.

## 9. SEO & content architecture

Maintain published product route/indexing and existing SEO architecture. Add unique localized titles/descriptions and canonical for each real new route; use existing `www` canonical convention if confirmed. Hreflang should map only actual published equivalent pages, be reciprocal, and follow current locale policy. Preserve structured data behavior and avoid fake offers, reviews, certification or price. One descriptive H1 per page, logical H2/H3, semantic links, accurate alt text and sitemap inclusion only for completed indexable pages. Verify language switching, OG metadata, breadcrumbs and navigation. Do not create thin pages, duplicate Export content or automatically generate article routes. Cross-link related segments, origin, product specifications and future Journal content only when real routes exist.

Suggested titles (localize naturally, adjust to confirmed brand/product terminology):

| Page | EN | VI |
|---|---|---|
| Export | Golden Passion Fruit Supplier from Vietnam \| HMV Global | Nhà cung ứng chanh dây vàng Việt Nam \| HMV Global |
| Foodservice | Golden Passion Fruit for Hotels & Foodservice \| HMV Global | Chanh dây vàng cho khách sạn, nhà hàng & F&B \| HMV Global |
| Retail | Golden Passion Fruit for Retail Businesses \| HMV Global | Chanh dây vàng cho đối tác bán lẻ \| HMV Global |

Do not claim SEO search volumes or ranking outcomes. Future editorial clusters: orchard stories, product quality, golden fruit usage, hospitality beverage ideas and premium retail presentation. B2C awareness is a content distribution goal only, not consumer ecommerce. Future brand film “Qua Bao Đôi Tay” may be embedded via approved media component once available; avoid shipping a nonfunctional player.

## 10. Performance, accessibility and acceptance testing

- Use the current image optimization pipeline, responsive sizes, correct aspect ratios and explicit image dimensions. Preserve natural fruit color. Hero image prioritized only where appropriate; lazy-load below fold; no unnecessary video or duplicate preload. Respect reduced motion; no autoplay audio. Preserve original asset files separately. Avoid horizontal scrolling, especially in Vietnamese and on 360–390px layouts.
- Accessible headings, landmarks, visible focus, descriptive links, alt text, keyboard use, contrast and tap targets. Ensure selector and CTAs work with JS/client hydration and routing conventions. Check launcher overlap; keep existing global launcher unchanged unless a scoped issue requires a clearly documented adjustment.
- Capture full-page and viewport screenshots of all three segment pages in EN and VI on desktop and mobile; verify tablet too. Compare Export against approved mockup/current accepted baseline. Review visual changes rather than bulk-accepting snapshots. Keep unrelated product snapshots unchanged. Test link navigation, locale switch, RFQ context/sourcePage, API validation compatibility, and error handling. Run existing lint/build/test/visual/SEO checks available in the repo. Check no console errors or broken image requests. Report any unavailable tools or fixtures instead of claiming checks passed.

## 11. Implementation order and deliverables

1. Inspect repository, approved design and assets; identify actual routes/translation patterns, current RFQ contracts and missing evidence. Create a dedicated feature branch, suggested `feat/golden-passion-fruit-b2b-experiences`.
2. Implement Export/default using approved composition and genuine cleared assets. Introduce shared segment navigation and product-aware CTA behavior.
3. Implement Foodservice page with its own editorial experience. Launch with available cleared product/farm imagery; prepare optional hospitality slots without fake placeholders or partner claims.
4. Implement Retail page with product-led layout and packaging examples only when permission and attribution are clear. Otherwise keep a functional text section and approved fruit imagery.
5. Complete EN/VI localized copy, routing, SEO and responsive/accessibility checks. No new consumer commerce. Validate lead pipeline compatibility safely.
6. Submit a reviewable PR without automatically merging or deploying. Provide final route map, changed files, asset manifest (used/withheld and reason), screenshots, test/build results, RFQ/CRM check level, remaining data/asset approvals, and commit SHA/PR link. If approvals are missing, omit unsupported public claims/images and document them; do not block the rest of the build or invent replacements.

## 12. Non-blocking business/asset gaps

- Original approved UI screenshot and official logo source: use existing authorized source; attach approved screenshot if not in the repo. Do not recreate the logo.
- Verify actual golden passion fruit commercial grade, specifications, packaging offerings, storage/shelf life, supply quantities, delivery capabilities, farm relationship and certification documentation.
- Obtain image/publication permissions for farm partners, individuals, branded packaging and the industrial facility.
- Obtain approved hospitality/culinary imagery and future HMV packaging designs. No staged/generated media may be represented as actual operations or client work.
- Do not delay the build for these gaps; ship only factual and approved content, with honest reporting.

**Success:** the three pages feel like one HMV Global brand but answer three distinct B2B purchasing intents. Export communicates origin and trade confidence; Foodservice communicates ingredient applications and experience; Retail communicates product presentation and business partnership. Every inquiry flows through the existing commercial system. The approved Export UI remains recognizable and all three experiences are operational, localized and SEO-ready.
