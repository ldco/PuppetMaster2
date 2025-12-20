/**
 * GET /api/admin/contacts
 *
 * Returns paginated contact form submissions.
 * Requires admin authentication.
 *
 * Query params:
 *   - unread: boolean - Only show unread submissions
 *   - page: number - Page number (default: 1)
 *   - limit: number - Items per page (default: 20, max: 100)
 */
import { eq, desc, sql } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'
import { parsePaginationParams, paginationClauses, buildPaginationMeta } from '../../utils/pagination'

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = event.context.session
  if (!session?.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const db = useDatabase()
  const query = getQuery(event)
  const params = parsePaginationParams(query as Record<string, unknown>)
  const { limitClause, offsetClause } = paginationClauses(params.page!, params.limit!)
  const unreadOnly = query.unread === 'true'

  // Build query with DB-level pagination
  let items
  let total: number

  if (unreadOnly) {
    items = db
      .select()
      .from(schema.contactSubmissions)
      .where(eq(schema.contactSubmissions.read, false))
      .orderBy(desc(schema.contactSubmissions.createdAt))
      .limit(limitClause)
      .offset(offsetClause)
      .all()

    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(schema.contactSubmissions)
      .where(eq(schema.contactSubmissions.read, false))
      .get()
    total = countResult?.count ?? 0
  } else {
    items = db
      .select()
      .from(schema.contactSubmissions)
      .orderBy(desc(schema.contactSubmissions.createdAt))
      .limit(limitClause)
      .offset(offsetClause)
      .all()

    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(schema.contactSubmissions)
      .get()
    total = countResult?.count ?? 0
  }

  // Count unread (always needed for badge)
  const unreadResult = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.contactSubmissions)
    .where(eq(schema.contactSubmissions.read, false))
    .get()
  const unreadCount = unreadResult?.count ?? 0

  const meta = buildPaginationMeta(total, params.page!, params.limit!, items)

  return {
    items,
    meta,
    unreadCount
  }
})

