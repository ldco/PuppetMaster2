/**
 * GET /api/portfolio/:id
 *
 * Returns a single portfolio item by ID or slug.
 * Public endpoint - returns only published items unless admin.
 */
import { eq, and, or } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const idOrSlug = getRouterParam(event, 'id')
  const session = event.context.session

  if (!idOrSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID or slug required'
    })
  }

  // Try to find by ID (number) or slug (string)
  const isNumeric = /^\d+$/.test(idOrSlug)

  let item
  if (isNumeric) {
    item = db
      .select()
      .from(schema.portfolioItems)
      .where(eq(schema.portfolioItems.id, parseInt(idOrSlug)))
      .get()
  } else {
    item = db
      .select()
      .from(schema.portfolioItems)
      .where(eq(schema.portfolioItems.slug, idOrSlug))
      .get()
  }

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Portfolio item not found'
    })
  }

  // Check if item is published (unless admin)
  if (!item.published && !session?.userId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Portfolio item not found'
    })
  }

  return {
    ...item,
    tags: item.tags ? JSON.parse(item.tags) : []
  }
})

