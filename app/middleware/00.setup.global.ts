/**
 * Setup Check Middleware
 *
 * Controls access to /setup based on pmMode:
 * - unconfigured: Redirect all routes to /setup
 * - build/develop: Block /setup, redirect to home
 *
 * This ensures the setup wizard is only accessible during initial configuration
 * and not exposed in production.
 */
import config from '~/puppet-master.config'

export default defineNuxtRouteMiddleware(to => {
  // Get pmMode from config (defaults to 'unconfigured' if not set)
  const pmMode = (config as any).pmMode || 'unconfigured'

  // When UNCONFIGURED: redirect everything to /setup
  if (pmMode === 'unconfigured') {
    // Allow /setup and API routes
    if (to.path === '/setup' || to.path.startsWith('/api/')) {
      return
    }
    // Redirect everything else to setup wizard
    return navigateTo('/setup', { replace: true })
  }

  // When CONFIGURED: block /setup route
  if (to.path === '/setup') {
    // Already configured, redirect away from setup
    return navigateTo('/', { replace: true })
  }
})
