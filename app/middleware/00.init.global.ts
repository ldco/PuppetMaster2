/**
 * Init Check Middleware
 *
 * Controls access to /init based on pmMode:
 * - unconfigured: Allow /init for BUILD mode configuration
 * - build/develop: Block /init, redirect to home
 *
 * Note: Mode selection (build/develop) happens in CLI or Claude chat,
 * NOT in the browser. The /init page is only for BUILD mode configuration.
 */
import config from '~/puppet-master.config'

export default defineNuxtRouteMiddleware(to => {
  // Get pmMode from config (defaults to 'unconfigured' if not set)
  const pmMode = (config as any).pmMode || 'unconfigured'

  // When CONFIGURED: block /init route
  if (pmMode !== 'unconfigured' && to.path === '/init') {
    // Already configured, redirect away from init
    return navigateTo('/', { replace: true })
  }

  // When UNCONFIGURED: allow /init but don't force redirect
  // Mode selection happens in CLI/Claude, not browser
})
