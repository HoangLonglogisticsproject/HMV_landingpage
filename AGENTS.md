# Architecture rules
- Keep the React/Vite application and existing common/sections/UI component organization; this preserves the user's newly supplied source architecture.
- Use locale-prefixed React Router pages and a shared bilingual content module; this keeps overview and detail pages consistent without duplicating layouts.
- Use Helmet for route head links and language attributes, and synchronize route titles/meta tags to the static fallback explicitly; this avoids duplicate React 19 metadata while preserving crawlable sitewide tags.
- Keep development-only proxying for Lovable asset paths in Vite; hosted asset paths are served natively and require no production proxy.
- Keep layout CSS separate from global theme tokens; this preserves the authoritative semantic palette while isolating the editorial page styling.
- Serve uploaded photographs through Lovable Assets with explicit dimensions and lazy loading below the fold; this keeps the source lightweight and avoids layout shifts.
- Use an explicit email-draft contact workflow until a functioning inquiry delivery integration is implemented; never represent a browser-only form as a successfully delivered quotation request.