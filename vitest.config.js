import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
    setupFiles: ['./lib/setup-tests.ts'],
    coverage: {
      enabled: true,
      include: ['lib/**/*.ts'],
      exclude: ['lib/setup-tests.ts'],
    },
  },
})
