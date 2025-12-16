/**
 * Logout API Endpoint
 *
 * POST /api/auth/logout
 * Clears session cookie and deletes session from database
 */
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'pm-session')

  if (sessionId) {
    const db = useDatabase()

    // Delete session from database
    db.delete(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .run()
  }

  // Clear session cookie
  deleteCookie(event, 'pm-session', {
    path: '/'
  })

  return { success: true }
})

