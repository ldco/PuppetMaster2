/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TRANSLATION LOADER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Merges two translation sources:
 *
 *   1. SYSTEM (from i18n/system.ts)
 *      - Developer-controlled, version controlled
 *      - nav.*, auth.*, admin.*, common.*, theme.*, footer.*, validation.*
 *      - NOT editable in Admin Panel
 *
 *   2. CONTENT (from database via API)
 *      - Client-editable via Admin Panel
 *      - hero.*, about.*, portfolio.*, services.*, contact.*, seo.*, cta.*
 *
 * Content keys override system keys if there's a conflict (unlikely).
 * On fresh install, run: npm run db:seed to populate content translations.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { getSystemTranslations } from './system'

/**
 * Load messages for a locale
 * Merges system translations (code) with content translations (database)
 */
export default defineI18nLocale(async locale => {
  // 1. Get system translations (always available, from code)
  const systemMessages = getSystemTranslations(locale)

  // 2. Get content translations from database
  let contentMessages: Record<string, string> = {}
  try {
    contentMessages = await $fetch<Record<string, any>>(`/api/i18n/${locale}`)
  } catch {
    console.warn(`[i18n] Failed to load content translations for: ${locale}`)
  }

  // 3. Merge: system first, then content (content can override)
  return {
    ...systemMessages,
    ...contentMessages
  }
})
