import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    // Test files pattern
    include: ['tests/**/*.test.ts'],
    // Global test timeout
    testTimeout: 10000,
    // Coverage configuration (optional, run with --coverage)
    coverage: {
      provider: 'v8',
      include: ['server/utils/**', 'app/composables/**', 'app/components/**'],
      exclude: ['node_modules', 'tests']
    }
  }
})
