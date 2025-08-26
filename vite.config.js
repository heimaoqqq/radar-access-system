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
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.onnx'],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 增加chunk大小限制以处理大文件
    chunkSizeWarningLimit: 50000,
    rollupOptions: {
      output: {
        manualChunks: {
          'onnxruntime': ['onnxruntime-web']
        }
      }
    }
  }
})
