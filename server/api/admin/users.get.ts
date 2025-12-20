/**
 * List Users API Endpoint
 *
 * GET /api/admin/users
 * Query params: page, limit
 * Returns: { users: User[], meta: PaginationMeta }
 *
 * Requires: admin+ role (enforced by middleware)
 */
import { desc, sql, ne } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'
import {
  parsePaginationParams,
  paginationClauses,
  buildPaginationMeta
} from '../../utils/pagination'

export default defineEventHandler(async event => {
  const db = useDatabase()
  const currentUser = event.context.user
  const query = getQuery(event)
  const params = parsePaginationParams(query as Record<string, unknown>)
  const { limitClause, offsetClause } = paginationClauses(params.page!, params.limit!)

  // Build query based on user role
  const isMaster = currentUser?.role === 'master'

  // Get paginated users (excluding password hash)
  let usersQuery = db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt
    })
    .from(schema.users)

  // If current user is admin (not master), filter out master users
  if (!isMaster) {
    usersQuery = usersQuery.where(ne(schema.users.role, 'master')) as typeof usersQuery
  }

  const users = usersQuery
    .orderBy(desc(schema.users.createdAt))
    .limit(limitClause)
    .offset(offsetClause)
    .all()

  // Get total count for pagination
  let countResult
  if (isMaster) {
    countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .get()
  } else {
    countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(ne(schema.users.role, 'master'))
      .get()
  }

  const total = countResult?.count ?? 0
  const meta = buildPaginationMeta(total, params.page!, params.limit!, users)

  return { users, meta }
})
