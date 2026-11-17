# CSS architecture

`src/styles/hmv.css` is the site's layout and editorial stylesheet. `src/main.jsx` (Vite) and `src/next/Document.tsx`
(Next.js) import it after `index.css` (Tailwind and the design tokens). Since Phase 1 it is only an entry: comments and
an ordered list of `@import`s of the modules in `src/styles/hmv/`.

## Rules

1. **`hmv.css` holds no CSS rule.** `scripts/check-css-entry.js` (`npm run lint`, CI) fails on anything but comments and
   `@import './hmv/<module>.css';`, and on a module that is missing, imported twice, or not imported.
2. **New CSS goes into the module of its page or feature,** beside that feature's rules. A new page or feature gets a new
   module, imported where its rules must sit in the cascade (normally last). The numbers leave gaps for that.
3. **The import order is the cascade order.** Each module is one contiguous part of the former single file, in its
   original order. Several selectors are defined in more than one module (`.site-nav` in 00, 21 and 40, for example) and
   the later definition wins. Do not reorder the imports or move rules between modules without checking what wins.
4. **Responsive and reduced-motion rules stay beside their feature,** not in a central responsive file.
5. **Phase 1 kept everything:** duplicate selectors, unused selectors, `!important` and hard-coded colors are unchanged.
   Removing them is Phase 2, one verified change at a time.

## Modules

| Module | Contents | Lines of the former `hmv.css` (`main` at b29652f) |
|---|---|---|
| `00-legacy-foundation` | Base elements and the first site layout (header, hero, sections, footer, detail pages), its breakpoints and reduced motion | 1–1406 |
| `10-home-farm-journey` | Product photos, logo size, the scroll-driven farm journey hero | 1408–1829 |
| `11-home-farm-art` | The full-bleed farm art hero, featured origins | 1831–2325 |
| `12-home-commerce-motion` | Product card motion, QC reveal, origin inset, bento | 2327–2675 |
| `20-home-cinematic` | Cinematic homepage: hero, journey split, commodities, global reach | 2677–3138 |
| `21-home-daylight` | Daylight homepage, glass header, editorial hero, partner marquee, RFQ form | 3140–3755 |
| `22-mobile-insights-footer` | Phone polish, the phone drawer background, RFQ states, insights cards, premium footer | 3757–4081 |
| `30-articles` | Article reading layout, CMS rich content | 4083–4301 |
| `31-living-logistics` | The animated logistics map | 4303–4576 |
| `40-header-navigation` | Site header, language menu, dropdowns, tablet and phone drawer, mega menu columns, Trade Desk button | 4578–5370 |
| `41-privacy-contact` | Privacy notice, Trade Desk card on Contact | 5372–5423 |
| `50-supply-chain` | Supply chain pillars, compliance banner | 5425–5984 |
| `51-compliance` | Compliance documentation layout | 5986–6869 |
| `52-packaging-logistics` | Packaging and freight logistics page | 6871–7429 |
| `53-logistics-dropdown` | The header's logistics text dropdown | 7431–7557 |
| `54-logistics-hub` | Logistics hub page | 7561–8282 |
| `60-about` | About: vision, mission, values, leadership | 8284–8720 |
| `61-logistics-in-action` | Logistics photo grid, supply chain stage photo | 8722–8825 |
| `62-regulations` | Regulatory library, CMS status message | 8826–8941 |
| `70-product-pages` | Product buyer pages: hero, evidence panel, tables, gallery | 8943–9416 |
| `71-supply-evidence` | Cassava supply evidence and its photo preview | 9418–9597 |
| `80-trade-desk` | HMV Trade Desk | 9599–10351 |
| `90-scoped-cassava` | Page-scoped Chinese and Korean cassava pages and their header | 10353–10502 |
| `91-tapioca-market` | Korean tapioca market page | 10504–10823 |

## Build

Vite inlines the imports; its CSS bundle is byte-identical to the single file's. For Next.js, `@tailwindcss/postcss`
now processes `hmv.css` (it skips CSS without `@import`) and inlines the modules with one more Lightning CSS pass: the
minified chunk has the same size and rule order, and one rule (`.log-title-gradient`) lists two independent declarations
in the other order.

## Phase 2 backlog

Each item needs a visual check (the D-14 baselines and the widths the change touches); removing a selector also needs a
DOM check that no page, state or CMS content uses it.

| Candidate | Where | Why |
|---|---|---|
| Duplicate selectors: 97 defined more than once in the same context, 74 of them across modules (`.site-nav` ×3, `.product-item` ×3, `.wordmark` ×3, `.journey-step` ×3, `.hero-inner`, `.section-pad`, `.nav-inner`, `.brand-logo`) | 00, 10, 11, 12, 21, 40 | Successive homepage generations override each other; merge into the winning values |
| Header rules in five modules (legacy `.nav-links`/`.nav-open`, glass header, phone drawer background, the current header, logistics dropdown) | 00, 21, 22, 40, 53 | The current header depends on overrides spread across the cascade |
| Older homepage generations (farm journey, farm art, cinematic, daylight) | 10, 11, 12, 20, 21 | Many of their classes no source file names (`.farm-journey`, `.cine-*`, `.journey-*`); the current homepage may use a few |
| 186 of 665 classes no source file names (string search; dynamic and CMS class names are not seen), 71 of them in compliance | 51, 11, 00, 40, 52, 12, 20 | Dead CSS candidates: `.compliance-*`, `.supply-mega-panel`, `.logistics-mega-panel`, `.mega-col*`, `.nav-links`, `.nav-contact` |
| 92 `!important` (47 in the header, 22 in supply chain) | 40, 50, 54 | Specificity fights, including with the scoped header; Sonar S9423 |
| Hard-coded colors (`#ffffff` ×54, `#00297b` ×28, `#0f172a` ×28, `#e2e8f0` ×19) | 40 onward | Repeat the design tokens' values; candidates for `var(--…)` |
| 11 width breakpoints (1100, 1080, 1043, 1024, 1000, 900, 860, 820, 700, 640, 600) | all | Near-duplicates (1100/1080, 1043/1024/1000, 900/860, 700/640); 1043 is deliberate (the header row's width) |
| Sonar bugs: generic font family missing (S4649 ×12), `r: 5.5` in `@keyframes` (S9424 ×5) | 21, 22, 30, 62, 20; 31 | Font fallbacks change rendering when a web font is missing; `r` is valid in Chromium but not standard CSS |
