import { defineConfig } from 'vite'
import path from 'path'

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
  base: './',
  resolve: {
    alias: {
      // Resolve library imports to source files during demo build
      '../lib/index': path.resolve(__dirname, 'lib/index.ts')
    }
  }
})