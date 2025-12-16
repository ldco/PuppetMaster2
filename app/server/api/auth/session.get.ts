/**
 * Session API Endpoint
 *
 * GET /api/auth/session
 * Returns current user session if valid, null otherwise
 */
import { eq, and, gt } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'pm-session')

  if (!sessionId) {
    return { user: null }
  }

  const db = useDatabase()

  // Find valid session (not expired)
  const session = db
    .select()
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.id, sessionId),
        gt(schema.sessions.expiresAt, new Date())
      )
    )
    .get()

  if (!session) {
    // Clear invalid cookie
    deleteCookie(event, 'pm-session', { path: '/' })
    return { user: null }
  }

  // Get user
  const user = db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role
    })
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .get()

  if (!user) {
    // User deleted, clear session
    db.delete(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .run()
    deleteCookie(event, 'pm-session', { path: '/' })
    return { user: null }
  }

  return { user }
})

