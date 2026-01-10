/**
 * List Roles API Endpoint
 *
 * GET /api/admin/roles
 * Returns: { roles: Role[], meta: { total: number } }
 *
 * Requires: manageRoles permission (master only)
 */
import { sql, desc } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'
import { requirePermission } from '../../utils/permissions'

export default defineEventHandler(async event => {
  const db = useDatabase()
  const currentUser = event.context.user

  // Require manageRoles permission
  await requirePermission(currentUser, 'manageRoles')

  // Get all roles with user counts
  const rolesData = db
    .select({
      id: schema.roles.id,
      name: schema.roles.name,
      slug: schema.roles.slug,
      description: schema.roles.description,
      permissions: schema.roles.permissions,
      level: schema.roles.level,
      isBuiltIn: schema.roles.isBuiltIn,
      color: schema.roles.color,
      icon: schema.roles.icon,
      createdAt: schema.roles.createdAt,
      updatedAt: schema.roles.updatedAt
    })
    .from(schema.roles)
    .orderBy(desc(schema.roles.level))
    .all()

  // Get user counts per role
  const userCounts = db
    .select({
      roleId: schema.users.roleId,
      count: sql<number>`count(*)`
    })
    .from(schema.users)
    .groupBy(schema.users.roleId)
    .all()

  const countMap = new Map<number, number>()
  for (const uc of userCounts) {
    if (uc.roleId !== null) {
      countMap.set(uc.roleId, uc.count)
    }
  }

  // Parse permissions and add user counts
  const roles = rolesData.map(role => ({
    ...role,
    permissions: JSON.parse(role.permissions),
    userCount: countMap.get(role.id) || 0
  }))

  return {
    roles,
    meta: { total: roles.length }
  }
})
