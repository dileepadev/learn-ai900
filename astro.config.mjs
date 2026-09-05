// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site: https://dileepadev.github.io/learn-ai-901
// `base` must match the repository name. Set BASE_PATH="/" (or use a custom
// domain) to build for a root-hosted deployment instead.
const base = process.env.BASE_PATH ?? '/learn-ai-901';
const site = process.env.SITE_URL ?? 'https://dileepadev.github.io';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  integrations: [svelte(), sitemap()],
  build: {
    // Emit /page/index.html so GitHub Pages serves clean URLs without a server.
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      // The question bank is large but static; keep it in one cacheable chunk.
      chunkSizeWarningLimit: 1200,
    },
  },
});
