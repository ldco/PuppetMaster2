/**
 * Auth Middleware
 *
 * Protects admin routes by checking authentication BEFORE rendering.
 * Also checks if onboarding is completed for first-time users (LOW-05).
 * This prevents the "flash of admin content" issue.
 *
 * Usage: Add `definePageMeta({ middleware: 'auth' })` to protected pages
 * Or use in layout for all admin pages
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect /admin routes (except login)
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  const { user, checkSession } = useAuth()

  // If we don't have user data, check the session
  if (!user.value) {
    await checkSession()
  }

  // Still no user? Redirect to login
  if (!user.value) {
    return navigateTo('/admin/login', { replace: true })
  }

  // Skip onboarding check for onboarding page itself
  if (to.path === '/admin/onboarding') {
    return
  }

  // Check if onboarding is completed (LOW-05)
  try {
    const settings = await $fetch<Record<string, Record<string, string>>>('/api/settings')

    if (settings) {
      const onboardingComplete = settings.system?.onboardingComplete

      // If not completed, redirect to onboarding
      if (onboardingComplete !== 'true') {
        return navigateTo('/admin/onboarding', { replace: true })
      }
    }
  } catch {
    // If we can't fetch settings, skip check (don't block user)
  }
})

