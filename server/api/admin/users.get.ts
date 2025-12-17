/**
 * List Users API Endpoint
 *
 * GET /api/admin/users
 * Returns: { users: User[] }
 *
 * Requires: admin+ role (enforced by middleware)
 */
import { desc } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const currentUser = event.context.user

  // Get all users (excluding password hash)
  const users = db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt
    })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt))
    .all()

  // If current user is admin (not master), filter out master users
  const filteredUsers = currentUser?.role === 'master'
    ? users
    : users.filter(u => u.role !== 'master')

  return { users: filteredUsers }
})

