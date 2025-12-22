/**
 * PUT /api/portfolios/[id]
 *
 * Updates a portfolio.
 * Requires admin authentication.
 */
import { z } from 'zod'
import { eq, and, ne } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'
import { escapeHtml } from '../../utils/sanitize'

// Validation schema - all fields optional for partial update
const updateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes')
    .optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['gallery', 'case_study']).optional(),
  coverImageUrl: z.string().optional().nullable(),
  coverThumbnailUrl: z.string().optional().nullable(),
  order: z.number().int().optional(),
  published: z.boolean().optional()
})

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

  // Parse and validate request body
  const body = await readBody(event)
  const result = updateSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: result.error.flatten()
    })
  }

  const data = result.data

  // Check if new slug conflicts with another portfolio
  if (data.slug && data.slug !== existing.slug) {
    const slugConflict = db
      .select()
      .from(schema.portfolios)
      .where(and(eq(schema.portfolios.slug, data.slug), ne(schema.portfolios.id, portfolioId)))
      .get()

    if (slugConflict) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Slug already exists'
      })
    }
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updatedAt: new Date()
  }

  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.name !== undefined) updateData.name = escapeHtml(data.name)
  if (data.description !== undefined)
    updateData.description = data.description ? escapeHtml(data.description) : null
  if (data.type !== undefined) updateData.type = data.type
  if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl
  if (data.coverThumbnailUrl !== undefined) updateData.coverThumbnailUrl = data.coverThumbnailUrl
  if (data.order !== undefined) updateData.order = data.order
  if (data.published !== undefined) updateData.published = data.published

  // Update portfolio
  const updated = db
    .update(schema.portfolios)
    .set(updateData)
    .where(eq(schema.portfolios.id, portfolioId))
    .returning()
    .get()

  return {
    success: true,
    portfolio: updated
  }
})
