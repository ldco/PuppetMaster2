/**
 * i18n Translations API - GET
 *
 * Returns all translations for a specific locale from the database.
 * These override the fallback translations in the locale files.
 */
import { useDatabase, schema } from '../../database/client'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const locale = getRouterParam(event, 'locale')

  if (!locale) {
    throw createError({ statusCode: 400, message: 'Locale is required' })
  }

  const db = useDatabase()

  // Fetch all translations for this locale
  const rows = db
    .select({ key: schema.translations.key, value: schema.translations.value })
    .from(schema.translations)
    .where(eq(schema.translations.locale, locale))
    .all()

  // Convert to nested object format for i18n
  // e.g., { 'nav.home': 'Home' } -> { nav: { home: 'Home' } }
  const result: Record<string, any> = {}

  for (const row of rows) {
    const keys = row.key.split('.')
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]!
      if (!current[key]) {
        current[key] = {}
      }
      current = current[key]
    }

    const lastKey = keys[keys.length - 1]!
    current[lastKey] = row.value
  }

  return result
})
