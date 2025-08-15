import { defineConfig } from 'vite'

export default defineConfig({
  root: 'demo',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../dist/demo',
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      // Allow importing .js extensions from .ts files during development
    }
  }
})