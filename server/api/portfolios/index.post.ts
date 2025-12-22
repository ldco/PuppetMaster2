/**
 * POST /api/portfolios
 *
 * Creates a new portfolio.
 * Requires admin authentication.
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'
import { escapeHtml } from '../../utils/sanitize'

// Validation schema
const createSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['gallery', 'case_study']),
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
    .from(schema.portfolios)
    .where(eq(schema.portfolios.slug, data.slug))
    .get()

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Slug already exists'
    })
  }

  // Insert new portfolio
  const newPortfolio = db
    .insert(schema.portfolios)
    .values({
      slug: data.slug,
      name: escapeHtml(data.name),
      description: data.description ? escapeHtml(data.description) : null,
      type: data.type,
      coverImageUrl: data.coverImageUrl || null,
      coverThumbnailUrl: data.coverThumbnailUrl || null,
      order: data.order || 0,
      published: data.published || false
    })
    .returning()
    .get()

  return {
    success: true,
    portfolio: newPortfolio
  }
})
