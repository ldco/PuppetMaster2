/**
 * GET /api/settings
 *
 * Returns all site settings grouped by category.
 * Public endpoint - returns only non-sensitive settings.
 */
import { useDatabase, schema } from '../../database/client'

export default defineEventHandler(async () => {
  const db = useDatabase()

  // Get all settings
  const allSettings = db.select().from(schema.settings).all()

  // Group settings by their group field
  const grouped: Record<string, Record<string, string | null>> = {}

  for (const setting of allSettings) {
    const group = setting.group || 'general'
    if (!grouped[group]) {
      grouped[group] = {}
    }
    // Extract the key part after the group prefix (e.g., 'site.name' -> 'name')
    const keyParts = setting.key.split('.')
    const shortKey = keyParts.length > 1 ? keyParts.slice(1).join('.') : setting.key
    grouped[group][shortKey] = setting.value
  }

  return grouped
})

