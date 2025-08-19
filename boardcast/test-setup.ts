// Global test setup
import { beforeEach } from 'vitest'

// Clean up DOM after each test
beforeEach(() => {
  document.body.innerHTML = ''
})