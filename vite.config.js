import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      base: command === 'build' ? '/LPHunt/' : '/',
      scope: command === 'build' ? '/LPHunt/' : '/',
      manifest: {
        name: 'License Plate Hunt',
        short_name: 'LP Hunt',
        description: 'Spot license plates from all 50 states on your road trip',
        theme_color: '#212529',
        background_color: '#212529',
        display: 'standalone',
        start_url: command === 'build' ? '/LPHunt/' : '/',
        scope: command === 'build' ? '/LPHunt/' : '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  // Use /LPHunt/ base for production (GitHub Pages), root for dev
  base: command === 'build' ? '/LPHunt/' : '/',
}))
