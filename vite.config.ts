import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { VitePWA } from 'vite-plugin-pwa'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait(), VitePWA({
    includeAssets: ['apple-touch-icon.png', 'favicon-32x32.png', 'favicon-16x16.png'],
    manifest: {
      name: 'Better ChatGPT',
      short_name: 'Better ChatGPT',
      description: 'Play and chat smarter with BetterChatGPT - an amazing open-source web app with a better UI for exploring OpenAI\'s ChatGPT API!',
      theme_color: '#000000',
      background_color: '#000000',
      icons: [
        {
          src: 'favicon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'favicon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    registerType: 'autoUpdate',
    devOptions: {
      enabled: true
    },
  })],
  resolve: {
    alias: {
      '@icon/': new URL('./src/assets/icons/', import.meta.url).pathname,
      '@type/': new URL('./src/types/', import.meta.url).pathname,
      '@store/': new URL('./src/store/', import.meta.url).pathname,
      '@hooks/': new URL('./src/hooks/', import.meta.url).pathname,
      '@constants/': new URL('./src/constants/', import.meta.url).pathname,
      '@api/': new URL('./src/api/', import.meta.url).pathname,
      '@components/': new URL('./src/components/', import.meta.url).pathname,
      '@utils/': new URL('./src/utils/', import.meta.url).pathname,
      '@src/': new URL('./src/', import.meta.url).pathname,
    },
  },
  base: './',
});
