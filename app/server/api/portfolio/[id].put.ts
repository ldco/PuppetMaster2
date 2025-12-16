/**
 * PUT /api/portfolio/:id
 *
 * Updates a portfolio item.
 * Requires admin authentication.
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDatabase, schema } from '../../database/client'

// Validation schema (all fields optional for partial update)
const updateSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes').optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  content: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  tags: z.array(z.string()).optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional()
})

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

  // If slug is being changed, check it doesn't conflict
  if (data.slug && data.slug !== existing.slug) {
    const slugConflict = db
      .select()
      .from(schema.portfolioItems)
      .where(eq(schema.portfolioItems.slug, data.slug))
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
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.content !== undefined) updateData.content = data.content
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
  if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl
  if (data.category !== undefined) updateData.category = data.category
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)
  if (data.order !== undefined) updateData.order = data.order
  if (data.published !== undefined) {
    updateData.published = data.published
    // Set publishedAt when first published
    if (data.published && !existing.published) {
      updateData.publishedAt = new Date()
    }
  }

  // Update item
  const updated = db
    .update(schema.portfolioItems)
    .set(updateData)
    .where(eq(schema.portfolioItems.id, parseInt(id)))
    .returning()
    .get()

  return {
    success: true,
    item: {
      ...updated,
      tags: updated.tags ? JSON.parse(updated.tags) : []
    }
  }
})

