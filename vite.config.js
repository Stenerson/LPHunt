import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // Use /LPHunt/ base for production (GitHub Pages), root for dev
  base: command === 'build' ? '/LPHunt/' : '/',
}))
