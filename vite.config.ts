import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/MarioTriviaQuiz/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Mushroom Power Quiz',
        short_name: 'Mushroom Quiz',
        description: 'Independent trivia and matching games about Mario and Mario Kart. Not affiliated with Nintendo.',
        theme_color: '#69414f',
        background_color: '#49334f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,json}'],
      },
    }),
  ],
});
