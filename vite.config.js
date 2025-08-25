import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/radar-access-system/' : '/',
  server: {
    port: 3000,
    host: true,
    fs: {
      allow: ['..', './dataset']
    }
  },
  publicDir: 'public',
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png'],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
