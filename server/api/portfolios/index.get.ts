/**
 * GET /api/portfolios
 *
 * Returns list of portfolios.
 * Public endpoint - returns only published portfolios unless admin.
 *
 * Query params:
 *   - all: boolean - Include unpublished (admin only)
 *   - type: 'gallery' | 'case_study' - Filter by type
 *   - limit: number - Limit results
 *   - offset: number - Pagination offset
 *   - includeItems: boolean - Include portfolio items for each portfolio
 */
import { eq, desc, and } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'

export default defineEventHandler(async event => {
  const db = useDatabase()
  const query = getQuery(event)
  const session = event.context.session

  // Check if requesting all (including unpublished)
  const includeAll = query.all === 'true' && session?.userId
  const includeItems = query.includeItems === 'true'

  // Build query conditions for portfolios
  const conditions = []
  if (!includeAll) {
    conditions.push(eq(schema.portfolios.published, true))
  }

  if (query.type && (query.type === 'gallery' || query.type === 'case_study')) {
    conditions.push(eq(schema.portfolios.type, query.type))
  }

  // Parse pagination params
  const limit = query.limit ? parseInt(query.limit as string) : undefined
  const offset = query.offset ? parseInt(query.offset as string) : 0

  // Execute query with database-level pagination
  const whereClause =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions)

  const baseQuery = db
    .select()
    .from(schema.portfolios)
    .orderBy(desc(schema.portfolios.order), desc(schema.portfolios.createdAt))

  let portfolios
  if (whereClause) {
    if (limit) {
      portfolios = baseQuery.where(whereClause).limit(limit).offset(offset).all()
    } else {
      portfolios = baseQuery.where(whereClause).all()
    }
  } else {
    if (limit) {
      portfolios = baseQuery.limit(limit).offset(offset).all()
    } else {
      portfolios = baseQuery.all()
    }
  }

  // If includeItems, fetch items for each portfolio
  if (includeItems && portfolios.length > 0) {
    const portfolioIds = portfolios.map(p => p.id)

    // Fetch all items for these portfolios
    const itemConditions = [
      eq(schema.portfolioItems.published, true)
    ]

    const allItems = db
      .select()
      .from(schema.portfolioItems)
      .where(and(...itemConditions))
      .orderBy(desc(schema.portfolioItems.order), desc(schema.portfolioItems.createdAt))
      .all()

    // Filter items by portfolio IDs and group by portfolioId
    const itemsByPortfolio = new Map<number, typeof allItems>()
    for (const item of allItems) {
      if (portfolioIds.includes(item.portfolioId)) {
        const existing = itemsByPortfolio.get(item.portfolioId) || []
        // Parse tags JSON
        const parsedItem = {
          ...item,
          tags: item.tags ? JSON.parse(item.tags) : []
        }
        existing.push(parsedItem)
        itemsByPortfolio.set(item.portfolioId, existing)
      }
    }

    // Attach items to each portfolio
    return portfolios.map(portfolio => ({
      ...portfolio,
      items: itemsByPortfolio.get(portfolio.id) || []
    }))
  }

  return portfolios
})
