/**
 * DELETE /api/portfolio/:id
 *
 * Deletes a portfolio item.
 * Requires admin authentication.
 */
import { eq } from 'drizzle-orm'
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

  const id = getRouterParam(event, 'id')
  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid ID required'
    })
  }

  const db = useDatabase()

  // Check if item exists
  const existing = db
    .select()
    .from(schema.portfolioItems)
    .where(eq(schema.portfolioItems.id, parseInt(id)))
    .get()

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Portfolio item not found'
    })
  }

  // Delete item
  db.delete(schema.portfolioItems)
    .where(eq(schema.portfolioItems.id, parseInt(id)))
    .run()

  return {
    success: true,
    deleted: {
      id: parseInt(id),
      slug: existing.slug
    }
  }
})

