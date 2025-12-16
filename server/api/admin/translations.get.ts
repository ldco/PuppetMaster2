/**
 * Admin Translations API - GET
 *
 * Returns all translations grouped by locale for admin management.
 * Requires authentication.
 */
import { useDatabase, schema } from '../../database/client'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Auth is handled by middleware for /api/admin/* routes
  // No need to check here - middleware already validated session

  const db = useDatabase()

  // Fetch all translations ordered by locale and key
  const rows = db
    .select()
    .from(schema.translations)
    .orderBy(asc(schema.translations.locale), asc(schema.translations.key))
    .all()

  console.log('[translations.get] Found', rows.length, 'translations')

  // Group by locale
  const grouped: Record<string, Array<{ id: number; key: string; value: string }>> = {}

  for (const row of rows) {
    if (!grouped[row.locale]) {
      grouped[row.locale] = []
    }
    grouped[row.locale].push({
      id: row.id,
      key: row.key,
      value: row.value
    })
  }

  return {
    locales: ['en', 'ru', 'he'], // Supported locales
    translations: grouped
  }
})

