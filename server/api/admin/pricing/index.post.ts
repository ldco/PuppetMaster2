/**
 * POST /api/admin/pricing
 * Create a new pricing tier
 */
import { useDatabase, schema } from '../../../database/client'
import { z } from 'zod'

const createTierSchema = z.object({
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0).nullable().optional(), // Price in dollars (converted to cents)
  currency: z.string().length(3).default('USD'),
  period: z.enum(['month', 'year', 'one-time']).default('month'),
  featured: z.boolean().default(false),
  ctaText: z.string().max(50).optional(),
  ctaUrl: z.string().max(200).default('/contact'),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
  features: z.array(z.object({
    text: z.string().min(1).max(200),
    included: z.boolean().default(true),
    order: z.number().int().min(0).default(0)
  })).optional()
})

export default defineEventHandler(async event => {
  const db = useDatabase()
  const body = await readBody(event)

  const result = createTierSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.flatten()
    })
  }

  const { features, price, ...tierData } = result.data

  // Insert tier (convert price to cents)
  const [tier] = await db
    .insert(schema.pricingTiers)
    .values({
      ...tierData,
      price: price !== null && price !== undefined ? Math.round(price * 100) : null
    })
    .returning()

  if (!tier) {
    throw createError({ statusCode: 500, message: 'Failed to create tier' })
  }

  // Insert features if provided
  if (features && features.length > 0) {
    await db.insert(schema.pricingFeatures).values(
      features.map((f, index) => ({
        tierId: tier.id,
        text: f.text,
        included: f.included,
        order: f.order ?? index
      }))
    )
  }

  return { success: true, tier }
})
