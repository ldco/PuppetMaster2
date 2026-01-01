/**
 * PUT /api/admin/settings
 *
 * Updates site settings. Requires admin authentication (protected by middleware).
 * Accepts an object of key-value pairs to update.
 *
 * Body: { "site.name": "New Name", "contact.email": "new@email.com" }
 *
 * SECURITY: Only whitelisted setting keys are allowed to prevent arbitrary data injection.
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { schema, transactionSync } from '../../database/client'

/**
 * Whitelist of allowed setting keys.
 * Add new keys here when extending the settings system.
 */
const ALLOWED_SETTINGS_KEYS = new Set([
  // Contact information
  'contact.email',
  'contact.phone',
  'contact.location',

  // Legal
  'legal.companyName',

  // Social - Messaging
  'social.telegram',
  'social.whatsapp',
  'social.viber',
  'social.discord',
  'social.max',

  // Social - Networks
  'social.instagram',
  'social.facebook',
  'social.twitter',
  'social.threads',
  'social.tiktok',
  'social.pinterest',
  'social.vk',

  // Social - Video
  'social.youtube',
  'social.twitch',

  // Social - Professional
  'social.linkedin',
  'social.medium',

  // Social - Developer
  'social.github',
  'social.gitlab',
  'social.dribbble',
  'social.behance',

  // SEO
  'seo.title',
  'seo.description',
  'seo.keywords'
])

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

  // SECURITY: Validate all keys against whitelist
  const invalidKeys = Object.keys(updates).filter(key => !ALLOWED_SETTINGS_KEYS.has(key))
  if (invalidKeys.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid settings keys',
      data: { invalidKeys, message: `Unknown setting keys: ${invalidKeys.join(', ')}` }
    })
  }

  // Update each setting atomically in a transaction
  const changes = transactionSync(db => {
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

    return { updated, created }
  })

  return {
    success: true,
    ...changes
  }
})
