/**
 * CSRF Plugin
 *
 * Automatically injects CSRF token header into all $fetch requests
 * that modify state (POST, PUT, DELETE, PATCH).
 */

export default defineNuxtPlugin(() => {
  const { getToken, getHeaderName } = useCsrf()

  // Methods that require CSRF token
  const CSRF_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']

  // Override global fetch to add CSRF token
  const originalFetch = globalThis.$fetch

  globalThis.$fetch = ((input: any, options: any = {}) => {
    const method = (options.method || 'GET').toUpperCase()

    // Only add CSRF header for state-changing methods
    if (CSRF_METHODS.includes(method)) {
      const token = getToken()
      if (token) {
        options.headers = {
          ...options.headers,
          [getHeaderName()]: token
        }
      }
    }

    return originalFetch(input, options)
  }) as typeof originalFetch
})
