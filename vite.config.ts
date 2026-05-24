import { defineConfig } from 'vite';

export default defineConfig({
  // Multi-page app: Vite will find all HTML files at the root
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        serviceSite: 'service-site.html',
        memoryGame: 'memory-game.html',
        ecommerce: 'ecommerce.html',
        analytics: 'analytics.html',
      },
    },
  },
});
