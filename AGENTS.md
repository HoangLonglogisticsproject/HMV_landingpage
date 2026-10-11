# Architecture rules
- Keep the React/Vite application and existing common/sections/UI component organization; this preserves the user's newly supplied source architecture.
- Use locale-prefixed React Router pages and a shared bilingual content module; this keeps overview and detail pages consistent without duplicating layouts.
- Use Helmet for route head links and language attributes, and synchronize route titles/meta tags to the static fallback explicitly; this avoids duplicate React 19 metadata while preserving crawlable sitewide tags.
- Keep development-only proxying for Lovable asset paths in Vite; hosted asset paths are served natively and require no production proxy.
- Keep layout CSS separate from global theme tokens; this preserves the authoritative semantic palette while isolating the editorial page styling.
- Serve uploaded photographs through Lovable Assets with explicit dimensions and lazy loading below the fold; this keeps the source lightweight and avoids layout shifts.
- Keep product photography in a shared product-ID mapping with source and subject metadata; overview and detail pages must use the same verified product image.
- Use an explicit email-draft contact workflow until a functioning inquiry delivery integration is implemented; never represent a browser-only form as a successfully delivered quotation request.
- Keep the art world lazy in React Three Fiber with demand rendering, merged static geometry, token-sourced colors and a static reduced-motion scene; this makes immersive illustration efficient and distinct from evidence.
- Keep homepage service summaries separate from full detail sections and use a native scroll-snap activities carousel with visibility-aware automatic advancement and pause/interaction/reduced-motion safeguards; this limits homepage density and supports touch without another carousel dependency.

- Keep opening journey chapter copy and camera coordinates in one shared bilingual module, with commercial vignettes separate from landscape geometry; this keeps navigation, chapter state and visual scenes aligned.
- Keep hero stock imagery in its own asset pointer, separate from HMV evidence photographs, with CSS-only motion and reduced-motion support; this preserves provenance and avoids scroll-rendering overhead.
