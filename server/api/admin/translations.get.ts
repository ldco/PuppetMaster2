/**
 * Admin Translations API - GET
 *
 * Returns CONTENT translations grouped by locale for admin management.
 * System translations (nav, auth, admin, etc.) are hidden from client.
 * Requires authentication.
 */
import { useDatabase, schema } from '../../database/client'
import { asc } from 'drizzle-orm'
import { isSystemKey } from '../../../i18n/system'

export default defineEventHandler(async (event) => {
  // Auth is handled by middleware for /api/admin/* routes

  const db = useDatabase()

  // Fetch all translations ordered by locale and key
  const rows = db
    .select()
    .from(schema.translations)
    .orderBy(asc(schema.translations.locale), asc(schema.translations.key))
    .all()

  // Group by locale, filtering out system keys
  const grouped: Record<string, Array<{ id: number; key: string; value: string }>> = {}

  for (const row of rows) {
    // Skip system translations - client cannot edit these
    if (isSystemKey(row.key)) {
      continue
    }

    if (!grouped[row.locale]) {
      grouped[row.locale] = []
    }
    grouped[row.locale].push({
      id: row.id,
      key: row.key,
      value: row.value
    })
  }

  console.log('[translations.get] Found', Object.values(grouped).flat().length, 'content translations')

  return {
    locales: ['en', 'ru', 'he'], // Supported locales
    translations: grouped
  }
})

