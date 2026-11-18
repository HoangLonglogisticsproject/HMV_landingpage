# Sonar cleanup ledger

Goal: **0 open issues** in SonarQube Cloud (`HoangLonglogisticsproject_global-agro-trails`) by fixing the code. A
passing Quality Gate is not enough on its own.

None of these is used to clear an issue: `NOSONAR`, exclusions, disabled rules, a weaker Quality Gate or New Code
definition, or Accepted / False Positive statuses. Where the analyzer misreads the code, the code is changed so its
intent is statically clear.

## Totals

| | Count |
|---|---|
| Starting total | 259 |
| Current total | 0 in the local checks; Sonar confirms on the next analyses |
| Resolved | 259 |
| Remaining | 0 |

Read on 2026-11-18.

- **JS/TS:** 86 issues, from the `main` analysis at 73842d8.
- **CSS:** 173 issues, from the PR #29 analysis of the split stylesheet.
- **Before the split:** `main` itself reports 290 issues, 204 of them on the single `hmv.css`. Sonar compares
  selectors and reduced-motion rules within one file, so splitting the file changed two CSS counts:
  - duplicate selectors went from 70 to 19;
  - reduced-motion findings went from 1 to 21.

Security hotspots: 0. Vulnerabilities: 0.

## By rule

| Rule | Type | Finding | Start | Remaining |
|---|---|---|---|---|
| `javascript:S3403` | Bug | `===` between types the analyzer sees as dissimilar | 10 | 0 |
| `javascript:S9383` | Bug | Unhandled promise | 1 | 0 |
| `css:S9423` | Smell | `!important` | 92 | 0 |
| `css:S7924` | Smell | Text contrast | 28 | 0 |
| `css:S9440` | Smell | Motion without reduced-motion handling | 21 | 0 |
| `css:S4666` | Smell | Duplicate selector | 19 | 0 |
| `css:S9449` | Smell | `transition: all` | 13 | 0 |
| `javascript:S6479` | Smell | Array index as React key | 12 | 0 |
| `javascript:S6819` | Smell | ARIA role instead of a native element | 9 | 0 |
| `javascript:S1607` | Smell | Skipped test without a reason | 9 | 0 |
| `typescript:S6759` | Smell | Props not read-only | 9 | 0 |
| `javascript:S3358` | Smell | Nested ternary | 8 | 0 |
| `javascript:S3776` | Smell | Cognitive complexity over 15 | 5 | 0 |
| `typescript:S7763`, `javascript:S7763` | Smell | Re-export without `export…from` | 6 | 0 |
| `typescript:S7503` | Smell | `async` without `await` | 2 | 0 |
| `javascript:S7781` | Smell | `replace` with a global regex | 2 | 0 |
| `typescript:S4123` | Smell | `await` on non-promises | 1 | 0 |
| `typescript:S7758` | Smell | `charCodeAt` | 1 | 0 |
| `javascript:S6481` | Smell | Unstable context value | 1 | 0 |
| `javascript:S1077` | Smell | `img` without `alt` | 1 | 0 |
| `javascript:S7780` | Smell | Escaped backslashes | 1 | 0 |
| `javascript:S3800` | Smell | Mixed return types | 1 | 0 |
| `javascript:S7773` | Smell | Global `NaN` | 1 | 0 |
| `javascript:S6845` | Smell | `tabIndex` on a non-interactive element | 1 | 0 |
| `javascript:S4624` | Smell | Nested template literal | 1 | 0 |
| `javascript:S6754` | Smell | `useState` not destructured symmetrically | 1 | 0 |
| `javascript:S6594` | Smell | `String.match` | 1 | 0 |
| `javascript:S8786` | Smell | Regex with super-linear backtracking | 1 | 0 |
| `javascript:S6551` | Smell | Object stringified by default | 1 | 0 |

## CSS by module (start)

| Module | `!important` | Contrast | Reduced motion | Duplicates | `transition: all` |
|---|---|---|---|---|---|
| `00-legacy-foundation` | 3 | | | | |
| `10-home-farm-journey` | | | | 3 | |
| `11-home-farm-art` | | | | 8 | |
| `12-home-commerce-motion` | | | 1 | | |
| `20-home-cinematic` | | | 2 | | |
| `21-home-daylight` | | | 3 | 7 | 1 |
| `22-mobile-insights-footer` | 2 | | 1 | | |
| `30-articles` | | | | 1 | |
| `31-living-logistics` | 1 | | 2 | | |
| `40-header-navigation` | 47 | 4 | 4 | | 5 |
| `41-privacy-contact` | 1 | | | | |
| `50-supply-chain` | 22 | 5 | 1 | | 2 |
| `51-compliance` | 3 | | | | 1 |
| `52-packaging-logistics` | | 2 | 2 | | |
| `53-logistics-dropdown` | | | | | 2 |
| `54-logistics-hub` | 11 | 13 | 3 | | 1 |
| `60-about` | 2 | 4 | 1 | | 1 |
| `62-regulations` | | | 1 | | |

## Batches

Each batch is one or more commits in PR #29, with its decisions recorded here.

### JS/TS (86 resolved)

- **Bugs (11).**
  - The "always false" comparisons (S3403, 10) came from `useState(null)` state, which the analyzer typed as `null`.
    The state now declares its values with a JSDoc cast, as TradeDesk already did.
  - `navigate()` under `<BrowserRouter>` returns nothing to await, so it is marked fire-and-forget (S9383).
- **Small findings (30).** Read-only props, `export…from`, `replaceAll`, `String.raw`, `codePointAt`,
  `Number.NaN`, `RegExp#exec`, no nested ternaries, named objects instead of mixed tuples, and promises that are
  promises. The RFQ email check no longer backtracks; a test proves it accepts exactly what the former pattern did.
- **Skipped tests (9).** Tests that applied to one project or to the local build skipped themselves at run time. They
  now live in `*.desktop.spec.js`, `*.mobile.spec.js` and `*.local-build.spec.js` files, which the Playwright
  configs scope by name. The collected tests are unchanged, minus the instances that used to skip.
- **React and accessibility (31).**
  - Gallery thumbnails are `<button>`s.
  - The three image previews share one native modal `<dialog>`.
  - Global Reach nodes are buttons described by their tooltips.
  - The map is a labelled `<figure>`.
  - Status messages use `<output>`.
  - Lists are keyed by content.
  - The pinned visual suite passed 66/66 with no baseline change.
- **Complexity (5).**
  - The header mega menu became `SupplyChainMenu`, made of `NavGroup`s. The rendered header is byte-identical with
    every group expanded.
  - Three views are split into their page sections. Their prerendered HTML is identical.

### CSS (173 resolved)

Each change was verified on the rendered site. Two builds were served side by side and the computed style of every
element (with ::before and ::after) was compared:
- every page, in EN and VI, at 1440, 768 and 390 px;
- the interactive states: open menus, drawers, dialogs, the Trade Desk, hover;
- for the header, the full and page-scoped headers at ten widths from 390 to 1440 px, in normal and reduced motion.

- **`transition: all` (13).** Each names the properties its states change, with the same timing.
- **Reduced motion (21).**
  - Each module stops its own transitions and animations under `prefers-reduced-motion`, after the rules it overrides.
  - The global reset in `00` therefore needs no `!important`: unlayered, it still beats every Tailwind utility.
- **Contrast (28).**
  - 12 already passed in the rendered page; the analyzer reads translucent backgrounds as opaque. Each now uses the
    opaque color it renders as.
  - 15 failed and take the next darker tone of their hue. The table below lists them.
- **Dead CSS.** 2,918 lines are removed. Every class they name is absent from the source, including the run-time class
  families, and from the rendered DOM of every sitemap URL in every state. The computed styles of all 19,524 elements
  are unchanged. The CSS bundle went from 171.9 kB to 134.5 kB (32.5 to 26.4 kB gzip).
  - Earlier homepage generations: farm journey, farm art, cinematic.
  - The former compliance layout.
  - Old header pieces and mega-menu panels.
  - `.stage-num-badge`.
- **Duplicate selectors (19).**
  - The dead CSS removal took some.
  - The 14 left merged into the first occurrence, so the reduced-motion and breakpoint rules after it still win.
- **`!important` (92).**
  - 30 went with the dead CSS.
  - Of the 62 left, 58 won no conflict: they overrode shadcn/Tailwind utilities, which unlayered CSS already beats, or a
    rule that no longer exists. They are removed.
  - The global reduced-motion reset is no longer needed (see above).
  - 3 won a conflict against a more specific rule. Each is now written as the state or part of the element it styles:
    - `.nav-center>a.nav-active`
    - `.section-heading-center .team-intro-lead`
    - `.living-tip .living-tip-sub`
  - Removing the header's `!important` also fixed a reduced-motion bug: the Trade Desk button's `!important`
    transition had beaten every reduced-motion rule.

#### Intentional color changes (contrast)

The text, or the white text's background, takes the next darker tone of its hue:

| Selector | Before | After | Contrast |
|---|---|---|---|
| `.badge-cyan` (supply chain wind badge) | `#0284c7` on `rgba(2, 132, 199, .12)` | `#0369a1` on `#d8eaf6` | 3.32 → 4.81 |
| `.pillar-pill-cyan` | `#0284c7` on `rgba(2, 132, 199, .1)` | `#0369a1` on `#e6f3f9` | 3.62 → 5.24 |
| `.pillar-pill-green:hover` | white on `#10b981` | white on `#047857` | 2.54 → 5.48 |
| `.pillar-pill-cyan:hover` | white on `#0284c7` | white on `#0369a1` | 4.10 → 5.93 |
| `.log-nav-pill.highlight:hover` | white on `#059669` | white on `#047857` | 3.77 → 5.48 |
| `.log-sub-badge.danger` | `#dc2626` | `#b91c1c` | 4.07 → 5.45 |
| `.log-sub-badge.primary` | `#059669` | `#047857` | 3.30 → 4.80 |
| `.log-sub-badge.cyan` | `#0284c7` | `#0369a1` | 3.62 → 5.24 |
| `.dg-icon-box.airsea` (icon) | `#0284c7` | `#0369a1` | 3.51 → 5.09 |
| `.dg-icon-box.special` (icon) | `#dc2626` | `#b91c1c` | 4.14 → 5.55 |
| `.dg-icon-box.general` (icon) | `#059669` | `#047857` | 3.37 → 4.91 |
| `.cb-tag` | white on `#10b981` | white on `#047857` | 2.54 → 5.48 |
| `.vm-mission-card .vm-card-tag` | `#0284c7` | `#0369a1` | 3.70 → 5.36 |
| `.leader-exp-badge` | `#059669` | `#047857` | 3.43 → 5.00 |
