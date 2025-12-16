/**
 * Admin Translations API - DELETE
 *
 * Delete a translation by ID.
 * Requires authentication.
 */
import { useDatabase, schema } from '../../../database/client'
import { eq } from 'drizzle-orm'

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
  db.delete(schema.translations).where(eq(schema.translations.id, id)).run()

  return { success: true }
})

