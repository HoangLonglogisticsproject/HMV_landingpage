// Image port `@/lib/image`, Vite implementation (vite.config.js alias): the plain <img> the views rendered before the
// port. `sizes` only feeds the Next.js srcset, so it is dropped and the Vite markup stays as it was.
// MIGRATION-ONLY: delete at cleanup (docs/architecture/MIGRATION_ROADMAP.md, PR-12).
export default function Image({ sizes: _sizes, ...props }) {
  return <img {...props} />;
}
