/**
 * GET /api/admin/pricing
 * Get all pricing tiers with translations (including unpublished) for admin
 */
import { asc, eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../../database/client'

export default defineEventHandler(async () => {
  const db = useDatabase()

  // Get all tiers ordered by order
  const tiers = await db
    .select()
    .from(schema.pricingTiers)
    .orderBy(asc(schema.pricingTiers.order))

  // Get all tier translations
  const allTierTranslations = await db
    .select()
    .from(schema.pricingTierTranslations)

  // Get features and feature translations for each tier
  const tiersWithFeatures = await Promise.all(
    tiers.map(async tier => {
      const features = await db
        .select()
        .from(schema.pricingFeatures)
        .where(eq(schema.pricingFeatures.tierId, tier.id))
        .orderBy(asc(schema.pricingFeatures.order))

      // Get translations for these features
      const featureIds = features.map(f => f.id)
      let featureTranslations: typeof schema.pricingFeatureTranslations.$inferSelect[] = []

      if (featureIds.length > 0) {
        // Get all feature translations and filter to this tier's features
        const allTranslations = await db
          .select()
          .from(schema.pricingFeatureTranslations)

        featureTranslations = allTranslations.filter(t =>
          featureIds.includes(t.featureId)
        )
      }

      // Group feature translations by featureId
      const featureTranslationsByFeature = featureTranslations.reduce<
        Record<number, Record<string, string | null>>
      >((acc, t) => {
        if (!acc[t.featureId]) acc[t.featureId] = {}
        acc[t.featureId]![t.locale] = t.text
        return acc
      }, {})

      // Group tier translations by locale
      const tierTranslations = allTierTranslations
        .filter(t => t.tierId === tier.id)
        .reduce(
          (acc, t) => {
            acc[t.locale] = {
              name: t.name,
              description: t.description,
              ctaText: t.ctaText
            }
            return acc
          },
          {} as Record<string, { name: string | null; description: string | null; ctaText: string | null }>
        )

      return {
        ...tier,
        // Convert price from cents to dollars for display
        price: tier.price !== null ? tier.price / 100 : null,
        translations: tierTranslations,
        features: features.map(f => ({
          ...f,
          translations: featureTranslationsByFeature[f.id] || {}
        }))
      }
    })
  )

  return tiersWithFeatures
})
