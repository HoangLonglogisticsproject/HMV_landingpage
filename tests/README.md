# Smoke & Regression Tests

This directory contains the reproducible smoke test suite for HMV Global landing page.

## Test stack

| Layer | Tool | Command |
|---|---|---|
| Unit (inquiry/RFQ logic) | `node:test` (built-in) | `npm test` |
| E2E smoke | Playwright (Chromium) | `npm run test:e2e` |
| Visual smoke screenshots | Playwright (Chromium) | `npm run test:visual` |
| Lint | ESLint flat config | `npm run lint` |

## Running tests

### Prerequisites

```bash
npm ci                        # Install all deps
npm run build                 # Build the production bundle
```

### Unit tests (fast, no browser needed)

```bash
npm test
```

Runs `node --test`, which picks up all `*.test.js` files under `src/`. Currently covers inquiry mailto builder and RFQ field validation.

### E2E smoke tests

```bash
npm run test:e2e
# or directly:
npx playwright test --ignore-snapshots
```

Playwright spins up `vite preview` on port 4173 automatically. Tests cover:

| File | Coverage |
|---|---|
| `routes.spec.js` | All 13 routes load; deep links; 404; legacy `/en/*` `/vi/*` redirect smoke |
| `i18n.spec.js` | `?lang=` switching; language persists across navigation |
| `navigation.spec.js` | Desktop nav; mobile hamburger; footer; browser back/forward; product/article pages |
| `workflows.spec.js` | Contact form; RFQ section; support chat; mailto-draft-only assertion |
| `visual.spec.js` | Full-page screenshots; zero JS errors on 8 key pages |

Both desktop (1280×720) and mobile (375×667) viewports are tested.

### Visual screenshots

```bash
npm run test:visual
```

Screenshots are saved to `tests/screenshots/` (gitignored — never committed). They are for **manual review** only, not pixel-diff CI.

To view the HTML report after a test run:

```bash
npx playwright show-report
```

## Updating tests after intentional changes

- **New route:** add it to the `ROUTES` array in `routes.spec.js`.
- **New page with visual coverage:** add it to `VISUAL_PAGES` in `visual.spec.js`.
- **Changed UI copy or selectors:** update the relevant `spec.js` file. Do not disable assertions to make tests pass.
- **Screenshot baselines:** screenshots are intentionally not committed. Re-run `npm run test:visual` and inspect manually.

## CI notes

- Set `CI=true` to enable single-worker mode and retries.
- The webServer auto-starts `npm run preview`; ensure port 4173 is free.
- Legacy locale redirect tests (`/en/*`, `/vi/*`) reflect client-side React Router behavior; they pass once the SPA is loaded. On production Vercel, these are pre-handled by `vercel.json` 301 redirects.
