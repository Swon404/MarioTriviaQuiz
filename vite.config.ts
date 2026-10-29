import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/MarioTriviaQuiz/',
  define: { 'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) ?? `local-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}`) },
  build: { rolldownOptions: { output: { codeSplitting: { groups: [
    { name: 'react', test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/ },
  ] } } } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icon-180.png'],
      manifest: {
        name: 'Mushroom Power Quiz',
        short_name: 'Mushroom Quiz',
        description: 'Independent trivia and matching games about Mario and Mario Kart. Not affiliated with Nintendo.',
        theme_color: '#69414f',
        background_color: '#49334f',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,json}'],
      },
    }),
  ],
});
