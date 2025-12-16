/**
 * Admin Translations API - DELETE
 *
 * Delete a CONTENT translation by ID.
 * System translations cannot be deleted.
 * Requires authentication.
 */
import { useDatabase, schema } from '../../../database/client'
import { eq } from 'drizzle-orm'
import { isSystemKey } from '../../../../i18n/system'

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = getCookie(event, 'auth_session')
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid ID' })
  }

  const db = useDatabase()

  // Check if translation exists and is not a system key
  const existing = db
    .select()
    .from(schema.translations)
    .where(eq(schema.translations.id, id))
    .get()

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Translation not found' })
  }

  if (isSystemKey(existing.key)) {
    throw createError({ statusCode: 403, message: 'System translations cannot be deleted' })
  }

  db.delete(schema.translations).where(eq(schema.translations.id, id)).run()

  return { success: true }
})

