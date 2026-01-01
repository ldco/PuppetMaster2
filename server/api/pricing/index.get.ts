/**
 * GET /api/pricing
 * Get all pricing tiers with features (public endpoint)
 * Supports locale via ?locale=ru query param
 */
import { eq, asc } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'

export default defineEventHandler(async event => {
  const db = useDatabase()
  const query = getQuery(event)
  const locale = (query.locale as string) || 'en'

  // Get all published tiers ordered by order
  const tiers = await db
    .select()
    .from(schema.pricingTiers)
    .where(eq(schema.pricingTiers.published, true))
    .orderBy(asc(schema.pricingTiers.order))

  // Get translations for all tiers
  const tierTranslations = await db
    .select()
    .from(schema.pricingTierTranslations)
    .where(eq(schema.pricingTierTranslations.locale, locale))

  const tierTranslationMap = new Map(tierTranslations.map(t => [t.tierId, t]))

  // Get features for each tier with translations
  const tiersWithFeatures = await Promise.all(
    tiers.map(async tier => {
      const features = await db
        .select()
        .from(schema.pricingFeatures)
        .where(eq(schema.pricingFeatures.tierId, tier.id))
        .orderBy(asc(schema.pricingFeatures.order))

      // Get feature translations for this tier's features
      const featureIds = features.map(f => f.id)
      let filteredFeatureTranslations: typeof schema.pricingFeatureTranslations.$inferSelect[] = []

      if (featureIds.length > 0) {
        // Get all feature translations for this locale
        const allTranslations = await db
          .select()
          .from(schema.pricingFeatureTranslations)
          .where(eq(schema.pricingFeatureTranslations.locale, locale))

        // Filter to only include translations for this tier's features
        filteredFeatureTranslations = allTranslations.filter(t =>
          featureIds.includes(t.featureId)
        )
      }

      const featureTranslationMap = new Map(filteredFeatureTranslations.map(t => [t.featureId, t]))

      // Apply tier translation (fallback to default)
      const tierTranslation = tierTranslationMap.get(tier.id)

      return {
        ...tier,
        name: tierTranslation?.name || tier.name,
        description: tierTranslation?.description || tier.description,
        ctaText: tierTranslation?.ctaText || tier.ctaText,
        // Convert price from cents to dollars for display
        price: tier.price !== null ? tier.price / 100 : null,
        features: features.map(f => {
          const fTranslation = featureTranslationMap.get(f.id)
          return {
            ...f,
            text: fTranslation?.text || f.text
          }
        })
      }
    })
  )

  return tiersWithFeatures
})
