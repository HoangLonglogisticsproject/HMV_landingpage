import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
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
});
