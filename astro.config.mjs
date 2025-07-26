import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://playground.htmlhint.com',
  integrations: [],
  build: {
    cssMinify: true,
  },
  vite: {
    css: {
      postcss: './postcss.config.cjs',
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            bootstrap: ['bootstrap'],
          },
        },
      },
    },
  },
});
