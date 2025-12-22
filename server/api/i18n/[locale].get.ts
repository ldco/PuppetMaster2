/**
 * i18n Translations API - GET
 *
 * Returns all translations for a specific locale from the database.
 * Uses in-memory cache for performance.
 */
import { translationCache } from '../../utils/translationCache'

export default defineEventHandler(async event => {
  const locale = getRouterParam(event, 'locale')

  if (!locale) {
    throw createError({ statusCode: 400, message: 'Locale is required' })
  }

  // Get translations from cache (or DB if not cached)
  const flatTranslations = translationCache.get(locale)

  // Convert to nested object format for i18n
  // e.g., { 'nav.home': 'Home' } -> { nav: { home: 'Home' } }
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(flatTranslations)) {
    const keys = key.split('.')
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]!
      if (!current[k]) {
        current[k] = {}
      }
      current = current[k]
    }

    const lastKey = keys[keys.length - 1]!
    current[lastKey] = value
  }

  return result
})
