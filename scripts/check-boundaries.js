// Dependency direction between the migration layers (docs/architecture/NEXTJS_TARGET_ARCHITECTURE.md §2):
//   shared → shared · vite → shared · next → shared. Nothing else: shared code knows neither framework.
// Shared code reaches navigation only through the `@/lib/navigation` port, which each build maps to its own
// implementation (vite.config.js alias, tsconfig.json `paths`). Run by `npm run lint`.
// MIGRATION-ONLY: the Vite layer is deleted at cleanup (PR-12); then only the `next` rules remain useful.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

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

const layerOf = file => Object.keys(LAYERS).find(layer => LAYERS[layer].some(re => re.test(file))) ?? 'shared';

function* sources(dir) {
  for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) yield* sources(file);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name) && !/\.test\.[jt]sx?$/.test(entry.name)) yield file;
  }
}

function resolve(from, specifier) {
  const base = specifier.startsWith('@/') ? `src/${specifier.slice(2)}` : path.posix.join(path.posix.dirname(from), specifier);
  return EXTENSIONS.map(ext => base + ext).find(file => existsSync(path.join(root, file))) ?? base;
}

const violations = [];
for (const file of [...sources('src'), ...sources('app'), 'proxy.ts', 'next.config.ts']) {
  const layer = layerOf(file);
  const code = readFileSync(path.join(root, file), 'utf8');
  // Shared code neither reads configuration nor does I/O: adapters do, and pass data or a transport in.
  if (layer === 'shared' && /\b(import\.meta\.env|process\.env)\b/.test(code)) violations.push(`${file}: shared code reads the environment`);
  if (layer === 'shared' && /\bfetch\(/.test(code)) violations.push(`${file}: shared code calls fetch`);
  for (const [, specifier] of code.matchAll(/\b(?:from|import)\s*\(?\s*['"]([^'"\n]+)['"]/g)) {
    if (specifier === PORT) continue;
    const target = /^(\.|@\/)/.test(specifier) ? layerOf(resolve(file, specifier)) : Object.keys(PACKAGES).find(l => PACKAGES[l].test(specifier));
    if (target && !ALLOWED[layer].includes(target)) violations.push(`${file} (${layer}) → ${specifier} (${target})`);
  }
}

if (violations.length) {
  console.error(`Layer boundary violations (scripts/check-boundaries.js):\n  ${violations.join('\n  ')}`);
  process.exit(1);
}
console.log('Layer boundaries: OK');
