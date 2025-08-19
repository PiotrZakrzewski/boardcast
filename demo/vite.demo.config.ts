import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      'boardcast': resolve(__dirname, '../boardcast/lib'),
      'boardcast-contrib': resolve(__dirname, '../boardcast-contrib')
    }
  },
  server: {
    port: 3000
  }
})