/**
 * Authentication Types
 *
 * User roles hierarchy (each inherits from roles below):
 * - master: Developer/agency who builds the site (full access, can assign roles)
 * - admin: Client who owns the site (can manage content + users except master)
 * - editor: Client's employees (can only edit content)
 * - user: End users of the app (app features only, no admin access)
 */

export type UserRole = 'master' | 'admin' | 'editor' | 'user'

export interface User {
  id: number
  email: string
  name: string | null
  role: UserRole
  createdAt?: Date
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}
