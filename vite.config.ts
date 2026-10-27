import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// The app lives in a subfolder on GitHub Pages: https://<login>.github.io/curiosity-day/
const base = '/curiosity-day/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    // MVP: manifest + installability only. No service worker is registered.
    VitePWA({
      injectRegister: false,
      selfDestroying: true,
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon-32.png'],
      manifest: {
        name: 'Curiosity Day',
        short_name: 'Curiosity',
        description: 'Дневник удивлений',
        lang: 'ru',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#FFFFFF',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
