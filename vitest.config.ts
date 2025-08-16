import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['lib/**/*.test.ts'],
    globals: true,
    setupFiles: ['./test-setup.ts']
  },
})