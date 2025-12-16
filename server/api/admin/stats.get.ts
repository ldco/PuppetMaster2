/**
 * Admin Stats API
 *
 * Returns dashboard statistics for the admin panel.
 * Requires authentication.
 */
import { db } from '../../database/client'
import { portfolioItems, contactSubmissions } from '../../database/schema'
import { count, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = getCookie(event, 'auth_session')
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // Get portfolio count
  const [portfolioResult] = await db
    .select({ count: count() })
    .from(portfolioItems)

  // Get total contact submissions
  const [contactsResult] = await db
    .select({ count: count() })
    .from(contactSubmissions)

  // Get unread messages count
  const [unreadResult] = await db
    .select({ count: count() })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.read, false))

  return {
    portfolioItems: portfolioResult?.count ?? 0,
    contactSubmissions: contactsResult?.count ?? 0,
    unreadMessages: unreadResult?.count ?? 0
  }
})

