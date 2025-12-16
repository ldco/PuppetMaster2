/**
 * Auth Composable
 *
 * Client-side authentication state management.
 * Provides login, logout, and session checking.
 */

interface User {
  id: number
  email: string
  name: string | null
  role: 'admin' | 'editor'
}

interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const isLoading = useState<boolean>('auth-loading', () => false)

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Check current session on app load
   */
  async function checkSession(): Promise<User | null> {
    isLoading.value = true
    try {
      const { data } = await useFetch<{ user: User | null }>('/api/auth/session')
      user.value = data.value?.user ?? null
      return user.value
    } catch {
      user.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with email and password
   */
  async function login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean; user: User }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      user.value = response.user
      return { success: true }
    } catch (error: any) {
      const message = error?.data?.message || error?.message || 'Login failed'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout current user
   */
  async function logout(): Promise<void> {
    isLoading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
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

    // Actions
    checkSession,
    login,
    logout,
    requireAuth
  }
}

