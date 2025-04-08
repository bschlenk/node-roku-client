import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./lib/setupTests.js'],
    coverage: {
      enabled: true,
      include: ['lib/**/*.ts'],
      exclude: ['lib/setupTests.ts'],
    },
  },
})
