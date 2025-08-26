import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/radar-access-system/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    assetsInclude: ['**/*.onnx'],
    chunkSizeWarningLimit: 50000,
    rollupOptions: {
      output: {
        manualChunks: {
          'onnxruntime': ['onnxruntime-web']
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.onnx')) {
            return 'models/[name][extname]'
          }
          // 确保WASM相关文件放在assets目录
          if (assetInfo.name && (assetInfo.name.includes('ort-wasm') || assetInfo.name.includes('.wasm'))) {
            return 'assets/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
