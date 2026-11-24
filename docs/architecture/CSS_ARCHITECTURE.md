# CSS architecture

HMV is styled with **Tailwind CSS 4**. The site also carries a large legacy stylesheet from before Tailwind. Phase 1
split it, without changing the cascade, into ordered modules: a transitional boundary that lets the legacy CSS be
migrated to Tailwind feature by feature and then deleted. The modules are not the target architecture.

## Layers

### A. Tailwind and the design system: the default for new work

`src/styles/index.css` owns only what is truly global: `@import 'tailwindcss'`, the HMV design tokens (`:root`), their
mapping to utilities (`@theme inline`: `bg-brand`, `text-ink`, `bg-surface`…), the base and global rules, and the brand
primitives shared site-wide. It is not the place for a feature's rules.

New React UI uses Tailwind utilities in the JSX or TSX:

```jsx
<div className="flex items-center gap-6">
```

not a new rule such as `.some-new-layout { display: flex; align-items: center; gap: 24px }`. Class names are composed
with `cn()` (`src/lib/utils.js`: clsx and tailwind-merge); CVA (`components/ui/button.jsx`) only where a set of variants
is genuinely reused.

### B. Legacy modules: transitional

`src/styles/hmv/*.css` is the former 10.8k-line `hmv.css`, extracted mechanically. The modules exist so the legacy CSS
can be understood, tested, migrated in small steps and removed safely, not to grow more global CSS.

The legacy CSS is unlayered, and Tailwind emits its utilities inside a named layer (`@layer utilities`). For normal
author declarations, unlayered CSS has higher cascade-layer precedence than declarations inside named layers, regardless
of selector specificity. An ordinary Tailwind utility may therefore not override a conflicting legacy property until that
legacy declaration is removed. This concerns normal declarations only: `!important` declarations (whose layer order is
reversed), inline styles, animations, transitions and the other cascade origins follow their own rules.

The migration principle: do not stack ordinary utilities on top of conflicting legacy rules and hope specificity wins;
migrate the styling to utilities and remove the legacy rule.

### C. Entry

`src/styles/hmv.css` holds comments and the module imports only; `src/main.jsx` (Vite) and `src/next/Document.tsx`
(Next.js) import it after `index.css`. Its order stays the legacy cascade order until the modules are migrated.

## New code

> New pages and new components use Tailwind CSS 4 by default.

- A page that needs styling does not get a new global stylesheet. The Korean manufacturer pages to come
  (`/ko/tapioca-ethanol`, `/ko/tapioca-feed`, `/ko/tapioca-quality`), for example, are built from Tailwind utilities and
  reusable React components, not from a `92-tapioca-intent.css` of new global rules.
- The legacy modules are not extended with new features. A small fix to UI they already style can stay in its module;
  a larger change is the moment to migrate that part (Phase 3).
- When a new component genuinely needs authored CSS (below), prefer a small CSS Module colocated with the component or
  feature (`Component.module.css`) over feature rules in `index.css`. This is an escape hatch, not the default. Vite
  and Next.js both support CSS Modules without configuration. The first one, `views/products/CassavaProcurement.module.css`,
  holds a single class: the legacy element rules on `h1`–`h3` (weight; size and line height of `h2` and `h3`) are
  unlayered, so they beat any utility on a heading; the class sets those three properties to `revert-layer`, which
  hands them back to the heading's utilities. It goes once those element rules are migrated. The consolidation page
  (`Consolidation.module.css`), the Quick RFQ (`features/inquiries/QuickRfq.module.css`) and the homepage's trust strip and closing call to action (`views/home/sections/HomeSections.module.css`) each carry the same class. Both of the last two also use a doubled class (`.card.card`, `.afterStrip.afterStrip`) to outrank a legacy rule that no utility can (the `.rfq-form` padding and gap, the `.section-pad` padding), as `.site-nav.site-nav` does in `styles/index.css`.
- Nothing new goes into `hmv.css` or the legacy modules.

## When authored CSS is right

The target is not "zero CSS". It is **Tailwind-first, with scoped authored-CSS exceptions, not one growing global
stylesheet**: utilities for ordinary component and layout styling, authored CSS only where it is the clearer or the
necessary solution.

**Scoped, in a colocated CSS Module:** CSS that belongs to one component or feature:

- complex pseudo-elements whose utilities would be unreadable;
- complex `@keyframes` tied to one feature, and the `prefers-reduced-motion` rules for them;
- selectors that utilities cannot reasonably express.

**Global, in `index.css`:** only styling that is itself global:

- design tokens, `@theme` and base styles;
- global locale rules (`:lang(…)`: fonts, line breaking);
- CMS rich-text descendants, such as `.article-body h2`, when the markup comes from the CMS and cannot carry utilities;
- third-party, Radix and browser or platform overrides where scoping is impractical.

## Rules for the legacy modules

1. **`hmv.css` holds no rule.** `scripts/check-css-entry.js` (`npm run lint`, CI) fails on anything but comments and
   `@import './hmv/<module>.css';`, and on a module that is missing, imported twice, or not imported.
2. **The import order is the cascade order.** Each module is one contiguous part of the former single file, in its
   original order. Several selectors are defined in more than one module (`.site-nav` in 00, 21 and 40, for example) and
   the later definition wins. Do not reorder the imports or move rules between modules without checking what wins.
3. **Responsive and reduced-motion rules stay beside their feature,** not in a central responsive file.
4. **Phase 1 kept everything:** duplicate selectors, unused selectors, `!important` and hard-coded colors are unchanged.
   They go with the migration of their feature (Phase 3), one verified change at a time.

## Modules

The ranges were drawn at `main` b29652f. #30 then fixed 17 lines in place (below), so the split, rebased onto `main` at
73842d8, uses the same ranges and carries those fixes.

| Module | Contents | Lines of the former `hmv.css` (`main` at 73842d8) |
|---|---|---|
| `00-legacy-foundation` | Base elements and the first site layout (header, hero, sections, footer, detail pages), its breakpoints and reduced motion | 1–1406 |
| `10-home-farm-journey` | Product photos, logo size, the scroll-driven farm journey hero | 1408–1829 |
| `11-home-farm-art` | The full-bleed farm art hero, featured origins | 1831–2325 |
| `12-home-commerce-motion` | Product card motion, QC reveal, origin inset, bento | 2327–2675 |
| `20-home-cinematic` | Cinematic homepage: hero, journey split, commodities, global reach | 2677–3138 |
| `21-home-daylight` | Daylight homepage, glass header, editorial hero, RFQ form | 3140–3755 |
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

## Roadmap

### Phase 2: Tailwind migration foundation (not started)

An audit, no migration:

- the tokens `@theme` already exposes, and the reusable ones missing (the legacy CSS repeats `#00297b`, `#0f172a`,
  `#e2e8f0` and others as literals);
- the breakpoint convention: Tailwind's scale against the legacy widths (600, 820, 900, 1024, 1043, 1100…), and which
  ones a component needs (1043 px is deliberate: the width of the site header's row);
- the `cn()` and tailwind-merge conventions;
- CVA, where variants are genuinely reused;
- the selectors that stay authored CSS (the exceptions above).

### Phase 3: incremental feature migration

In this order, each module or small group in its own reviewable PR, so that every legacy module has a step:

1. `40-header-navigation.css`
2. `70-product-pages.css` and `71-supply-evidence.css`
3. `90-scoped-cassava.css`
4. `91-tapioca-market.css`
5. `80-trade-desk.css` and `41-privacy-contact.css`
6. `30-articles.css`
7. the homepage legacy modules (`10`, `11`, `12`, `20`, `21`, `22`)
8. logistics, compliance and about (`31`, `50`, `51`, `52`, `53`, `54`, `60`, `61`, `62`)
9. `00-legacy-foundation.css`, last: the cross-cutting residue pass

`00-legacy-foundation.css` holds cross-cutting legacy base and layout rules. Its selectors may be removed step by step
while the feature modules above are migrated. What remains in `00` after those migrations gets a final, audited
residue pass: a rule that is truly global may stay, in `index.css`; a feature-specific leftover moves to Tailwind
utilities or a scoped CSS Module.

Each migration succeeds when the UI is equivalent, the module's legacy CSS shrinks or disappears, no visual baseline
regresses, and no new global CSS replaces the old.

### Legacy findings (inputs to Phases 2 and 3)

An audit snapshot of the legacy CSS before this split (`main` at b29652f), not results of a later analysis. Its 17
Sonar reliability bugs, the missing generic font family (S4649 ×12) and the unitless SVG `r` values (S9424 ×5), were
fixed on `main` before the split (#30) and are not listed. Each item
needs a visual check (the D-14 baselines and the widths the change touches); removing a selector also needs a
DOM check that no page, state or CMS content uses it.

| Finding | Where | Why it matters |
|---|---|---|
| Duplicate selectors: 97 defined more than once in the same context, 74 of them across modules (`.site-nav` ×3, `.product-item` ×3, `.wordmark` ×3, `.journey-step` ×3, `.hero-inner`, `.section-pad`, `.nav-inner`, `.brand-logo`) | 00, 10, 11, 12, 21, 40 | Successive homepage generations override each other |
| Header rules in five modules (legacy `.nav-links`/`.nav-open`, glass header, phone drawer background, the current header, logistics dropdown) | 00, 21, 22, 40, 53 | Migrating the header means all five |
| Older homepage generations (farm journey, farm art, cinematic, daylight) | 10, 11, 12, 20, 21 | Many of their classes no source file names (`.farm-journey`, `.cine-*`, `.journey-*`) |
| 186 of 665 classes no source file names (string search; dynamic and CMS class names are not seen), 71 of them in compliance | 51, 11, 00, 40, 52, 12, 20 | Dead CSS candidates: `.compliance-*`, `.supply-mega-panel`, `.logistics-mega-panel`, `.mega-col*`, `.nav-links`, `.nav-contact` |
| 92 `!important` (47 in the header, 22 in supply chain) | 40, 50, 54 | Specificity fights, including with the scoped header |
| Hard-coded colors (`#ffffff` ×54, `#00297b` ×28, `#0f172a` ×28, `#e2e8f0` ×19) | 40 onward | Values the design tokens already hold |
| 11 width breakpoints (1100, 1080, 1043, 1024, 1000, 900, 860, 820, 700, 640, 600) | all | Near-duplicates to settle in Phase 2 |
