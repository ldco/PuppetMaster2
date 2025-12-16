/**
 * Dynamic Locale Loader
 *
 * Single loader for ALL locales - no need to create per-locale files!
 * All translations come from DATABASE ONLY - no fallbacks!
 *
 * If translation is missing → key shows (makes problem obvious)
 * If API fails → empty object (keys show as-is)
 *
 * On fresh install, run: npm run db:seed to populate translations
 */

/**
 * Load messages for a locale from database
 * Called by Nuxt i18n for each locale
 */
export default defineI18nLocale(async (locale) => {
  try {
    const messages = await $fetch<Record<string, any>>(`/api/i18n/${locale}`)
    return messages || {}
  } catch {
    // API error - return empty, keys will show as-is (making problem obvious)
    console.warn(`[i18n] Failed to load translations for locale: ${locale}`)
    return {}
  }
})

