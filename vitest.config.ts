import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['lib/**/*.test.ts', 'test/**/*.test.{js,ts}'],
    globals: true,
    setupFiles: ['./test-setup.ts']
  },
})