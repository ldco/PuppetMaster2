/**
 * DELETE /api/portfolios/[id]
 *
 * Deletes a portfolio and all its items (cascade).
 * Requires admin authentication.
 */
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'

export default defineEventHandler(async event => {
  // Check authentication
  const session = event.context.session
  if (!session?.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const id = getRouterParam(event, 'id')

  // Validate ID
  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid portfolio ID'
    })
  }

  const portfolioId = parseInt(id)
  const db = useDatabase()

  // Check if portfolio exists
  const existing = db
    .select()
    .from(schema.portfolios)
    .where(eq(schema.portfolios.id, portfolioId))
    .get()

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Portfolio not found'
    })
  }

  // Delete portfolio (items cascade automatically due to foreign key)
  db.delete(schema.portfolios).where(eq(schema.portfolios.id, portfolioId)).run()

  return {
    success: true,
    deleted: {
      id: portfolioId,
      slug: existing.slug
    }
  }
})
