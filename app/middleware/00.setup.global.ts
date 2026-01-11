/**
 * Setup Check Middleware
 *
 * Redirects to /setup if project is unconfigured.
 *
 * This middleware runs first (00 prefix) on every route change.
 * When pmMode is 'unconfigured', all routes except /setup redirect to the wizard.
 *
 * After setup completes, pmMode becomes 'build' or 'develop' and this
 * middleware becomes a no-op.
 */
import config from '~/puppet-master.config'

export default defineNuxtRouteMiddleware(to => {
  // Get pmMode from config (defaults to 'unconfigured' if not set)
  const pmMode = (config as any).pmMode || 'unconfigured'

  // Only redirect when unconfigured
  if (pmMode !== 'unconfigured') {
    return // Already configured, continue normally
  }

  // Allow /setup and API routes
  if (to.path === '/setup' || to.path.startsWith('/api/')) {
    return // Continue to setup wizard or API
  }

  // Redirect everything else to setup wizard
  return navigateTo('/setup', { replace: true })
})
