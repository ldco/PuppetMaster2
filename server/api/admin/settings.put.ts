/**
 * PUT /api/admin/settings
 *
 * Updates site settings. Requires admin authentication (protected by middleware).
 * Accepts an object of key-value pairs to update.
 *
 * Body: { "site.name": "New Name", "contact.email": "new@email.com" }
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDatabase, schema } from '../../database/client'

// Validation schema for settings update
const updateSchema = z.record(z.string(), z.string().nullable())

export default defineEventHandler(async event => {
  // Auth is handled by middleware - event.context.user is set

  // Parse and validate request body
  const body = await readBody(event)
  const result = updateSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
      data: result.error.flatten()
    })
  }

  const updates = result.data
  const db = useDatabase()

  // Update each setting
  const updated: string[] = []
  const created: string[] = []

  for (const [key, value] of Object.entries(updates)) {
    // Check if setting exists
    const existing = db.select().from(schema.settings).where(eq(schema.settings.key, key)).get()

    if (existing) {
      // Update existing setting
      db.update(schema.settings)
        .set({
          value: value,
          updatedAt: new Date()
        })
        .where(eq(schema.settings.key, key))
        .run()
      updated.push(key)
    } else {
      // Create new setting
      // Determine group from key prefix
      const group = key.split('.')[0] || 'general'
      db.insert(schema.settings)
        .values({
          key,
          value,
          type: 'string',
          group
        })
        .run()
      created.push(key)
    }
  }

  return {
    success: true,
    updated,
    created
  }
})
