// Dependency direction between the migration layers (docs/architecture/NEXTJS_TARGET_ARCHITECTURE.md §2):
//   shared → shared · vite → shared · next → shared. Nothing else: shared code knows neither framework.
// Shared code reaches navigation only through the `@/lib/navigation` port, which each build maps to its own
// implementation (vite.config.js alias, tsconfig.json `paths`). Run by `npm run lint`; tested by
// check-boundaries.test.js.
// MIGRATION-ONLY: the Vite layer is deleted at cleanup (PR-12); then only the `next` rules remain useful.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const LAYERS = {
  next: [/^app\//, /^src\/next\//, /^proxy\.ts$/, /^next\.config\.ts$/],
  // The Vite entry, its router and head-tag adapters, and its browser-only data hooks.
  vite: [
    /^src\/main\.jsx$/,
    /^src\/app\//,
    /^src\/views\/.+Page\.jsx$/,
    /^src\/components\/common\/PageMeta\.jsx$/,
    /^src\/i18n\/(LanguageContext|LangQueryBootstrap|LegacyLocaleRedirect)\.jsx$/,
    /^src\/lib\/useFetched\.js$/,
    /^src\/features\/articles\/hooks\.js$/,
    /^src\/features\/pages\/usePage\.js$/,
  ],
};
const PACKAGES = { next: /^(next|server-only)(\/|$)/, vite: /^(react-router|react-router-dom|react-helmet-async)$/ };
const ALLOWED = { shared: ['shared'], vite: ['shared', 'vite'], next: ['shared', 'next'] };
const PORT = '@/lib/navigation';
const EXTENSIONS = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
// `import … from`, `import '…'`, `export … from`, `import('…')`
const IMPORT = /\b(?:from|import)\s*(?:\(\s*)?['"]([^'"\n]+)['"]/g;

const layerOf = file => Object.keys(LAYERS).find(layer => LAYERS[layer].some(re => re.test(file))) ?? 'shared';

function resolve(files, from, specifier) {
  const base = specifier.startsWith('@/') ? `src/${specifier.slice(2)}` : path.posix.join(path.posix.dirname(from), specifier);
  return EXTENSIONS.map(ext => base + ext).find(file => files.has(file)) ?? base;
}

// The layer an import specifier points into; undefined for the port and for packages no layer owns.
function targetLayer(files, file, specifier) {
  if (specifier === PORT) return undefined;
  if (/^(\.|@\/)/.test(specifier)) return layerOf(resolve(files, file, specifier));
  return Object.keys(PACKAGES).find(layer => PACKAGES[layer].test(specifier));
}

/** Violations in `files`: a Map of repository-relative path (forward slashes) → source code. */
export function findViolations(files) {
  const violations = [];
  for (const [file, code] of files) {
    const layer = layerOf(file);
    // Shared code neither reads configuration nor does I/O: adapters do, and pass data or a transport in.
    if (layer === 'shared' && /\b(import\.meta\.env|process\.env)\b/.test(code)) violations.push(`${file}: shared code reads the environment`);
    if (layer === 'shared' && /\bfetch\(/.test(code)) violations.push(`${file}: shared code calls fetch`);
    for (const [, specifier] of code.matchAll(IMPORT)) {
      const target = targetLayer(files, file, specifier);
      if (target && !ALLOWED[layer].includes(target)) violations.push(`${file} (${layer}) → ${specifier} (${target})`);
    }
  }
  return violations;
}

function* sources(root, dir) {
  for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) yield* sources(root, file);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name) && !/\.test\.[jt]sx?$/.test(entry.name)) yield file;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(import.meta.dirname, '..');
  const paths = [...sources(root, 'src'), ...sources(root, 'app'), 'proxy.ts', 'next.config.ts'];
  const violations = findViolations(new Map(paths.map(file => [file, readFileSync(path.join(root, file), 'utf8')])));
  if (violations.length) {
    console.error(`Layer boundary violations (scripts/check-boundaries.js):\n  ${violations.join('\n  ')}`);
    process.exit(1);
  }
  console.log('Layer boundaries: OK');
}
