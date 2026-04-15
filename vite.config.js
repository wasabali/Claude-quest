import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '#engine': resolve('./src/engine'),
      '#data':   resolve('./src/data'),
      '#scenes': resolve('./src/scenes'),
      '#state':  resolve('./src/state'),
      '#ui':     resolve('./src/ui'),
      '#utils':  resolve('./src/utils'),
    },
  },
  server: {
    port: 5173,
    headers: {
      // Required for SharedArrayBuffer and Phaser WebGL context isolation
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
  },
})
