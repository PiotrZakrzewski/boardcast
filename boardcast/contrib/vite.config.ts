import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'index.ts'),
        'lancer/index': resolve(__dirname, 'lancer/index.ts')
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['boardcast', 'd3'],
      output: {
        preserveModules: true,
        preserveModulesRoot: '.',
        entryFileNames: '[name].js'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      'boardcast': resolve(__dirname, '../lib/index.ts')
    }
  }
})