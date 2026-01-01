/**
 * PUT /api/admin/pricing/:id
 * Update a pricing tier
 */
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../../database/client'
import { z } from 'zod'

const updateTierSchema = z.object({
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  currency: z.string().length(3).optional(),
  period: z.enum(['month', 'year', 'one-time']).optional(),
  featured: z.boolean().optional(),
  ctaText: z.string().max(50).nullable().optional(),
  ctaUrl: z.string().max(200).optional(),
  order: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
  features: z.array(z.object({
    id: z.number().optional(), // Existing feature ID
    text: z.string().min(1).max(200),
    included: z.boolean().default(true),
    order: z.number().int().min(0).default(0)
  })).optional()
})

export default defineEventHandler(async event => {
  const db = useDatabase()
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid tier ID' })
  }

  const body = await readBody(event)
  const result = updateTierSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.flatten()
    })
  }

  const { features, price, ...tierData } = result.data

  // Check if tier exists
  const [existing] = await db
    .select()
    .from(schema.pricingTiers)
    .where(eq(schema.pricingTiers.id, id))

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Tier not found' })
  }

  // Update tier
  const updateData: Record<string, unknown> = { ...tierData, updatedAt: new Date() }
  if (price !== undefined) {
    updateData.price = price !== null ? Math.round(price * 100) : null
  }

  const [tier] = await db
    .update(schema.pricingTiers)
    .set(updateData)
    .where(eq(schema.pricingTiers.id, id))
    .returning()

  // Update features if provided (replace all)
  if (features !== undefined) {
    // Delete existing features
    await db
      .delete(schema.pricingFeatures)
      .where(eq(schema.pricingFeatures.tierId, id))

    // Insert new features
    if (features.length > 0) {
      await db.insert(schema.pricingFeatures).values(
        features.map((f, index) => ({
          tierId: id,
          text: f.text,
          included: f.included,
          order: f.order ?? index
        }))
      )
    }
  }

  return { success: true, tier }
})
