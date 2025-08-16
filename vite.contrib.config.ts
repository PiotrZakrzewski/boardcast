import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'contrib/index.ts'),
      name: 'BoardcastContrib',
      fileName: 'index',
      formats: ['es']
    },
    outDir: 'dist/contrib',
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