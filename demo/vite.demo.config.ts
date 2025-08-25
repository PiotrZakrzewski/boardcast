import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: './demo',
  base: '/boardcast/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, './index.html')
      }
    }
  },
  resolve: {
    alias: {
      'boardcast': resolve(__dirname, '../lib'),
      'boardcast-contrib': resolve(__dirname, '../contrib')
    }
  },
  server: {
    port: 3000
  }
})