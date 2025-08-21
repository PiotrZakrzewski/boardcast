import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: './runtime',
  base: '/',  // No base path for CLI recording
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, './runtime/tutorial-runner.html')
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
    port: 3001
  }
})