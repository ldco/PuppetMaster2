/**
 * GET /api/admin/contacts
 *
 * Returns all contact form submissions.
 * Requires admin authentication.
 *
 * Query params:
 *   - unread: boolean - Only show unread submissions
 *   - limit: number - Limit results
 *   - offset: number - Pagination offset
 */
import { eq, desc } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'

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

  // Build query
  let items
  if (query.unread === 'true') {
    items = db
      .select()
      .from(schema.contactSubmissions)
      .where(eq(schema.contactSubmissions.read, false))
      .orderBy(desc(schema.contactSubmissions.createdAt))
      .all()
  } else {
    items = db
      .select()
      .from(schema.contactSubmissions)
      .orderBy(desc(schema.contactSubmissions.createdAt))
      .all()
  }

  // Apply pagination
  const limit = query.limit ? parseInt(query.limit as string) : undefined
  const offset = query.offset ? parseInt(query.offset as string) : 0

  if (limit) {
    items = items.slice(offset, offset + limit)
  }

  // Count unread
  const unreadCount = db
    .select()
    .from(schema.contactSubmissions)
    .where(eq(schema.contactSubmissions.read, false))
    .all().length

  return {
    items,
    total: items.length,
    unreadCount
  }
})

