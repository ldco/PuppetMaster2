/**
 * Auth Composable
 *
 * Client-side authentication state management.
 * Provides login, logout, session checking, and role-based access control.
 * Integrates with CSRF protection via useCsrf composable.
 */
import type { UserRole, User, LoginCredentials } from '~/types'

// Re-export for backward compatibility
export type { UserRole } from '~/types'

const ROLE_HIERARCHY: Record<UserRole, number> = {
  editor: 0,
  admin: 1,
  master: 2
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const isLoading = useState<boolean>('auth-loading', () => false)

  const isAuthenticated = computed(() => !!user.value)

  // Role-based computed properties
  const isMaster = computed(() => user.value?.role === 'master')
  const isAdmin = computed(() => hasRole('admin'))
  const isEditor = computed(() => hasRole('editor'))
  const canManageUsers = computed(() => hasRole('admin'))

  /**
   * Check if current user has at least the minimum required role
   */
  function hasRole(minRole: UserRole): boolean {
    if (!user.value?.role) return false
    return ROLE_HIERARCHY[user.value.role] >= ROLE_HIERARCHY[minRole]
  }

  /**
   * Get roles that current user can assign to others
   */
  function getAssignableRoles(): UserRole[] {
    if (!user.value?.role) return []
    if (user.value.role === 'master') return ['master', 'admin', 'editor']
    if (user.value.role === 'admin') return ['admin', 'editor']
    return []
  }

  /**
   * Check current session on app load
   * Also restores CSRF token from server
   */
  async function checkSession(): Promise<User | null> {
    const { setToken, clearToken } = useCsrf()
    isLoading.value = true
    try {
      const { data } = await useFetch<{ user: User | null; csrfToken: string | null }>(
        '/api/auth/session'
      )
      user.value = data.value?.user ?? null

      // Restore CSRF token
      if (data.value?.csrfToken) {
        setToken(data.value.csrfToken)
      } else {
        clearToken()
      }

      return user.value
    } catch {
      user.value = null
      clearToken()
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with email and password
   * Sets CSRF token from response for subsequent requests
   */
  async function login(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string }> {
    const { setToken } = useCsrf()
    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean; user: User; csrfToken: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: credentials
        }
      )
      user.value = response.user

      // Store CSRF token for subsequent requests
      if (response.csrfToken) {
        setToken(response.csrfToken)
      }

      return { success: true }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string }
      const message = err?.data?.message || err?.message || 'Login failed'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout current user
   * Clears CSRF token
   */
  async function logout(): Promise<void> {
    const { clearToken } = useCsrf()
    isLoading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      clearToken()
      isLoading.value = false
      // Redirect to login
      navigateTo('/admin/login')
    }
  }

  /**
   * Require authentication - redirect to login if not authenticated
   */
  async function requireAuth(): Promise<boolean> {
    if (user.value) return true

    await checkSession()

    if (!user.value) {
      navigateTo('/admin/login')
      return false
    }

    return true
  }

  return {
    // State
    user: readonly(user),
    isLoading: readonly(isLoading),
    isAuthenticated,

    // Role-based state
    isMaster,
    isAdmin,
    isEditor,
    canManageUsers,

    // Actions
    checkSession,
    login,
    logout,
    requireAuth,
    hasRole,
    getAssignableRoles
  }
}
