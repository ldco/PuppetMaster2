/**
 * PUT /api/admin/pricing/:id/translations
 * Update translations for a pricing tier and its features
 */
import { eq, and } from 'drizzle-orm'
import { useDatabase, schema } from '../../../../database/client'
import { z } from 'zod'

const translationsSchema = z.object({
  locale: z.string().min(2).max(5),
  tier: z.object({
    name: z.string().max(100).nullable().optional(),
    description: z.string().max(500).nullable().optional(),
    ctaText: z.string().max(50).nullable().optional()
  }),
  features: z
    .array(
      z.object({
        featureId: z.number(),
        text: z.string().max(200).nullable()
      })
    )
    .optional()
})

export default defineEventHandler(async event => {
  const db = useDatabase()
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid tier ID' })
  }

  const body = await readBody(event)
  const result = translationsSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.flatten()
    })
  }

  const { locale, tier: tierTranslation, features: featureTranslations } = result.data

  // Check if tier exists
  const [existing] = await db
    .select()
    .from(schema.pricingTiers)
    .where(eq(schema.pricingTiers.id, id))

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Tier not found' })
  }

  // Upsert tier translation
  const [existingTierTranslation] = await db
    .select()
    .from(schema.pricingTierTranslations)
    .where(
      and(eq(schema.pricingTierTranslations.tierId, id), eq(schema.pricingTierTranslations.locale, locale))
    )

  if (existingTierTranslation) {
    await db
      .update(schema.pricingTierTranslations)
      .set({
        name: tierTranslation.name,
        description: tierTranslation.description,
        ctaText: tierTranslation.ctaText,
        updatedAt: new Date()
      })
      .where(eq(schema.pricingTierTranslations.id, existingTierTranslation.id))
  } else {
    await db.insert(schema.pricingTierTranslations).values({
      tierId: id,
      locale,
      name: tierTranslation.name,
      description: tierTranslation.description,
      ctaText: tierTranslation.ctaText
    })
  }

  // Upsert feature translations
  if (featureTranslations && featureTranslations.length > 0) {
    for (const ft of featureTranslations) {
      const [existingFeatureTranslation] = await db
        .select()
        .from(schema.pricingFeatureTranslations)
        .where(
          and(
            eq(schema.pricingFeatureTranslations.featureId, ft.featureId),
            eq(schema.pricingFeatureTranslations.locale, locale)
          )
        )

      if (existingFeatureTranslation) {
        await db
          .update(schema.pricingFeatureTranslations)
          .set({
            text: ft.text,
            updatedAt: new Date()
          })
          .where(eq(schema.pricingFeatureTranslations.id, existingFeatureTranslation.id))
      } else {
        await db.insert(schema.pricingFeatureTranslations).values({
          featureId: ft.featureId,
          locale,
          text: ft.text
        })
      }
    }
  }

  return { success: true }
})
