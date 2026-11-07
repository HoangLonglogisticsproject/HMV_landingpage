import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Shared components import `@/lib/navigation` (the Next.js adapter); the Vite build swaps in the React Router one.
    alias: [
      { find: /^@\/lib\/navigation$/, replacement: path.resolve(import.meta.dirname, './src/lib/navigation.vite.jsx') },
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
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      reporter: ['text-summary', 'lcovonly'],
    },
  },
});
