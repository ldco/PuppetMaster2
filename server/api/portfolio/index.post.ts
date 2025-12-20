/**
 * POST /api/portfolio
 *
 * Creates a new portfolio item.
 * Requires admin authentication.
 */
import { z } from 'zod'
import { useDatabase, schema } from '../../database/client'
import { sanitizeHtml, escapeHtml } from '../../utils/sanitize'

// Validation schema
const createSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional().nullable(), // Can be relative path like /uploads/xxx.webp
  thumbnailUrl: z.string().optional().nullable(),
  category: z.string().max(50).optional(),
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

  // Parse and validate request body
  const body = await readBody(event)
  const result = createSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: result.error.flatten()
    })
  }

  const data = result.data
  const db = useDatabase()

  // Check if slug already exists
  const existing = db
    .select()
    .from(schema.portfolioItems)
    .where(eq(schema.portfolioItems.slug, data.slug))
    .get()

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Slug already exists'
    })
  }

  // Sanitize HTML content and escape text fields
  const sanitizedContent = data.content ? sanitizeHtml(data.content) : null
  const sanitizedDescription = data.description ? escapeHtml(data.description) : null

  // Insert new portfolio item
  const newItem = db
    .insert(schema.portfolioItems)
    .values({
      slug: data.slug,
      title: escapeHtml(data.title),
      description: sanitizedDescription,
      content: sanitizedContent,
      imageUrl: data.imageUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      category: data.category ? escapeHtml(data.category) : null,
      tags: data.tags ? JSON.stringify(data.tags.map(t => escapeHtml(t))) : null,
      order: data.order || 0,
      published: data.published || false,
      publishedAt: data.published ? new Date() : null
    })
    .returning()
    .get()

  return {
    success: true,
    item: {
      ...newItem,
      tags: newItem.tags ? JSON.parse(newItem.tags) : []
    }
  }
})

// Import eq for slug check
import { eq } from 'drizzle-orm'

