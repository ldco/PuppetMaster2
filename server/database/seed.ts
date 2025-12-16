/**
 * Database Seed Script
 *
 * Creates initial admin user, default settings, and translations.
 * Run with: npm run db:seed
 *
 * IMPORTANT: Settings are defined in puppet-master.config.ts
 * IMPORTANT: All translations come from DB only - no fallbacks!
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { scryptSync, randomBytes } from 'crypto'
import * as schema from './schema'
import { mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'
import { getSeedData } from '../../i18n/fallbacks'
import config from '../../app/puppet-master.config'

const DB_PATH = process.env.DATABASE_URL || './data/sqlite.db'

// Ensure data directory exists
const dir = dirname(DB_PATH)
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
}

// Create database connection
const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
const db = drizzle(sqlite, { schema })

// Password hashing (same as server/utils/password.ts)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function seed() {
  console.log('🌱 Seeding database...\n')

  // Check if admin user already exists - if not, create one
  const existingAdmin = db.select().from(schema.users).get()
  if (!existingAdmin) {
    const adminEmail = 'admin@example.com'
    const adminPassword = 'admin123' // Change in production!

    console.log('👤 Creating admin user...')
    db.insert(schema.users).values({
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      name: 'Admin',
      role: 'admin'
    }).run()
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}\n`)
  } else {
    console.log('👤 Admin user exists, skipping.\n')
  }

  // Create settings from config schema - ONLY if they don't exist
  // Uses raw SQL with INSERT OR IGNORE to preserve existing values
  console.log('⚙️  Syncing settings from config schema...')
  let settingsAdded = 0
  for (const setting of config.settings) {
    const result = sqlite.prepare(`
      INSERT OR IGNORE INTO settings (key, value, type, "group")
      VALUES (?, '', ?, ?)
    `).run(setting.key, setting.type, setting.group)

    if (result.changes > 0) {
      console.log(`   + ${setting.key} (new)`)
      settingsAdded++
    }
  }
  console.log(`   ${settingsAdded} new settings added, existing values preserved.\n`)

  // Seed translations - ONLY insert missing keys, never overwrite!
  // Uses raw SQL with INSERT OR IGNORE
  console.log('🌍 Syncing translations...')
  const translations = getSeedData()
  let translationsAdded = 0

  const now = Date.now()
  for (const t of translations) {
    const result = sqlite.prepare(`
      INSERT OR IGNORE INTO translations (locale, key, value, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(t.locale, t.key, t.value, now)

    if (result.changes > 0) {
      translationsAdded++
    }
  }

  console.log(`   ${translationsAdded} new translations added`)
  console.log(`   ${translations.length - translationsAdded} existing translations preserved`)

  // Count per locale
  const locales = [...new Set(translations.map(t => t.locale))]
  for (const locale of locales) {
    const count = translations.filter(t => t.locale === locale).length
    console.log(`   ${locale}: ${count} keys in seed`)
  }

  console.log('\n✅ Database sync complete! Existing values preserved.\n')
  sqlite.close()
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  sqlite.close()
  process.exit(1)
})

