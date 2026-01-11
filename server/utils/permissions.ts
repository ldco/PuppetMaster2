/**
 * Page-Based Access Control Utilities
 *
 * Simple model: each admin page is a permission.
 * If role has permission for a page, user sees it in nav.
 *
 * Works with dynamic roles stored in the `roles` table.
 * Falls back to legacy role column for backward compatibility.
 */
import { eq } from 'drizzle-orm'
import {
  type AdminPageId,
  type RolePermissions,
  type UserRole,
  ADMIN_PAGE_IDS,
  roles
} from '../database/schema'
import { useDatabase } from '../database/client'
import { safeJsonParse } from './json'

/**
 * Legacy role permissions (used when roleId is not set)
 * Each key is an admin page ID
 */
const LEGACY_ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  master: {
    // System pages
    users: true,
    roles: true,
    translations: true,
    settings: true,
    health: true,
    // Content pages
    sections: true,
    blog: true,
    portfolios: true,
    team: true,
    testimonials: true,
    faq: true,
    clients: true,
    pricing: true,
    features: true,
    contacts: true
  },
  admin: {
    // System pages (limited)
    users: true,
    roles: false,
    translations: true,
    settings: true,
    health: false,
    // Content pages (all)
    sections: true,
    blog: true,
    portfolios: true,
    team: true,
    testimonials: true,
    faq: true,
    clients: true,
    pricing: true,
    features: true,
    contacts: true
  },
  editor: {
    // System pages (none)
    users: false,
    roles: false,
    translations: true,
    settings: false,
    health: false,
    // Content pages (editorial)
    sections: true,
    blog: true,
    portfolios: false,
    team: false,
    testimonials: true,
    faq: true,
    clients: false,
    pricing: false,
    features: true,
    contacts: false
  }
}

/**
 * User object with role information
 */
interface UserWithRole {
  id: number
  role: UserRole
  roleId?: number | null
}

/**
 * Cached role permissions to avoid repeated DB queries
 */
const rolePermissionsCache = new Map<number, { permissions: RolePermissions; level: number }>()

/**
 * Clear the role permissions cache (call when roles are updated)
 */
export function clearRolePermissionsCache(): void {
  rolePermissionsCache.clear()
}

/**
 * Get role data from database by ID
 */
async function getRoleById(
  roleId: number
): Promise<{ permissions: RolePermissions; level: number } | null> {
  // Check cache first
  if (rolePermissionsCache.has(roleId)) {
    return rolePermissionsCache.get(roleId)!
  }

  const db = useDatabase()
  const role = await db.select().from(roles).where(eq(roles.id, roleId)).get()

  if (!role) return null

  const parsed = {
    permissions: safeJsonParse<RolePermissions>(role.permissions, {}),
    level: role.level
  }

  // Cache the result
  rolePermissionsCache.set(roleId, parsed)

  return parsed
}

/**
 * Get default empty permissions (no access to any page)
 */
function getEmptyPermissions(): RolePermissions {
  const perms: RolePermissions = {}
  for (const pageId of ADMIN_PAGE_IDS) {
    perms[pageId] = false
  }
  return perms
}

/**
 * Get permissions for a user
 * Falls back to legacy role column if roleId is not set
 */
export async function getUserPermissions(user: UserWithRole | null): Promise<RolePermissions> {
  if (!user) {
    return getEmptyPermissions()
  }

  // Try to get permissions from roleId first
  if (user.roleId) {
    const roleData = await getRoleById(user.roleId)
    if (roleData) {
      return roleData.permissions
    }
  }

  // Fall back to legacy role column
  return LEGACY_ROLE_PERMISSIONS[user.role] || LEGACY_ROLE_PERMISSIONS.editor
}

/**
 * Get user's role level (higher = more authority)
 */
export async function getUserRoleLevel(user: UserWithRole | null): Promise<number> {
  if (!user) return 0

  // Try to get level from roleId first
  if (user.roleId) {
    const roleData = await getRoleById(user.roleId)
    if (roleData) {
      return roleData.level
    }
  }

  // Fall back to legacy role levels
  const legacyLevels: Record<UserRole, number> = {
    master: 100,
    admin: 50,
    editor: 25
  }

  return legacyLevels[user.role] || 0
}

/**
 * Check if user has access to a specific admin page
 */
export async function hasPageAccess(
  user: UserWithRole | null,
  pageId: AdminPageId
): Promise<boolean> {
  const permissions = await getUserPermissions(user)
  return permissions[pageId] === true
}

/**
 * Check if user has access to all specified pages
 */
export async function hasAllPageAccess(
  user: UserWithRole | null,
  pageIds: AdminPageId[]
): Promise<boolean> {
  const permissions = await getUserPermissions(user)
  return pageIds.every(p => permissions[p] === true)
}

/**
 * Check if user has access to any of the specified pages
 */
export async function hasAnyPageAccess(
  user: UserWithRole | null,
  pageIds: AdminPageId[]
): Promise<boolean> {
  const permissions = await getUserPermissions(user)
  return pageIds.some(p => permissions[p] === true)
}

/**
 * Require access to a specific page - throws 403 if not met
 */
export async function requirePageAccess(
  user: UserWithRole | null,
  pageId: AdminPageId,
  message?: string
): Promise<void> {
  const hasAccess = await hasPageAccess(user, pageId)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      message: message || `Access denied: ${pageId}`
    })
  }
}

// Legacy aliases for backward compatibility during transition
export const hasPermission = hasPageAccess
export const requirePermission = requirePageAccess

/**
 * Check if user can manage another user based on role levels
 * A user can only manage users with lower role levels
 */
export async function canManageUserByLevel(
  actor: UserWithRole | null,
  target: UserWithRole | null
): Promise<boolean> {
  if (!actor || !target) return false

  const actorLevel = await getUserRoleLevel(actor)
  const targetLevel = await getUserRoleLevel(target)

  // Can only manage users with strictly lower levels
  return actorLevel > targetLevel
}

/**
 * Get all admin page IDs
 */
export function getAllPageIds(): readonly AdminPageId[] {
  return ADMIN_PAGE_IDS
}

/**
 * Calculate role level based on permissions
 * Higher permissions = higher level (more authority)
 *
 * - roles access → level 90 (can manage roles, nearly master)
 * - users access → level 50 (can manage users, admin-like)
 * - neither → level 25 (editor/content level)
 */
export function calculateLevel(permissions: RolePermissions): number {
  if (permissions.roles === true) return 90
  if (permissions.users === true) return 50
  return 25
}

/**
 * Validate that a permissions object is valid
 * (all keys must be valid page IDs with boolean values)
 */
export function isValidPermissionsObject(obj: unknown): obj is RolePermissions {
  if (typeof obj !== 'object' || obj === null) return false

  const record = obj as Record<string, unknown>
  for (const key of Object.keys(record)) {
    if (!ADMIN_PAGE_IDS.includes(key as AdminPageId)) return false
    if (typeof record[key] !== 'boolean') return false
  }
  return true
}
