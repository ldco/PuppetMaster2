/**
 * GET /api/portfolio
 *
 * Returns list of portfolio items.
 * Public endpoint - returns only published items unless admin.
 *
 * Query params:
 *   - all: boolean - Include unpublished (admin only)
 *   - category: string - Filter by category
 *   - limit: number - Limit results
 *   - offset: number - Pagination offset
 */
import { eq, desc, and } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const query = getQuery(event)
  const session = event.context.session

  // Check if requesting all (including unpublished)
  const includeAll = query.all === 'true' && session?.userId

  // Build query conditions
  const conditions = []
  if (!includeAll) {
    conditions.push(eq(schema.portfolioItems.published, true))
  }

  if (query.category) {
    conditions.push(eq(schema.portfolioItems.category, query.category as string))
  }

  // Execute query
  let items
  if (conditions.length > 0) {
    items = db
      .select()
      .from(schema.portfolioItems)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(desc(schema.portfolioItems.order), desc(schema.portfolioItems.createdAt))
      .all()
  } else {
    items = db
      .select()
      .from(schema.portfolioItems)
      .orderBy(desc(schema.portfolioItems.order), desc(schema.portfolioItems.createdAt))
      .all()
  }

  // Apply pagination
  const limit = query.limit ? parseInt(query.limit as string) : undefined
  const offset = query.offset ? parseInt(query.offset as string) : 0

  if (limit) {
    items = items.slice(offset, offset + limit)
  }

  // Parse tags JSON for each item
  return items.map(item => ({
    ...item,
    tags: item.tags ? JSON.parse(item.tags) : []
  }))
})

