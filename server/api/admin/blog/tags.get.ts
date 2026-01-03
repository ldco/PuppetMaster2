/**
 * GET /api/admin/blog/tags
 *
 * Get all blog tags for admin.
 */
import { asc } from 'drizzle-orm'
import { useDatabase, schema } from '../../../database/client'

export default defineEventHandler(async () => {
  const db = useDatabase()

  return db
    .select()
    .from(schema.blogTags)
    .orderBy(asc(schema.blogTags.name))
    .all()
})
