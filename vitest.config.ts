import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    env: {
      NODE_ENV: 'test',
      NUXT_PUBLIC_DISABLE_RATE_LIMIT: 'true'
    },
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    // Test files pattern - excludes playwright tests (they use their own runner)
    include: ['tests/**/*.test.ts'],
    exclude: ['e2e-playwright/**', 'node_modules/**'],
    // Global test timeout (increased for e2e tests)
    testTimeout: 30000,
    // Hook timeout for setup/teardown
    hookTimeout: 30000,
    // Coverage configuration (optional, run with --coverage)
    coverage: {
      provider: 'v8',
      include: ['server/utils/**', 'app/composables/**', 'app/components/**'],
      exclude: ['node_modules', 'tests', 'e2e-playwright']
    }
  }
})
