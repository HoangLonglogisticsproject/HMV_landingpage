# Ownership
- Claude Code owns engineering: architecture, implementation, refactoring, API integration, tests and security.
- Antigravity owns visual UI/UX design and design specifications only, and must not make architectural or business-logic changes to the production source; approved designs are implemented by Claude Code.
- The CMS repository (`../CMS_HMV`) is read-only from this project unless explicitly approved.

# Architecture rules
- Follow the structure and dependency rules in `docs/architecture.md`: one module per route in `src/pages`, reusable business functionality in `src/features`, site chrome in `src/components/layout`, business-agnostic primitives in `src/components/ui`; delete unreachable code instead of keeping it.
- Use locale-free React Router URLs (language from `?lang=`/stored preference; legacy `/en`, `/vi` prefixes redirect) and a shared bilingual content module; this keeps overview and detail pages consistent without duplicating layouts.
- Use Helmet for route head links and language attributes, and synchronize route titles/meta tags to the static fallback explicitly; this avoids duplicate React 19 metadata while preserving crawlable sitewide tags.
- Keep images as files under `src/assets` imported by the bundler; no remote asset manifests or host-specific asset proxies. Exception: EcoNews in CMS mode renders the absolute media URLs (with their width/height) that the CMS public API returns.
- Keep layout CSS separate from global theme tokens; this preserves the authoritative semantic palette while isolating the editorial page styling.
- Serve photographs from bundled `src/assets` files with explicit width/height matching the real image and lazy loading below the fold; this avoids layout shifts.
- Keep product photography in a shared product-ID mapping with source and subject metadata; overview and detail pages must use the same verified product image.
- EcoNews may read the HMV CMS **public** API (`/api/v1/public/*`) in CMS mode only (`features/articles`, see `docs/cms-integration.md`): no credentials, no admin routes, no fallback to bundled articles when the CMS fails.
- The site has no backend: RFQ and contact submissions are validated client-side and handed to the visitor's email app via a shared mailto builder; the UI must say a draft was prepared, never that a request was sent.
- Keep homepage service summaries separate from full detail sections and use a native scroll-snap activities carousel with visibility-aware automatic advancement and pause/interaction/reduced-motion safeguards; this limits homepage density and supports touch without another carousel dependency.

- Keep hero stock imagery in its own asset pointer, separate from HMV evidence photographs, with CSS-only motion and reduced-motion support; this preserves provenance and avoids scroll-rendering overhead.
