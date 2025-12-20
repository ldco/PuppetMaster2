/**
 * Authentication Types
 *
 * User roles hierarchy:
 * - master: Developer/agency who builds the site (full access)
 * - admin: Client who owns the site (can manage content + users except master)
 * - editor: Client's employees (can only edit content)
 */

export type UserRole = 'master' | 'admin' | 'editor'

export interface User {
  id: number
  email: string
  name: string | null
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}
