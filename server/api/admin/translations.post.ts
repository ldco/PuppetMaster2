/**
 * Admin Translations API - POST
 *
 * Create or update a CONTENT translation.
 * System translations (nav, auth, admin, etc.) cannot be modified.
 * Requires authentication.
 */
import { useDatabase, schema } from '../../database/client'
import { eq, and } from 'drizzle-orm'
import { isSystemKey } from '../../../i18n/system'

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = getCookie(event, 'auth_session')
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { locale, key, value } = body

  if (!locale || !key || value === undefined) {
    throw createError({ statusCode: 400, message: 'locale, key, and value are required' })
  }

  // Prevent editing system translations
  if (isSystemKey(key)) {
    throw createError({ statusCode: 403, message: 'System translations cannot be modified' })
  }

  const db = useDatabase()

  // Check if translation exists
  const existing = db
    .select()
    .from(schema.translations)
    .where(and(eq(schema.translations.locale, locale), eq(schema.translations.key, key)))
    .limit(1)
    .all()

  if (existing.length > 0) {
    // Update existing
    db
      .update(schema.translations)
      .set({ value, updatedAt: new Date() })
      .where(eq(schema.translations.id, existing[0].id))
      .run()

    return { success: true, action: 'updated', id: existing[0].id }
  } else {
    // Create new
    const result = db
      .insert(schema.translations)
      .values({ locale, key, value })
      .returning({ id: schema.translations.id })
      .all()

    return { success: true, action: 'created', id: result[0].id }
  }
})

