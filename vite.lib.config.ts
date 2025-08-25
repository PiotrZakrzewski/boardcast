import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'Boardcast',
      fileName: 'index',
      formats: ['es']
    },
    outDir: 'dist/lib',
    rollupOptions: {
      external: ['d3'],
      output: {
        globals: {
          d3: 'd3'
        }
      }
    },
    sourcemap: true
  }
})