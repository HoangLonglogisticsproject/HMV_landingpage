# Architecture rules
- Keep the React/Vite application and existing common/sections/UI component organization; this preserves the user's newly supplied source architecture.
- Use locale-prefixed React Router pages and a shared bilingual content module; this keeps overview and detail pages consistent without duplicating layouts.
- Use Helmet for route-specific metadata and a sitewide static head fallback; the Vite application does not provide server-rendered per-route social previews.
- Serve uploaded photographs through Lovable Assets with explicit dimensions and lazy loading below the fold; this keeps the source lightweight and avoids layout shifts.
- Use an explicit email-draft contact workflow until a functioning inquiry delivery integration is implemented; never represent a browser-only form as a successfully delivered quotation request.