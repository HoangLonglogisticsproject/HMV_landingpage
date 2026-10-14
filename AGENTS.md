# Architecture rules
- Keep the React/Vite application and existing common/sections/UI component organization; this preserves the user's newly supplied source architecture.
- Use locale-prefixed React Router pages and a shared bilingual content module; this keeps overview and detail pages consistent without duplicating layouts.
- Use Helmet for route head links and language attributes, and synchronize route titles/meta tags to the static fallback explicitly; this avoids duplicate React 19 metadata while preserving crawlable sitewide tags.
- Keep images as files under `src/assets` imported by the bundler; no remote asset manifests or host-specific asset proxies.
- Keep layout CSS separate from global theme tokens; this preserves the authoritative semantic palette while isolating the editorial page styling.
- Serve photographs from bundled `src/assets` files with explicit width/height matching the real image and lazy loading below the fold; this avoids layout shifts.
- Keep product photography in a shared product-ID mapping with source and subject metadata; overview and detail pages must use the same verified product image.
- The site has no backend: RFQ and contact submissions are validated client-side and handed to the visitor's email app via a shared mailto builder; the UI must say a draft was prepared, never that a request was sent.
- Keep the art world lazy in React Three Fiber with demand rendering, merged static geometry, token-sourced colors and a static reduced-motion scene; this makes immersive illustration efficient and distinct from evidence.
- Keep homepage service summaries separate from full detail sections and use a native scroll-snap activities carousel with visibility-aware automatic advancement and pause/interaction/reduced-motion safeguards; this limits homepage density and supports touch without another carousel dependency.

- Keep opening journey chapter copy and camera coordinates in one shared bilingual module, with commercial vignettes separate from landscape geometry; this keeps navigation, chapter state and visual scenes aligned.
- Keep hero stock imagery in its own asset pointer, separate from HMV evidence photographs, with CSS-only motion and reduced-motion support; this preserves provenance and avoids scroll-rendering overhead.
