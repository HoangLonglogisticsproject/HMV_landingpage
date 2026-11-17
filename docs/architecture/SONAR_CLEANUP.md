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
| Current total | 173: all CSS; JS/TS fixed, pending the next analysis of `main` |
| Resolved | 86 |
| Remaining | 173 |

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
| `css:S9423` | Smell | `!important` | 92 | 92 |
| `css:S7924` | Smell | Text contrast | 28 | 28 |
| `css:S9440` | Smell | Motion without reduced-motion handling | 21 | 21 |
| `css:S4666` | Smell | Duplicate selector | 19 | 19 |
| `css:S9449` | Smell | `transition: all` | 13 | 13 |
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
