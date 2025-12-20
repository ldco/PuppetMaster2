/**
 * App Mode Middleware
 *
 * Handles routing based on the configured application mode:
 *
 * - app-only:      Redirect / → /admin/login (no public website)
 * - website-app:   Normal routing, /login available
 * - website-admin: Normal routing, admin at /admin (hidden)
 * - website-only:  Block /admin/* routes (no admin)
 *
 * This middleware runs on every route change (global).
 */
import config from '~/puppet-master.config'

export default defineNuxtRouteMiddleware(to => {
  const mode = config.mode

  // ═══════════════════════════════════════════════════════════════════════════
  // APP-ONLY MODE: No public website, redirect root to admin login
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === 'app-only') {
    // Allow admin routes
    if (to.path.startsWith('/admin')) {
      return // continue to admin
    }

    // Redirect everything else to admin login
    return navigateTo('/admin/login', { replace: true })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSITE-ONLY MODE: No admin, block admin routes
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === 'website-only') {
    if (to.path.startsWith('/admin')) {
      // Redirect admin attempts to home
      return navigateTo('/', { replace: true })
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSITE-APP MODE: Website + visible login button
  // ═══════════════════════════════════════════════════════════════════════════
  // No special routing needed - /login page will be available

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBSITE-ADMIN MODE: Website + hidden admin (default)
  // ═══════════════════════════════════════════════════════════════════════════
  // No special routing needed - admin at /admin works as expected
})
