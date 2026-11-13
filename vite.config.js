import { readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The Vite site's static SEO files, emitted unchanged by `vite build` and served by `vite` (dev), as public/ files
// would be. They live in src/app because Next.js generates /sitemap.xml and /robots.txt, and public/ files at those
// paths would conflict. MIGRATION-ONLY.
const SEO_FILES = { '/sitemap.xml': 'application/xml', '/robots.txt': 'text/plain' };
const seoFile = urlPath => readFileSync(path.resolve(import.meta.dirname, `src/app${urlPath}`));
const viteSeoFiles = {
  name: 'hmv-vite-seo-files',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const type = SEO_FILES[req.url];
      if (!type) return next();
      res.setHeader('Content-Type', type);
      res.end(seoFile(req.url));
    });
  },
  generateBundle() {
    for (const urlPath of Object.keys(SEO_FILES)) this.emitFile({ type: 'asset', fileName: urlPath.slice(1), source: seoFile(urlPath) });
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSeoFiles],
  resolve: {
    // `@/lib/navigation`, `@/lib/image` and `@/lib/inquiry` are ports with one implementation per build (Next.js:
    // tsconfig.json `paths`). MIGRATION-ONLY.
    alias: [
      { find: /^@\/lib\/navigation$/, replacement: path.resolve(import.meta.dirname, './src/app/navigation.jsx') },
      { find: /^@\/lib\/image$/, replacement: path.resolve(import.meta.dirname, './src/app/image.jsx') },
      { find: /^@\/lib\/inquiry$/, replacement: path.resolve(import.meta.dirname, './src/app/inquiry.js') },
      { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
    ],
  },
  // Tailwind runs through @tailwindcss/vite here; postcss.config.mjs is for the Next.js build only.
  css: { postcss: {} },
  // CMS mode (`--mode cms`): same-origin access to the CMS public API, for `vite` and `vite preview`.
  // Only /api/v1/public is forwarded, so admin routes are unreachable through this origin.
  server: {
    proxy: {
      '/api/v1/public': {
        target: process.env.CMS_API_ORIGIN ?? 'http://localhost:4000',
        changeOrigin: true,
        // localhost cookies ignore the port: never forward the CMS admin session.
        configure: proxy => proxy.on('proxyReq', req => req.removeHeader('cookie')),
      },
    },
  },
  // Unit tests (`npm test`, Vitest): Node environment; React component and hook tests opt into jsdom with a
  // `// @vitest-environment jsdom` comment. `npm run test:coverage` writes coverage/lcov.info for SonarQube.
  test: {
    include: ['src/**/*.test.{js,jsx}', 'scripts/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      reporter: ['text-summary', 'lcovonly'],
    },
  },
});
