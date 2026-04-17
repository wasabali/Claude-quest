import { defineConfig } from 'vite'
import { resolve } from 'path'

const normalizeBasePath = (basePath) => {
  if (!basePath) return '/'

  const trimmedBasePath = basePath.replace(/^\/+|\/+$/g, '')
  return trimmedBasePath ? `/${trimmedBasePath}/` : '/'
}

const getBasePath = () => {
  if (!process.env.GITHUB_PAGES) return '/'

  if (process.env.PAGES_BASE_PATH) {
    return normalizeBasePath(process.env.PAGES_BASE_PATH)
  }

  const repository = process.env.GITHUB_REPOSITORY
  const repoName = repository ? repository.split('/')[1] : ''

  return normalizeBasePath(repoName)
}

export default defineConfig({
  base: getBasePath(),
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
